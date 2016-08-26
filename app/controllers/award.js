//controller for award letters
//need to grab: Proposal Title and Id, Date of award letter creation, reportType (0 for quarterly, 1 for anually, 2 for both), total funded amount
var express = require('express');
var	router = express.Router();
var shib = require('passport-uwshib');
var db = require('../models');
var h = require('../helper');
var moment = require('moment');
var awardDetails = require('../../config/awarddetails');

module.exports = function(app) {
	app.use('/', router);
};

//finds award letter if exists and renders page
router.get('/proposals/award/:id', function(req, res) {
	//get whether the proposal is computer lab or not
	//get primaryuser
	//need to create view for this and create schema for awards
	//check if an award exists for this proposal
	db.Award.find({
		where: {
			ProposalId: req.params.id
		}
	})
	.then(function(award) {
		//if award is found, display as it is. If not, display legacy proposal information
		db.Proposal.find({
			where: {
				id: req.params.id
			}
		})
		.then(function(proposal) {
			//format dates
			if(award){
				var awardDate = moment.utc(award.AwardDate).format('MMMM Do[,] YYYY');
				var budgetMonth = moment.utc(award.BudgetDate).format('MMMM YYYY');
				var oversightOver = moment.utc(award.OversightOver).format('MMMM YYYY');
				var oversightUnder = moment.utc(award.OversightUnder).format('MMMM YYYY');
				var quarterly = [];
				var annual = [];
				// 0 - quarterly, 1 - annual, 2 - both
				if (award.ReportType == 0 || award.ReportType == 2) {
					quarterly.push(moment.utc(award.QuarterlyDate1).format('MMMM D[,] YYYY'));
					quarterly.push(moment.utc(award.QuarterlyDate2).format('MMMM D[,] YYYY'));
					quarterly.push(moment.utc(award.QuarterlyDate3).format('MMMM D[,] YYYY'));
				}
				
				if (award.ReportType == 1 || award.ReportType == 2) {
					annual.push(moment.utc(award.AnnualDate).format('MMMM D[,] YYYY'));
				}
				var total = award.FundedAmount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				res.render('proposals/award', {
					title: "Award Letter",
					proposal: proposal,
					award: award,
					awardDate: awardDate,
					budgetMonth: budgetMonth,
					oversightOver: oversightOver,
					oversightUnder: oversightUnder,
					annual: annual,
					quarterly: quarterly,
					total: total
				});
			} else {
				h.displayErrorPage(res, 'Award does not exist',
					"Not Found");
			}
		});
	})
	.catch(function(err) {
		console.log(err);
		h.displayErrorPage(res, 'There is no award found for this proposal', 'Award not found!');
	});
});

//finds award letter if exists and renders page
router.get('/proposals/award/:year/:number', function(req, res) {
	//get whether the proposal is computer lab or not
	//get primaryuser
	//need to create view for this and create schema for awards
	//check if an award exists for this proposal
	db.Proposal.find({
		where: {
			Number: req.params.number,
			Year: req.params.year
		}
	})
	.then(function(proposal) {
		
		if(proposal) {
			db.Award.find({
				where: {
					ProposalId: proposal.id
				}
			})
			.then(function(award) {
				//if award is found, display as it is. If not, display legacy proposal information
				if(award) {
					db.Proposal.find({
						where: {
							id: proposal.id
						}
					})
					.then(function(proposal) {
						//format dates
						var awardDate = moment.utc(award.AwardDate).format('MMMM Do YYYY');
						var budgetMonth = moment.utc(award.BudgetDate).format('MMMM YYYY');
						var oversightOver = moment.utc(award.OversightOver).format('MMMM YYYY');
						var oversightUnder = moment.utc(award.OversightUnder).format('MMMM YYYY');
						var quarterly = [];
						var annual = [];

						if (award.ReportType == 0 || award.ReportType == 2) {
							quarterly.push(moment.utc(award.QuarterlyDate1).format('MMMM D[,] YYYY'));
							quarterly.push(moment.utc(award.QuarterlyDate2).format('MMMM D[,] YYYY'));
							quarterly.push(moment.utc(award.QuarterlyDate3).format('MMMM D[,] YYYY'));
						}
						
						if (award.ReportType == 1 || award.ReportType == 2) {
							annual.push(moment.utc(award.AnnualDate).format('MMMM D[,] YYYY'));
						}
						var total = award.FundedAmount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						res.render('proposals/award', {
							title: "Award Letter",
							proposal: proposal,
							award: award,
							awardDate: awardDate,
							budgetMonth: budgetMonth,
							quarterly: quarterly,
							annual: annual,
							budgetCloseDate: moment.utc(award.BudgetCloseDate).format('MMMM D[,] YYYY'),
							oversightOver: oversightOver,
							oversightUnder: oversightUnder,
							total: total
						});
					});
				} else {
					//Search for proposal on legacy
					h.displayErrorPage(res, 'Award does not exist',
						"Not Found");
				}
			});
		} else {
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
				//need separate legacy_award view page to render
				res.render('proposals/award_legacy', {
					title: "Award Letter",
					proposal: legProposal
				});
			});
		}
	});
});

//finds rejection letter if exists and renders page
router.get('/proposals/rejection/:id', function(req, res) {
	db.Admin.find({where: {id:1}})
	.then(function(settings) {
		res.redirect('/proposals/rejection/' + settings.CurrentYear + '/' + req.params.id);
	});
});

//finds rejection letter if exists and renders page
router.get('/proposals/rejection/:year/:number', function(req, res) {
	db.Proposal.find({
		where: {
			Year: req.params.year,
			Number: req.params.number
		}
	})
	.then(function(proposal) {
		if(proposal) {
			db.Rejection.find({
				where: {
					ProposalId: proposal.id
				}
			})
			.then(function(rejection) {
				if(rejection) {
					var rejectionDate = moment(new Date(rejection.createdAt)).format('MMMM Do[,] YYYY');
					res.render('proposals/rejection', {
						title: "Rejection Letter",
						proposal: proposal,
						rejection: rejection,
						rejectionDate: rejectionDate
					});
				} else {
					h.displayErrorPage(res, 'Rejection letter does not exist',
						"Not Found");
				}
			});
		} else {
		h.displayErrorPage(res, 'Rejection letter does not exist',
						"Not Found");
		}
	});
});

//Creates a rejection letter
router.post('/admin/rejection', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			Number: req.body.rejectionProposalNumber,
			Year: req.body.rejectionProposalYear
		}
	})
	.then(function(proposal) {
		//console.log(proposal);
		db.Award.find({
			where: {
				ProposalId: proposal.id
			}
		}).then(function(award) {
			// this proposal has already been awarded
			if(award) {
				res.send({message:"Award exists"});
			} else {
				db.Rejection.find({
					where: {
						ProposalId: proposal.id
					}
				})
				.then(function(r) {
					if(r) {
						res.send({message:"Duplicate"});
					} else {
						db.Rejection.create({
							ProposalId: proposal.id,
							Notes: req.body.rejectionNotes,
							createdAt: moment().format()
						})
						.then(function(rejection) {
							db.Proposal.update({
								LetterStatus: 2
							}, {
								where: {
									id: proposal.id
								}
							})
							.then(function(e) {
								res.send({message: "Success"});
							});
						});
					}
				});
			}
		});
	});
});

//creates an award letter by proposalid and quarterly/annual field
router.post('/admin/award', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			Number: req.body.awardProposalNumber,
			Year: req.body.awardProposalYear
		}
	}).then(function(proposal) {
		if(proposal) {
			db.Award.find({
				where: {
					ProposalId: proposal.id
				}
			})
			.then(function(award) {
				//If award already exists
				db.Rejection.find({
					where: {
						ProposalId: proposal.id
					}
				})
				.then(function(rejection) {
					if(rejection) {
						res.send({message: "Rejection exists"});
					} else {
						if(award) {
							res.send({message: "Duplicate"});
						} else {
							db.Item.findAll({
								where: {
									ProposalId: proposal.id
								}
							})
							.then(function(items) {
								var total = 0.0;
								if (proposal.Status == 4) { //fully funded
									for (item in items) {
										if (items[item].SupplementalId == null && items[item].PartialId == null) {
											total += items[item].Price * items[item].Quantity;
										}
									}
								} else if(proposal.Status == 5) { //partially funded
									for (item in items) {
										//checks the id of the funded partial with the items
										if(items[item].PartialId == proposal.PartialFunded) {
											total += items[item].Price * items[item].Quantity;
										}
									}
								} else {
									res.send({message: "Proposal status is invalid"});
								}
								
								if (total != 0.0) {
									if(req.body.reportType == 0) {
										// Quarterly Report
										db.Award.create({
											ProposalId: proposal.id,
											ReportType: req.body.reportType,
											FundedAmount: total,
											AwardDate: moment().format(),
											BudgetDate: moment().month(req.body.budgetDate).format('MMMM YYYY'),
											BudgetCloseDate: moment().utc(req.body.budgetCloseDate).format('MMMM D[,] YYYY'),
											OversightOver: moment().add(3, 'years').format('MMMM YYYY'),
											OversightUnder: moment().add(7, 'years').format('MMMM YYYY'),
											QuarterlyDate1: moment.utc(req.body.quarterlyDate1).format('MMMM D[,] YYYY'),
											QuarterlyDate2: moment.utc(req.body.quarterlyDate2).format('MMMM D[,] YYYY'),
											QuarterlyDate3: moment.utc(req.body.quarterlyDate3).format('MMMM D[,] YYYY'),
											Notes: req.body.awardNotes,
											updatedAt: moment().format(),
											createdAt: moment().format()
										})
										.then(function(Award) {
											db.Proposal.update({
												LetterStatus: 1
											}, {
												where: {
													id: proposal.id
												}
											})
											.then(function(e) {
												res.send({message: "Success"});
											});
										});
									} else if(req.body.reportType == 1) {
										// Annually Report
										db.Award.create({
											ProposalId: proposal.id,
											ReportType: req.body.reportType,
											FundedAmount: total,
											AwardDate: moment().format(),
											BudgetDate: moment().month(req.body.budgetDate).format('MMMM YYYY'),
											BudgetCloseDate: moment().utc(req.body.budgetCloseDate).format('MMMM D[,] YYYY'),
											OversightOver: moment().add(3, 'years').format('MMMM YYYY'),
											OversightUnder: moment().add(7, 'years').format('MMMM YYYY'),
											AnnualDate: moment.utc(req.body.annualDate).format('MMMM D[,] YYYY'),
											Notes: req.body.awardNotes,
											updatedAt: moment().format(),
											createdAt: moment().format()
										})
										.then(function(Award) {
											db.Proposal.update({
												LetterStatus: 1
											}, {
												where: {
													id: proposal.id
												}
											})
											.then(function(e) {
												res.send({message: "Success"});
											});
										});
									} else {
										// Quarterly/Annual Report
										db.Award.create({
											ProposalId: proposal.id,
											ReportType: req.body.reportType,
											FundedAmount: total,
											AwardDate: moment().format(),
											BudgetDate: moment().month(req.body.budgetDate).format('MMMM YYYY'),
											BudgetCloseDate: moment().utc().format('MMMM D[,] YYYY'),
											OversightOver: moment().month(awardDetails.OversightOver).add(3, 'years').format('YYYY'),
											OversightUnder: moment().month(awardDetails.OversightUnder).add(7, 'years').format('YYYY'),
											QuarterlyDate1: moment.utc(req.body.quarterlyDate1).format('MMMM D[,] YYYY'),
											QuarterlyDate2: moment.utc(req.body.quarterlyDate2).format('MMMM D[,] YYYY'),
											QuarterlyDate3: moment.utc(req.body.quarterlyDate3).format('MMMM D[,] YYYY'),
											AnnualDate: moment.utc(req.body.annualDate).format('MMMM D[,] YYYY'),
											Notes: req.body.awardNotes,
											updatedAt: moment().format(),
											createdAt: moment().format()
										})
										.then(function(Award) {
											db.Proposal.update({
												LetterStatus: 1
											}, {
												where: {
													id: proposal.id
												}
											})
											.then(function(e) {
												res.send({message: "Success"});
											});
										});
									}
								} else {
									res.send({message: "Proposal status is invalid"});
								}
							})
							.catch(function(err) {
								console.log(err);
								res.render('admin/award', {
									subject: 'Oops',
									message: "Proposal " + req.body.awardProposalYear + '-' + req.body.awardProposalNumber + " does not exist"
								});
							});
						}
					}
				});
			});
		} else {
			res.send({message: "Proposal not found"});
		}
		
	});
});