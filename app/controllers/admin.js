//Controller for the admin page. 

var promise = require('bluebird');
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var questions = require('../../config/metricsquestions');
var h = require('../helper');
var moment = require('moment');
var awardDetails = require('../../config/awarddetails');


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
	db.Admin.find({ where: {id: 1} })
	.then(function(settings) {
		res.render('admin/index', {
			settings: settings
		});
	});
});

//display award creation page
router.get('/admin/award', function(req, res) {
	var awardDate = moment().format();
	var budgetMonth = moment().month(awardDetails.BudgetMonth).format('MMMM YYYY');
	var oversightStartDate = moment().month(awardDetails.OversightStartMonth).add(3, 'years').format('YYYY');
	var oversightEndDate = moment().month(awardDetails.OversightEndMonth).add(7, 'years').format('YYYY');
	
	awardDate = moment(awardDate).format('MMMM Do YYYY');
	oversightStartDate = moment(new Date(oversightStartDate)).format('MMMM YYYY');
	oversightEndDate = moment(new Date(oversightEndDate)).format('MMMM YYYY');
	res.render('admin/award', {
		title: "STF Admin",
		awardDate: awardDate,
		budgetMonth: awardDetails.BudgetMonth,
		oversightStartDate: oversightStartDate,
		oversightEndDate: oversightEndDate,
	});
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
		res.send({message: "Enter a valid NetID"});
	}
});

//Change status of proposal
router.post('/admin/proposalChange', function(req, res) {
	if (req.body.proposalChangeId) {
		db.Proposal.find({ where: { id: req.body.proposalChangeId} })
		.then(function(proposal) {
			
			if (proposal) { //A proposal exists - update status
				proposal.updateAttributes({
					Status: req.body.proposalStatus
				})
				.then(function() {
					var num = parseInt(req.body.proposalStatus);
					var status;
					switch(num) {
						case 0:
							status = "\"Working Proposal\""
							break;
						case 1:
							status = "\"Submitted Proposal\""
							break;
						case 6:
							status = "\"Not Funded\""
							break;
						case 8:
							status = "\"Cancelled\""
							break;
					}
					res.send({message: "Proposal " + req.body.proposalChangeId + " status has been updated to " + status });
				});

			} else {
				
				res.send({message: "Proposal does not exist!"});
			}
		})
	} else {
		res.send({message: "Enter a valid ProposalID"});
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

//update proposal settings (open/close submissions for rfp). Retrieves true and false data under parser
//(submissions / fastrack)
router.post('/admin/updateSettings', function(req, res) {
	var submissions, fasttrack;
	if(req.body.submissions == 'true') {
		submissions = 1;
	} else {
		submissions = 0;
	}
	if(req.body.fasttrack == 'true') {
		fasttrack = 1;
	} else {
		fasttrack = 0;
	}
	db.Admin.find({
		where: {id: 1}
	})
	.then(function(settings) {
		if(settings) {
			settings.updateAttributes({
				ProposalSubmissions: submissions,
				FastTrack: fasttrack,
				updatedAt: Date.now
			})
			.then(function() {
				res.send({message:"updated"});
			});
		} else {
			res.send({message:"Somethings went wrong, try again."});
		}
	});
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