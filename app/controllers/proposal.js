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


//redirect a lone proposals request to the browse page
router.get('/proposals', function(req, res, next) {
	res.redirect('proposals/browse');
});


//show the create a proposal page
router.get('/proposals/create', shib.ensureAuth('/login'), function createProposal(req, res) {
	getDepartments(function(departments) {
		res.render('proposals/create', {
			title: 'New Proposal',
			categories: categories,
			departments: departments
		});
	})
});

//display proposals tat the user has created
router.get('/proposals/myproposals', shib.ensureAuth('/login'), function myProposals(req, res) {
	db.Proposal.findAll({
		where: {
			PrimaryRegId : req.user.regId
		}
	}).then(function(proposals) {
		res.render('proposals/browse',{
			proposals: proposals,
			title: "My Proposals",
			categories: categories
		});
	});
});


//sign a proposal
router.post('/proposal/sign', shib.ensureAuth('/login'), function signProposal(req, res) {
	if (!req.body['id']) {
		h.displayErrorPage(res, 'Bad Page', 'Access Denied');
	} else {
		var ProposalId = req.body['id'];
		db.Proposal.find({
			where: {id: ProposalId} 
		}).then(function(proposal) {
			if (h.approvedEditor(res, req.user, proposal)) {

				var signed = false;
				if (proposal.DeanNetId == req.user.netId) {
					signed = true;
					proposal.update({DeanSignature: 1});
				} if (proposal.StudentNetId == req.user.netId) {
					signed = true;
					proposal.update({StudentSignature: 1});
				} if (proposal.BudgetNetId == req.user.netId) {
					signed = true;
					proposal.update({BudgetSignature: 1});
				}

				signed = (signed ? 'SignSuccess' : 'SignFailure');

				var finished = false;
				if (allSigned(proposal)) {
					finished = true;
				}

				res.json({
					message: signed,
					finished: finished
				})
			}
		})
	}
});


router.get('/proposal/submit/:id', shib.ensureAuth('/login'), function submitProposal(req, res) {
	db.Proposal.find({
		where: {id: req.params.id}
	}).then(function(proposal) {
		if (h.approvedEditor(res, req.user, proposal)) {
			if (allSigned) {
				proposal.update({
					Status: 1
				}).then(function() {
					res.redirect('/proposals/' + proposal.id);
				});
			} else {
				h.displayErrorPage(res, 'Not all signees have signed this proposal', 'Submittance Refused')
			}
		}
	})
});


//change a proposal's data
router.post('/proposals/:id', shib.ensureAuth('/login'), function postProposal(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {
		if (proposal.length == 0) {
			res.send(404);
		} if (h.approvedEditor(res, req.user, proposal)) {	

			var fromForm = {
				ProposalTitle: req.body["title"],
				Category: req.body["category"],
				Department: req.body["department"],
				PrimaryName: req.body["PrimaryName"],
				PrimaryTitle: req.body["primary-title"],
				PrimaryNetId: req.body["primary-netId"].toLowerCase(),
				PrimaryPhone: req.body["primary-phone"],
				PrimaryMail: req.body["primary-mail"],
				BudgetName: req.body["budget-name"],
				BudgetTitle: req.body["budget-title"],
				BudgetNetId: req.body["budget-netId"].toLowerCase(),
				BudgetPhone: req.body["budget-phone"],
				BudgetMail: req.body["budget-mail"],
				BudgetSignature: (proposal.BudgetNetId == req.body["budget-netId"] ? proposal.BudgetSignature : 0),
				DeanName: req.body["ddh-name"],
				DeanTitle: req.body["ddh-title"],
				DeanNetId: req.body["ddh-netId"].toLowerCase(),
				DeanPhone: req.body["ddh-phone"],
				DeanMail: req.body["ddh-mail"],
				DeanSignature: (proposal.DeanNetId == req.body["ddh-netId"] ? proposal.DeanSignature : 0),
				StudentName: req.body["stu-name"],
				StudentTitle: req.body["stu-title"],
				StudentNetId: req.body["stu-netId"].toLowerCase(),
				StudentPhone: req.body["stu-phone"],
				StudentMail: req.body["stu-mail"],
				StudentSignature: (proposal.StudentNetId == req.body["stu-netId"] ? proposal.StudentSignature : 0),
				Abstract: req.body["abstract"],
				CategoryJustification: req.body["CategoryJustification"],
				Background: req.body["Background"],
				Benefits: req.body["Benefits"],
				AccessRestrictions: req.body["AccessRestrictions"],
				Hours: req.body["Hours"],
				Days: req.body["Days"].toLowerCase(),
				DepartmentalResources: req.body["DepartmentalResources"],
				InstallationTimeline: req.body["InstallationTimeline"]
			}

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


//create a new proposal entry
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


//show all submitted and unclosed proposals
router.get('/proposals/browse', function(req, res) {
	db.Proposal.findAll({
		where: {
			Status: [1, 2, 3, 4, 5, 6]
		}
	}).then(function(proposals) {
		res.render('proposals/browse',{
			proposals: proposals,
			title: "Browse all Proposals",
			categories: categories
		});
	});
});


router.get('/proposals/category/:cat', function(req, res) {
	db.Proposal.findAll({
		where: {
			Category: req.params.cat,
			Status: [1, 2, 3, 4, 5, 6]
		}
	}).then(function(proposals) {
		if (categories[req.params.cat]) {
			res.render('proposals/browse', {
				proposals: proposals,
				title: categories[proposals[0].Category].name + ": Proposals",
				categories: categories
			});
		} else {
			h.displayErrorPage(res, 'The category specified could not be found', 'Unknown Category')
		}
	})
});

router.get('/proposals/department/:cat', function(req, res) {
	db.Proposal.findAll({
		where: {
			Department: req.params.cat,
			Status: [1, 2, 3, 4, 5, 6]
		}
	}).then(function(proposals) {
		if (proposals.length != 0) {
			res.render('proposals/browse', {
				proposals: proposals,
				title: proposals[0].Department + ": Proposals",
				categories: categories
			});
		} else {
			h.displayErrorPage(res, 'The department specified could not be found', 'Unknown Department')
		}
	})
});


//get the update page for a proposal
router.get('/proposals/update/:id', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {

		if (h.approvedEditor(res, req.user, proposal, false)) {

			db.Item.findAll({
				where: {
					ProposalId: req.params.id,
					PartialId: null
				}
			}).then(function(item){
				getDepartments(function(departments) {
					res.render('proposals/update', {
						title: 'Update Proposal ' + proposal.ProposalTitle,
						proposal: proposal,
						items: item,
						categories: categories,
						departments: departments
					});
				})
			});
		} else {
			if (proposal.Status == 1) {
				h.displayErrorPage(res, 'This proposal has been submitted and cannot be updated',
					"Access denied");
			} else {
				h.displayErrorPage(res, 'You do not have permission to edit that proposal',
					'Access denied');
			}
		}
	});
});


//Show the 'submitted' proposal view page
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

					//assign user ids to the partials they made
					var userIds = [];
					for (partial in partials) {
						userIds.push(partials[partial].AuthorId);
					}
					db.User.findAll({
						where: {
							id: userIds
						}
					}).then(function(usersRaw) {

						//re-orient data
						var users = {};
						for (userRaw in usersRaw) {
							users[usersRaw[userRaw].id] = usersRaw[userRaw];
						}

						//create written date
						var cr = new Date(proposal.createdAt);
						var months = ["January", "February", "March", "April", "May", "June", "July", 
						              "August", "September", "October", "November", "December"];
						var day = months[cr.getMonth()] +" "+ cr.getDate() +", "+ cr.getFullYear();
						var editor = false;
						var loggedIn = false;
						if (req.user) {
							editor = h.approvedEditor(res, req.user, proposal, false);
							loggedIn = true;
						}

						res.render('proposals/view', {
							title: proposal.ProposalTitle,
							proposal: proposal,
							partials: partials,
							users: users,
							created: day,
							items: items,
							loggedIn: loggedIn,
							endorsements: endorsements,
							categories: categories,
							editor: editor,
							status: h.proposalStatus(proposal.Status)
						});
					});
				});
			});
		});
	});
});


//get an endorsement for the proposal by the id specified
router.get('/proposals/endorsements/:id', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {
		res.render('proposals/writeendorsement', {
			title: 'Endorse ' + proposal.ProposalTitle,
			proposal: proposal
		});
	});
});


//create the endorsement for the specified proposal id
router.post('/proposals/endorsements/:id', shib.ensureAuth('/login'), function(req, res) {
	db.Endorsement.create({
		ProposalId: req.params.id,
		RegId: req.user.regId,
		NetId: req.user.netId,
		Name: req.user.givenName + " " + req.user.surname,
		Message: req.body.message,
	}).then(function(endorsement) {
		res.redirect('/proposals/' + req.params.id);
	});
});


function allSigned(proposal) {
	return (proposal.BudgetSignature == 1 &&
	        proposal.StudentSignature == 1 &&
	        proposal.DeanSignature == 1);
}

function getDepartments(next) {
	db.sequelize.query('SELECT DISTINCT Department FROM STF.Proposals ORDER BY Department ASC;')
	.spread(function(deps) {
		var departments = [];
		for(var i = 0; i < deps.length; i++) {
			departments.push(deps[i].Department);
		}
		next(departments);
	})
}