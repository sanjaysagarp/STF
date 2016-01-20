//Controller for the admin page. 

var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var questions = require('../../config/metricsquestions');
var h = require('../helper')


module.exports = function(app) {
	app.use('/', router);
};


//Ensure that anyone asking for a '/admin' page is a logged in user, and is an 
//administrator of the site
router.all('/admin*', shib.ensureAuth('/login'), function(req, res, next) {
	if (res.locals.isAdmin) {
		res.locals.title = 'STF Administration'
		next();
	} else {
		h.displayErrorPage(res, 'You do not have permission to access this page', 'Access Denied');
	}
});


//display admin page
router.get('/admin', function(req, res) {
	res.render('admin/index');
});

router.get('/admin/users', function(req, res) {
	db.User.findAll().then(function(users) {
		res.render('admin/users',{
			users: users
		});
	});
});


//Receives data from the admin page. Depending on the requested action,
//follows through and changes site data.
router.post('/admin', function(req, res) {
	
	//Add or change a user's type
	if (req.body.addChange) {
		db.User.find({ where: { NetId: req.body.netId} })
		.then(function(user) {
			
			if (user) { //A user exists, update their type
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

			} else { //A user does not exist, create one
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

	//Remove a user and destroy all their user data (besides proposals)
	} else if (req.body.remove && req.body.sure) {
		db.User.find({ where: {NetId: req.body.netId} })
		.then(function(user) {

			if (user) { //Destroy the found user and user data
				db.Metrics.destroy({ where: {AuthorId: user.id} }) //delete metrics
				.then(function() {

					db.Partial.findAll({
						where: { AuthorId: user.id}
					}).then(function(partials) {
						var partialIds = []
						for (partial in partials) {
							partialIds.push(partials[partial].id);
						}
						db.Item.destroy({where: {partialId: partialIds} }); //delete items
						db.Partial.destroy({ where: {AuthorId: user.id}}); //delete partials
					})
					.then(db.Vote.destroy({ where: {VoterId: user.id} })) //delete votes
					.then(user.destroy()) //delete user
					.then(function() {
						res.render('admin/index', {
							subject: 'User Delete Successful',
							message: 'NetID ' + req.body.netId + ' and all relevant data has been deleted permanantly.'
						})
					})
				});	
				

			} else { //there is no user
				res.render('admin/index', {
					subject: 'Unknown NetID',
					message: 'NetID ' + req.body.netId + " was not found."
				});
			}
		});

	//jump to proposal edit page
	} else if (req.body.editProposal) {
		res.redirect('/proposals/update/' + req.body.proposalId);

	//something went wrong
	} else {
		res.render('admin/index', {
			subject: 'Malformed Request or Incorrect Data',
			message: 'The action you tried to take failed. No changes were made.'
		});
	}
});