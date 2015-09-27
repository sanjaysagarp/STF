//displays a 
var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var h = require('../helper');


module.exports = function(app) {
	app.use('/', router);
};


router.get('/proposals', function(req, res, next) {
	res.render('proposals/index');
});

//WORKS
router.get('/proposals/create', shib.ensureAuth('/login'), function createProposal(req, res) {
	res.render('proposals/create', {
		categories: categories
	});
});

router.get('/proposals/myproposals', shib.ensureAuth('/login'), function myProposals(req, res) {
	db.Proposal.findAll({
		where: {
			PrimaryRegId : req.user.regId
		}
	}).then(function(proposals) {
		console.log(proposals);
		res.render('proposals/browse',{
			proposals: proposals,
			title: "My Proposals",
			categories: categories
		});
	});
});

//TODO check that the user is the right one
router.post('/proposals/:id', shib.ensureAuth('/login'), function postProposal(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {
		if (!proposal) {
			res.send(404);
		} if (h.approvedEditor(res, req.user, proposal)) {	

			var fromForm = {
				ProposalTitle: req.body["title"],
				Category: req.body["category"],
				Department: req.body["department"],
				PrimaryName: req.body["PrimaryName"],
				PrimaryTitle: req.body["primary-title"],
				PrimaryNetId: req.body["primary-netId"],
				PrimaryPhone: req.body["primary-phone"],
				PrimaryMail: req.body["primary-mail"],
				BudgetName: req.body["budget-name"],
				BudgetTitle: req.body["budget-title"],
				BudgetNetId: req.body["budget-netId"],
				BudgetPhone: req.body["budget-phone"],
				BudgetMail: req.body["budget-mail"],
				DeanName: req.body["ddh-name"],
				DeanTitle: req.body["ddh-title"],
				DeanNetId: req.body["ddh-netId"],
				DeanPhone: req.body["ddh-phone"],
				DeanMail: req.body["ddh-mail"],
				StudentName: req.body["stu-name"],
				StudentTitle: req.body["stu-title"],
				StudentNetId: req.body["stu-netId"],
				StudentPhone: req.body["stu-phone"],
				StudentMail: req.body["stu-mail"],
				Abstract: req.body["abstract"],
				CategoryJustification: req.body["CategoryJustification"],
				Background: req.body["Background"],
				Benefits: req.body["Benefits"],
				AccessRestrictions: req.body["AccessRestrictions"],
				Hours: req.body["Hours"],
				Days: req.body["Days"],
				DepartmentalResources: req.body["DepartmentalResources"],
				InstallationTimeline: req.body["InstallationTimeline"]
			}

			console.log(fromForm);
			console.log("Hours" + fromForm.Hours);
			if(fromForm.Hours===''){
				fromForm.Hours=0;
			}

			db.Proposal.update(fromForm, {
				where: {
					id: req.params.id
				}
			}).then(function(e) {
				res.json({
					message: "Success"
				});
			});
		} else {
			res.json({
				message: 'Failure'
			});
		}
	});
});



router.post('/proposals', shib.ensureAuth('/login'), function(req, res, next) {
	// Get our form values. These rely on the "name" attributes
	var ProposalTitle = req.body.title;
	var Category = req.body.category;
	var Department = req.body.department;
	//Contacts
	var PrimaryRegId = req.user.regId;
	var PrimaryNetId = req.user.netId;
	var PrimaryName = req.body["PrimaryName"];
	var PrimaryTitle = req.body["primary-title"];
	var PrimaryPhone = req.body["primary-phone"];
	var PrimaryMail = req.body["primary-mail"];
	var BudgetName = req.body["budget-name"];
	var BudgetTitle = req.body["budget-title"];
	var BudgetNetId = req.body["budget-netId"];
	var BudgetPhone = req.body["budget-phone"];
	var BudgetMail = req.body["budget-mail"];
	var DeanName = req.body["ddh-name"];
	var DeanTitle = req.body["ddh-title"];
	var DeanNetId = req.body["ddh-netId"];
	var DeanPhone = req.body["ddh-phone"];
	var DeanMail = req.body["ddh-mail"];
	var StudentName = req.body["stu-name"];
	var StudentTitle = req.body["stu-title"];
	var StudentNetId = req.body["stu-netId"];
	var StudentPhone = req.body["stu-phone"];
	var StudentMail = req.body["stu-mail"];
	var Abstract = req.body["abstract"];
	var CategoryJustification = req.body["CategoryJustification"];
	var Background = req.body["background"];
	var Benefits = req.body["Benefits"];
	var AccessRestrictions = req.body["AccessRestrictions"];
	var Hours = req.body["Hours"];
	if (Hours === '') {
		Hours = 0;
	}
	var Days = req.body["Days"];
	var DepartmentalResources = req.body["DepartmentalResources"];
	var InstallationTimeline = req.body["InstallationTimeline"];

	console.log("Creating Proposal");

	db.Proposal.create({
		ProposalTitle: ProposalTitle,
		Category: Category,
		Department: Department,
		PrimaryRegId: PrimaryRegId,
		PrimaryNetId: PrimaryNetId,
		PrimaryName: PrimaryName,
		PrimaryTitle: PrimaryTitle,
		PrimaryPhone: PrimaryPhone,
		PrimaryNetId: PrimaryNetId,
		PrimaryMail: PrimaryMail,
		BudgetName: BudgetName,
		BudgetTitle: BudgetTitle,
		BudgetPhone: BudgetPhone,
		BudgetNetId: BudgetNetId,
		BudgetMail: BudgetMail,
		DeanName: DeanName,
		DeanTitle: DeanTitle,
		DeanPhone: DeanPhone,
		DeanNetId: DeanNetId,
		DeanMail: DeanMail,
		StudentName: StudentName,
		StudentTitle: StudentTitle,
		StudentPhone: StudentPhone,
		StudentNetId: StudentNetId,
		StudentMail: StudentMail,
		Abstract: Abstract,
		Background: Background,
		CategoryJustification: CategoryJustification,
		Benefits: Benefits,
		AccessRestrictions: AccessRestrictions,
		Hours: Hours,
		Days: Days,
		DepartmentalResources: DepartmentalResources,
		InstallationTimeline: InstallationTimeline
	}).then(function(proposal) {
		res.redirect('/proposals/update/' + proposal.id);
	});
});


router.get('/proposals/browse', function(req, res, next) {
	console.log(db.Proposal);
	db.Proposal.findAll({
		where: {
			Status: [1, 2, 3, 4, 5]
		}
	}).then(function(proposals) {
		console.log(proposals);
		res.render('proposals/browse',{
			proposals: proposals,
			title: "Browse all Proposals",
			categories: categories
		});
	});
});



router.get('/proposals/update/:id', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {

		if (h.approvedEditor(res, req.user, proposal)) {

			db.Item.findAll({
				where: {
					ProposalId: req.params.id,
					PartialId: null
				}
			}).then(function(item){
				//console.log("item:");
				console.log(item)
				res.render('proposals/update', {
					proposal: proposal,
					items: item,
					categories: categories
				});
			});
		} else {
			if (proposal.Status == 1) {
				res.render('error', {
					message: 'This proposal has been submitted and cannot be updated',
					error: {status: "Access denied"}
				});
			} else {
				res.render('error', {
					message: 'You do not have permission to edit that proposal',
					error: {status: 'Access denied'}
				});
			}
		}
	});
});


router.get('/proposals/:id', function(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {
		db.Item.findAll({
			where: {
				ProposalId: req.params.id
			}
		}).then(function(items){
			db.Endorsement.findAll({
				where: {
					ProposalID: req.params.id
				}
			}).then(function(endorsements) {
				db.Partial.findAll({
					where: {
						ProposalId: req.params.id
					}
				}).then(function(partials) {
					var userIds = [];
					for (partial in partials) {
						userIds.push(partials[partial].AuthorId);
					}
					db.User.findAll({
						where: {
							id: userIds
						}
					}).then(function(usersRaw) {
						var users = {};
						for (userRaw in usersRaw) {
							users[usersRaw[userRaw].id] = usersRaw[userRaw];
						}

						var cr = new Date(proposal.createdAt);
						var months = ["January", "February", "March", "April", "May", "June", "July", 
						              "August", "September", "October", "November", "December"];
						var day = months[cr.getMonth()] +" "+ cr.getDate() +", "+ cr.getFullYear();
						console.log(partials);
						console.log(users)
						var editor = false;
						var loggedIn = false;
						if (req.user) {
							editor = h.approvedEditor(res, req.user, proposal, false);
							loggedIn = true;
						}

						res.render('proposals/view', {
							proposal: proposal,
							partials: partials,
							users: users,
							created: day,
							items: items,
							loggedIn: loggedIn,
							endorsements: endorsements,
							categories: categories,
							editor: editor
						});
					});
				});
			});
		});
	});
});

router.get('/proposals/endorsements/:id', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {
		res.render('proposals/writeendorsement', {
			proposal: proposal
		});
	});
});

router.post('/proposals/endorsements/:id', shib.ensureAuth('/login'), function(req, res) {
	console.log(req.body.message);
	console.log(req.user);
	db.Endorsement.create({
		ProposalID: req.params.id,
		RegId: req.user.regId,
		NetId: req.user.netId,
		Name: req.user.givenName + " " + req.user.surname,
		Message: req.body.message,
	}).then(function(proposal) {
		res.redirect('/proposals/' + req.params.id);
	});
});
