var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var questions = require('../../config/metricsquestions');

module.exports = function(app) {
	app.use('/', router);
};

router.all('/admin*', shib.ensureAuth('/login'), function(req, res, next) {
	if (res.locals.isAdmin) {
		next();
	} else {
		res.render('error', {
			message: 'You do not have permission to view this page',
			error: {status: 'access denied'}
		});
	}
})

router.get('/admin', function(req, res) {
	res.render('admin/index');
});

router.post('/admin', function(req, res) {
	
	//Add or change a user
	if (req.body.addChange) {
		db.User.find({
			where: {
				NetId: req.body.netId
			}
		}).then(function(user) {
			if (user) {
				user.updateAttributes({
					Permissions: req.body.permissions
				}).then(function() {
					
					var status
					switch (req.body.permissions) {
						case 0:
							status = "disabled.";
						case 1:
							status = "basic.";
						case 2:
							status = "admin.";
					}

					res.render('admin/index', {
						subject: 'User Update Successful',
						message: 'NetID ' + req.body.netId + ' has been set to ' + status
					});
				});
			} else {
				db.User.create({
					NetId: req.body.netId,
					Permissions: req.body.permissions
				}).then(function() {
					res.render('admin/index', {
						subject: 'User Creation Successful',
						message: 'NetID ' + req.body.netId + ' has been added as a' + ((req.body.permissions - 1) ? 'n admin.' : ' basic user.')
					})
				})
			}
		})

	//Remove a user
	} else if (req.body.remove && req.body.sure) {
		db.User.find({
			where: {
				NetId: req.body.netId
			}
		}).then(function(user) {
			if (user) {
				db.Metrics.destroy({
					where: {
						AuthorId: user.id
					}
				})
				.then(user.destroy())
				.then(res.render('admin/index', {
						subject: 'User Delete Successful',
						message: 'NetID ' + req.body.netId + ' and all relevant data has been deleted permanantly.'
					})
				)	
			} else {
				res.render('admin/index', {
					subject: 'Unknown NetID',
					message: 'NetID ' + req.body.netId + " was not found."
				})
			}
		})

	//jump to proposal edit page
	} else if (req.body.editProposal) {
		res.redirect('proposals/update/' + req.body.proposalId);

	//something went wrong
	} else {
		res.render('admin/index', {
			subject: 'Malformed Request or Incorrect Data',
			message: 'The action you tried to take failed. No changes were made.'
		});
	}
})