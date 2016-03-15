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

//display award creation page
router.get('/admin/award', function(req, res) {
	res.render('admin/award');
});



//display a view of all users and permissions
router.get('/admin/users', function(req, res) {
	db.User.findAll().then(function(users) {
		res.render('admin/users',{
			users: users
		});
	});
});

//add/changes permissions for a user with a valid NetId
router.post('/admin/addChange', function(req, res) {
	if (req.body.netIdAddChange) {
		db.User.find({ where: { NetId: req.body.netIdAddChange} })
		.then(function(user) {
			
			if (user) { //A user exists, update their type
				user.updateAttributes({
					Permissions: req.body.permissions
				})
				.then(function() {
					var status
					switch (req.body.permissions) {
						case 0:
							status = "disabled.";
						case 1:
							status = "basic.";
						case 2:
							status = "admin.";
					}
					res.send({message: "NetID permissions updated"});
				});

			} else { //A user does not exist, create one
				db.User.create({
					NetId: req.body.netIdAddChange,
					Permissions: req.body.permissions
				})
				.then(function() {
					res.send({message: "NetID added and permissions updated"});
				})
			}
		})
	} else {
		res.send({message: "Enter a vald NetID"});
	}
});

//removes user and all relevant data EXCEPT SUPPLEMENTALS -- NEED TO IMPLEMENT
router.post('/admin/userRemove', function(req, res) {
	if (req.body.sure == "1") {
		db.User.find({ where: {NetId: req.body.netIdUserRemove} })
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
						res.send({message:"User deleted"});
					})
				});	
				

			} else { //there is no user
				res.send({message: "Invalid NetID"});
				
			}
		});
	} else {
		res.send({message:"Confirm deletion"});
	}
});

//Renders a proposal edit page for admins
router.get('/admin/editProposal', function(req, res) {
	if(req.query.proposalId && req.query.proposalId > 0) {
		db.Proposal.find({where: {id: req.query.proposalId}})
		.then(function(proposal) {
			if(proposal) {
				res.send({message:"redirect"});
			} else {
				res.send({message:"proposal number invalid"});
			}
		})
		
	} else {
		res.send({message:"empty box"});
	}
});