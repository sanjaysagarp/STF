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
		db.Admin.find({where: {id:1} })
		.then(function(settings) {
			res.render('proposals/create', {
				title: 'New Proposal',
				categories: categories,
				departments: departments,
				settings: settings
			});
		});
	});
});

//display proposals that the user has created
router.get('/proposals/myproposals', shib.ensureAuth('/login'), function myProposals(req, res) {
	db.Proposal.findAll({
		where: {
			$or : {
				//PrimaryRegId : req.user.regId,
				PrimaryNetId : req.user.netId.toLowerCase(),
				BudgetNetId : req.user.netId.toLowerCase(),
				DeanNetId : req.user.netId.toLowerCase(),
				StudentNetId : req.user.netId.toLowerCase(),
				AdditionalContactNetId1: req.user.netId.toLowerCase(),
				AdditionalContactNetId2: req.user.netId.toLowerCase(),
				AdditionalContactNetId3: req.user.netId.toLowerCase()
			}
		}
	}).then(function(proposals) {
		res.render('proposals/browse',{
			proposals: proposals,
			title: "My Proposals",
			categories: categories,
			myProposals: true
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
				} if (proposal.PrimaryNetId == req.user.netId) {
					signed = true;
					proposal.update({PrimarySignature: 1});
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

//CHANGE AFTER FUNDING CYCLE
// router.get('/proposal/submit/:year/:number', shib.ensureAuth('/login'), function submitProposal(req, res) {
// 	db.Proposal.find({
// 		where: {
// 			year: req.params.year,
// 			number: req.params.number
// 		}
// 	}).then(function(proposal) {
// 		if (h.approvedEditor(res, req.user, proposal)) {
// 			if (allSigned) {
// 				proposal.update({
// 					Status: 1
// 				}).then(function() {
// 					res.redirect('/proposals/' + proposal.year + "/" + proposal.number);
// 				});
// 			} else {
// 				h.displayErrorPage(res, 'Not all signees have signed this proposal', 'Submittance Refused')
// 			}
// 		}
// 	})
// });


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
			console.log(req.body['Background']); 

			var fromForm = {
				ProposalTitle: req.body["title"],
				Category: req.body["category"],
				Department: req.body["department"],
				FastTrack: (req.body["fastTrack"] == 'on' ? 1 : 0),
				UAC: (req.body["UAC"] == 'on' ? 1 : 0),
				PrimaryName: req.body["PrimaryName"],
				PrimaryTitle: req.body["primary-title"],
				PrimaryNetId: req.body["primary-netId"].toLowerCase(),
				PrimaryPhone: req.body["primary-phone"],
				PrimaryMail: req.body["primary-mail"],
				PrimarySignature: (proposal.PrimaryNetId == req.body["primary-netId"] ? proposal.PrimarySignature : 0),
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
				AdditionalContactName1: req.body["con1-name"],
				AdditionalContactNetId1: req.body["con1-netId"].toLowerCase(),
				AdditionalContactName2: req.body["con2-name"],
				AdditionalContactNetId2: req.body["con2-netId"].toLowerCase(),
				AdditionalContactName3: req.body["con3-name"],
				AdditionalContactNetId3: req.body["con3-netId"].toLowerCase(),
				Abstract: req.body["abstract"],
				Background: req.body["Background"],
				ProposalFeedback: req.body["ProposalFeedback"],
				StudentsEstimated: req.body["StudentsEstimated"],
				EstimateJustification: req.body["EstimateJustification"],
				ResearchScholarship: req.body["ResearchScholarship"],
				EducationalExperience: req.body["EducationalExperience"],
				CareerEnhancement: req.body["CareerEnhancement"],
				AccessRestrictions: req.body["AccessRestrictions"],
				Hours: req.body["Hours"].toLowerCase(),
				Days: req.body["Days"].toLowerCase(),
				Outreach: req.body["Outreach"],
				ProposalTimeline: req.body["ProposalTimeline"],
				HumanResources: req.body["HumanResources"],
				TechnologyResources: req.body["TechnologyResources"],
				FinancialResources: req.body["FinancialResources"]
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
	var AdditionalContactName1 = req.body["con1-name"];
	var AdditionalContactNetId1 = req.body["con1-netId"];
	var AdditionalContactName2 = req.body["con2-name"];
	var AdditionalContactNetId2 = req.body["con2-netId"];
	var AdditionalContactName3 = req.body["con3-name"];
	var AdditionalContactNetId3 = req.body["con3-netId"];

	var Abstract = req.body["abstract"];
	var Background = req.body["background"];
	var ProposalFeedback = req.body["ProposalFeedback"];
	var StudentsEstimated = req.body["StudentsEstimated"];
	var EstimateJustification = req.body["EstimateJustification"];
	var ResearchScholarship = req.body["ResearchScholarship"];
	var EducationalExperience = req.body["EducationalExperience"];
	var CareerEnhancement = req.body["CareerEnhancement"];
	var AccessRestrictions = req.body["AccessRestrictions"];
	var Hours = req.body["Hours"];
	if (Hours === '') {
		Hours = 0;
	}
	var Days = req.body["Days"];
	var Outreach = req.body["Outreach"];
	var ProposalTimeline = req.body["ProposalTimeline"];
	var HumanResources = req.body["HumanResources"];
	var TechnologyResources = req.body["TechnologyResources"];
	var FinancialResources = req.body["FinancialResources"];

	//need to find current number/year for proposal
	
	db.Admin.find({where: {id:1}})
	.then(function(settings) {
		db.Proposal.create({
			Year: settings.CurrentYear,
			Number: settings.CurrentNumber,
			ProposalTitle: ProposalTitle,
			Quarter: settings.CurrentQuarter,
			Category: Category,
			Department: Department,
			PrimaryRegId: PrimaryRegId,
			PrimaryNetId: PrimaryNetId,
			PrimaryName: PrimaryName,
			PrimaryTitle: PrimaryTitle,
			PrimaryPhone: PrimaryPhone,
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
			AdditionalContactName1: AdditionalContactName1,
			AdditionalContactNetId1: AdditionalContactNetId1,
			AdditionalContactName2: AdditionalContactName2,
			AdditionalContactNetId2: AdditionalContactNetId2,
			AdditionalContactName3: AdditionalContactName3,
			AdditionalContactNetId3: AdditionalContactNetId3,
			Abstract: Abstract,
			Background: Background,
			ProposalFeedback: ProposalFeedback,
			StudentsEstimated: StudentsEstimated,
			EstimateJustification: EstimateJustification,
			ResearchScholarship: ResearchScholarship,
			EducationalExperience: EducationalExperience,
			CareerEnhancement: CareerEnhancement,
			AccessRestrictions: AccessRestrictions,
			Hours: Hours,
			Days: Days,
			Outreach: Outreach,
			ProposalTimeline: ProposalTimeline,
			HumanResources: HumanResources,
			TechnologyResources: TechnologyResources,
			FinancialResources: FinancialResources
		})
		.then(function(proposal) {
			var newNumber = 1 + settings.CurrentNumber;
			settings.increment('CurrentNumber',{by:1})
			.then(function() {
				res.redirect('/proposals/update/' + proposal.Year + "/" + proposal.Number);
			});
		});
	});
});


//show all submitted and unclosed proposals
router.get('/proposals/browse', function(req, res) {
	db.Proposal.findAll({
		where: {
			Status: [1, 2, 3, 4, 5, 6]
		}
	}).then(function(proposals) {
		db.Legacy_Proposal.findAll({
			where: {
				Decision: ["Rejected","Funded","Partially Funded"]
			}
		}).then(function(legProposals) {
			legProposals.reverse();
			proposals.push.apply(proposals, legProposals);
			res.render('proposals/browse',{
				proposals: proposals,
				title: "Browse all Proposals",
				categories: categories
				});
		});
	});
});

//scale out for proposal browse after this year -- need to add compatability for legacy proposals
//so proposal authors don't get confuzzled
// router.get('/proposals/:year', function(req, res) {
// 	db.Proposal.findAll({
// 		where: {
// 			Status: [1, 2, 3, 4, 5, 6],
// 			Year: req.params.year
// 		}
// 	}).then(function(proposals) {
// 		res.render('proposals/browse',{
// 			proposals: proposals,
// 			title: "Browse all Proposals",
// 			categories: categories
// 		});
// 	});
// });

router.get('/proposals/category/:cat', function(req, res) {
	var cat = req.params.cat;
	switch(cat) {
		case "Computer Labs":
			cat = "L";
			break;
		case "Remote Computing":
			cat = "R";
			break;
		case "Machinery and Research":
			cat = "M";
			break;
		case "Collaborative":
			cat = "G";
			break;
		case "Portable":
			cat = "P";
			break;
		case "Frontier":
			cat = "F";
			break;
		case "Software":
			cat = "S";
			break;
		case "Software Development":
			cat = "D";
			break;
		default:
			break;
	}
	db.Proposal.findAll({
		where: {
			Category: cat,
			Status: [1, 2, 3, 4, 5, 6]
		}
	}).then(function(proposals) {
		db.Legacy_Proposal.findAll({
			where: {
				Category: categories[proposals[0].Category].name
			}
		})
		.then(function(legProposals) {
			legProposals.reverse();
			proposals.push.apply(proposals, legProposals);
			if (categories[cat]) {
				res.render('proposals/browse', {
					proposals: proposals,
					title: categories[proposals[0].Category].name + ": Proposals",
					categories: categories
				});
			} else {
				h.displayErrorPage(res, 'The category specified could not be found', 'Unknown Category')
			}
		});
		
	});
});

router.get('/proposals/department/:cat', function(req, res) {
	db.Proposal.findAll({
		where: {
			Department: req.params.cat,
			Status: [1, 2, 3, 4, 5, 6]
		}
	}).then(function(proposals) {
		//search through legacy proposals and add to list of proposals
		db.Legacy_Proposal.findAll({
			where: {
				Department: req.params.cat
			}
		})
		.then(function(legProposals) {
			legProposals.reverse();
			proposals.push.apply(proposals, legProposals);
			if (proposals.length != 0) {
				res.render('proposals/browse', {
					proposals: proposals,
					title: proposals[0].Department + ": Proposals",
					categories: categories
				});
			} else {
				h.displayErrorPage(res, 'The department specified could not be found', 'Unknown Department')
			}
		});
	});
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
					db.Admin.find({where: {id:1}})
					.then(function(settings) {
						res.render('proposals/update', {
							title: 'Update Proposal ' + proposal.ProposalTitle,
							proposal: proposal,
							items: item,
							categories: categories,
							departments: departments,
							settings: settings
						});
					});
				});
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

//renders update page by proposal year and number
router.get('/proposals/update/:year/:number', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			Year: req.params.year,
			Number: req.params.number
		}
	}).then(function(proposal) {

		if (h.approvedEditor(res, req.user, proposal, false)) {

			db.Item.findAll({
				where: {
					ProposalId: proposal.id,
					PartialId: null
				}
			}).then(function(item){
				getDepartments(function(departments) {
					db.Admin.find({where: {id:1}})
					.then(function(settings) {
						res.render('proposals/update', {
							title: 'Update Proposal ' + proposal.ProposalTitle,
							proposal: proposal,
							items: item,
							categories: categories,
							departments: departments,
							settings: settings
						});
					});
				});
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
					var userPartialIds = [];
					for (partial in partials) {
						userPartialIds.push(partials[partial].AuthorId);
					}
					//Implement supplemental after partials
					db.Supplemental.findAll({
						where : {
							ProposalId: req.params.id
						}
					}).then(function(supplementals) {
						//need to get users of supplementals (creators)
						var userSupplementalIds = [];
						for (supplemental in supplementals) {
							userSupplementalIds.push(supplementals[supplemental].AuthorId);
						}
						db.User.findAll({
							where : {
								id: userSupplementalIds
							}
						}).then(function(usersSupplementalRaw) {
							// re-orient data (supplementals)
							var usersSupplemental = {};
							for(userSupplementalRaw in usersSupplementalRaw) {
								usersSupplemental[usersSupplementalRaw[userSupplementalRaw].id] = usersSupplementalRaw[userSupplementalRaw];
							}
							db.User.findAll({
								where: {
									id: userPartialIds
								}
							}).then(function(usersPartialRaw) {
								db.Award.find({
									where: {
										ProposalId: req.params.id
									}
								}).then(function(award) {
									//re-orient data
									db.Rejection.find({
										where: {
											ProposalId: req.params.id
										}
									}).then(function(rejection) {
										var usersPartial = {};
										for (userPartialRaw in usersPartialRaw) {
											usersPartial[usersPartialRaw[userPartialRaw].id] = usersPartialRaw[userPartialRaw];
										}
										db.Report.findAll({
											where: {
												ProposalId: proposal.id
											}
										}).then(function(rawReports) {
											var reports = [];
											for(rawReport in rawReports) {
												reports.push(rawReports[rawReport]);
											}
											//create written date
											var cr = new Date(proposal.createdAt);
											var months = ["January", "February", "March", "April", "May", "June", "July", 
														"August", "September", "October", "November", "December"];
											var day = months[cr.getMonth()] +" "+ cr.getDate() +", "+ cr.getFullYear();
											var editor = false;
											var reporter = false;
											var loggedIn = false;
											if (req.user) {
												editor = h.approvedEditor(res, req.user, proposal, false);
												reporter = h.approvedReporter(res, req.user, proposal, false);
												loggedIn = true;
											}

											res.render('proposals/view', {
												title: proposal.ProposalTitle,
												proposal: proposal,
												partials: partials,
												supplementals: supplementals,
												usersPartial: usersPartial,
												usersSupplemental: usersSupplemental,
												created: day,
												items: items,
												loggedIn: loggedIn,
												endorsements: endorsements,
												categories: categories,
												editor: editor,
												reporter: reporter,
												award: award,
												status: h.proposalStatus(proposal.Status),
												rejection: rejection,
												reports: reports
											});
										
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});

//id can also be 13-1 for past revisions, so you're gonna have to splice and parse the string
router.get('/proposals/:year/:number', function(req, res) {
	db.Proposal.find({
		where: {
			Number: req.params.number,
			Year: req.params.year
		}
	}).then(function(proposal) {
		//if there is no proposal found, we need to check the legacy proposals
		if(!proposal) {
			var num = req.params.number.split('-');
			//revision value is not given, so we get revision 1 by default
			if(num.length < 2) {
				num[1] = 1;
			}
			db.Legacy_Proposal.find({
				where : {
					Year: req.params.year,
					Number: num[0],
					Revision: num[1],
				}
			})
			.then(function(legProposal) {
				//proposal found, need to get legacy items
				if(legProposal) {
					db.Legacy_Item.findAll({
						where: {
							ProposalId: legProposal.id
						}
					})
					.then(function(items) {
						//gets all items associated with proposal
						//need to correctly orient items (funded, supplemental, original)
						if(items.length > 0) {
							var SupplementalItems = [];
							var OriginalItems = [];
							var FundedItems = [];
							for(item in items) {
								//supplementals acted as partials
								if(items[item].Supplemental == 1) {
									SupplementalItems.push(items[item]);
								} else {
									OriginalItems.push(items[item]);
								}
								
								//get funded items in its own array
								if(items[item].Approved == 1 && items[item].Removed != 1) {
									FundedItems.push(items[item]);
								}
							}
							
							var cr = new Date(legProposal.SubmittedDate);
							var months = ["January", "February", "March", "April", "May", "June", "July", 
										"August", "September", "October", "November", "December"];
							var day = months[cr.getMonth()] +" "+ cr.getDate() +", "+ cr.getFullYear();
							
							//Reorient legacy data to fit current website dynamics
							var status = 0;
							if(legProposal.Decision == "Not Funded") {
								status = 6;
							} else if (legProposal.Decision == "Partially Funded") {
								status = 5;
							} else if (legProposal.Decision == "Funded") {
								status = 4
							}
							
							
							var funded = !(legProposal.Decision == "Not Funded");
							//render the proposal_legacy page
							res.render('proposals/view_legacy', {
								title: legProposal.Title,
								proposal: legProposal,
								supplementalItems: SupplementalItems,
								fundedItems: FundedItems,
								originalItems: OriginalItems,
								submitted: day,
								items: OriginalItems,
								funded: funded,
								status: "<div class='text-center status-wrap status-" + status + 
					"'><p><b>" + legProposal.Decision + "</b></p></div>"
							});
						} else {
							//item not found from proposalid, so it is a 2012+ proposal
							//will only retrieve originalItems
							db.Legacy_Item.findAll({
								where: {
									LegacyId: legProposal.LegacyId
								}
							})
							.then(function(items2) {
								//if items aren't found, display error page
								var SupplementalItems = [];
								var OriginalItems = [];
								var FundedItems = [];
								for(item in items2) {
									//supplementals and partials are interchanagable for legacy view
									if(items2[item].ObjectId == legProposal.OriginalSupplementalId) {
										OriginalItems.push(items2[item]);
									} else if (items2[item].SupplementalItemId != null){
										SupplementalItems.push(items2[item]);
									} else if (items2[item].PartialItemId != null) {
										SupplementalItems.push(items2[item]);
									} else {
										if(items2[item].Approved == 1 && items2[item].Quantity != 0) {
											FundedItems.push(items2[item]);
										}
									}
									
									if(items2[item].ObjectId == legProposal.PartialId) {
										FundedItems.push(items2[item]);
									}
								}
								var cr = new Date(legProposal.SubmittedDate);
								var months = ["January", "February", "March", "April", "May", "June", "July", 
											"August", "September", "October", "November", "December"];
								var day = months[cr.getMonth()] +" "+ cr.getDate() +", "+ cr.getFullYear();
								
								//Reorient legacy data to fit current website dynamics
								var status = 0;
								if(legProposal.Decision == "Not Funded") {
									status = 6;
								} else if (legProposal.Decision == "Partially Funded") {
									status = 5;
								} else if (legProposal.Decision == "Funded") {
									status = 4
								}
								
								var funded = !(legProposal.Decision == "Not Funded");
								if(legProposal.Decision == "Funded" && FundedItems.length < 1) {
									FundedItems = OriginalItems;
								}
								//render the proposal_legacy page
								res.render('proposals/view_legacy', {
									title: legProposal.Title,
									proposal: legProposal,
									supplementalItems: SupplementalItems,
									fundedItems: FundedItems,
									originalItems: OriginalItems,
									submitted: day,
									items: OriginalItems,
									funded: funded,
									status: "<div class='text-center status-wrap status-" + status +
						"'><p><b>" + legProposal.Decision + "</b></p></div>"
								});
								
							});
						}
				});
				} else {
					h.displayErrorPage(res, 'Proposal not found!', "Not Found");
				}
			});
			
			
		} else {
			//Proposal was found and we can display the information correctly
			db.Item.findAll({
			where: {
				ProposalId: proposal.id
			}
			}).then(function(items){
				db.Endorsement.findAll({
					where: {
						ProposalID: proposal.id
					}
				}).then(function(endorsements) {
					db.Partial.findAll({
						where: {
							ProposalId: proposal.id
						}
					}).then(function(partials) {

						//assign user ids to the partials they made
						var userPartialIds = [];
						for (partial in partials) {
							userPartialIds.push(partials[partial].AuthorId);
						}
						//Implement supplemental after partials
						db.Supplemental.findAll({
							where : {
								ProposalId: proposal.id
							}
						}).then(function(supplementals) {
							//need to get users of supplementals (creators)
							var userSupplementalIds = [];
							for (supplemental in supplementals) {
								userSupplementalIds.push(supplementals[supplemental].AuthorId);
							}
							db.User.findAll({
								where : {
									id: userSupplementalIds
								}
							}).then(function(usersSupplementalRaw) {
								// re-orient data (supplementals)
								var usersSupplemental = {};
								for(userSupplementalRaw in usersSupplementalRaw) {
									usersSupplemental[usersSupplementalRaw[userSupplementalRaw].id] = usersSupplementalRaw[userSupplementalRaw];
								}
								db.User.findAll({
									where: {
										id: userPartialIds
									}
								}).then(function(usersPartialRaw) {
									db.Award.find({
										where: {
											ProposalId: proposal.id
										}
									}).then(function(award) {
										//re-orient data
										db.Rejection.find({
											where: {
												ProposalId: proposal.id
											}
										}).then(function(rejection) {
											var usersPartial = {};
											for (userPartialRaw in usersPartialRaw) {
												usersPartial[usersPartialRaw[userPartialRaw].id] = usersPartialRaw[userPartialRaw];
											}
											db.Report.findAll({
												where: {
													ProposalId: proposal.id
												}
											})
											.then(function(rawReports) {
												var reports = [];
												for(rawReport in rawReports) {
													reports.push(rawReports[rawReport]);
												}
												//create written date
												var cr = new Date(proposal.createdAt);
												var months = ["January", "February", "March", "April", "May", "June", "July", 
															"August", "September", "October", "November", "December"];
												var day = months[cr.getMonth()] +" "+ cr.getDate() +", "+ cr.getFullYear();
												var editor = false;
												var reporter = false;
												var loggedIn = false;
												if (req.user) {
													editor = h.approvedEditor(res, req.user, proposal, false);
													reporter = h.approvedReporter(res, req.user, proposal, false);
													loggedIn = true;
												}

												res.render('proposals/view', {
													title: proposal.ProposalTitle,
													proposal: proposal,
													partials: partials,
													supplementals: supplementals,
													usersPartial: usersPartial,
													usersSupplemental: usersSupplemental,
													created: day,
													items: items,
													loggedIn: loggedIn,
													endorsements: endorsements,
													categories: categories,
													editor: editor,
													reporter: reporter,
													award: award,
													status: h.proposalStatus(proposal.Status),
													rejection: rejection,
													reports: reports
												});
											
											});
										});
									});
								});
							});
						});
					});
				});
			});
		}
		
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
	        proposal.PrimarySignature == 1 &&
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