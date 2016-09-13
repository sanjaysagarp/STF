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
//var awardDetails = require('../../config/awarddetails');
var gmConfig = require('../../config/google'); //google key

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
	res.render('admin/award', {
		title: "STF Admin"
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

//Change quarter for proposal submission
router.post('/admin/changeQuarter', function(req, res) {
	db.Admin.find({ where: {id: 1}})
	.then(function(settings) {
		settings.updateAttributes({
			CurrentQuarter: req.body.quarter
		})
		.then(function() {
			res.send({message: "Quarter has been updated to " + req.body.quarter });
		});
	})
});

//Change status of proposal
router.post('/admin/proposalChange', function(req, res) {
	if (req.body.proposalChangeYear && req.body.proposalChangeNumber) {
		db.Proposal.find({ where: { 
			Number: req.body.proposalChangeNumber,
			Year: req.body.proposalChangeYear
		} })
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
					res.send({message: "Proposal " + req.body.proposalChangeYear + '-' + req.body.proposalChangeNumber + " status has been updated to " + status });
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


//updates the admin settings to progress a year and reset numbers for rfp
router.post('/admin/resetYear', function(req, res) {
	if (req.body.sure == "1") {
		db.Admin.find({ where: {id: 1}})
		.then(function(settings) {
			var currentYear = settings.CurrentYear + 1;
			settings.updateAttributes({
				CurrentYear: currentYear,
				CurrentNumber: 1
			})
			.then(function() {
				res.send({message: "updated"});
			});
		});
	} else {
		res.send({message:"Confirm deletion"});
	}
});

//update proposal settings (open/close submissions for rfp). Retrieves true and false data under parser
//(submissions)
router.post('/admin/updateSettings', function(req, res) {
	var submissions, fasttrack;
	if(req.body.submissions == 'true') {
		submissions = 1;
	} else {
		submissions = 0;
	}
	db.Admin.find({
		where: {id: 1}
	})
	.then(function(settings) {
		if(settings) {
			settings.updateAttributes({
				ProposalSubmissions: submissions,
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
	if(req.query.proposalEditNumber && req.query.proposalEditYear) {
		db.Proposal.find({
			where: {
				Number: req.query.proposalEditNumber,
				Year: req.query.proposalEditYear
			}
		})
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


//displays location changer for departments
router.get('/admin/departments', function(req, res) {
	getAllDepartmentsLocation(function(departments) {
		res.render('admin/departments', {
			title: "Departments",
			departments: departments,
			mapKey: gmConfig.key
		});
	});
});

//creates/updates department default location
router.post('/v1/update/department', function(req, res) {
	db.Department.find({
		where : {
			Name: req.body.department
		}
	})
	.then(function(department) {
		if(department) {
			//update location of existing department --TODO
			department.update({
				Address: req.body.address,
				Lat: req.body.latitude,
				Lng: req.body.longitude
			})
			.then(function() {
				res.send({message:"updated"});
			});
		} else {
			//create a new department/location entry --TODO
			db.Department.create({
				Name: req.body.department,
				Address: req.body.address,
				Lat: req.body.latitude,
				Lng: req.body.longitude
			})
			.then(function() {
				res.send({message:"updated"});
			});
		}

	});
});

//Gets all departments from both legacy and current proposal tables, as well as location
function getAllDepartmentsLocation(next) {
	db.sequelize.query('SELECT Department, d.id, d.Address, d.Lat, d.Lng FROM (SELECT DISTINCT lp.Department FROM STF.Legacy_Proposals lp LEFT JOIN (SELECT p.Department FROM STF.Proposals p) p ON lp.Department = p.Department WHERE lp.Department IS null OR p.Department IS null UNION SELECT DISTINCT lp.Department FROM STF.Proposals lp LEFT JOIN (SELECT p.Department FROM STF.Legacy_Proposals p) p ON lp.Department = p.Department WHERE lp.Department IS null OR p.Department IS null UNION SELECT DISTINCT lp.Department FROM STF.Proposals lp JOIN (SELECT p.Department FROM STF.Legacy_Proposals p) p ON lp.Department = p.Department) Dept LEFT JOIN (SELECT * FROM STF.Departments d) d on Dept.Department = d.Name WHERE Department is not null ORDER BY Department ASC;')
	.spread(function(deps) {
		var departments = [];
		for(var i = 0; i < deps.length; i++) {
			var dept = {};
			dept.Department = deps[i].Department;
			dept.Address = deps[i].Address;
			dept.Lat = deps[i].Lat;
			dept.Lng = deps[i].Lng;
			departments.push(dept);
		}
		next(departments);
	})
}