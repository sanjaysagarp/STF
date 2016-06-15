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
		db.Proposal.find({
			where: {
				id: req.params.id
			}
		})
		.then(function(proposal) {
			//format dates
			if(award){
				console.log("WTF " + award.BudgetDate );
				var awardDate = moment.utc(award.AwardDate).format('MMMM Do YYYY');
				var budgetMonth = moment.utc(award.BudgetDate).format('MMMM YYYY');
				var oversightOver = moment.utc(award.OversightOver).format('MMMM YYYY');
				var oversightUnder = moment.utc(award.OversightUnder).format('MMMM YYYY');
				var total = award.FundedAmount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				res.render('proposals/award', {
					title: "Award Letter",
					proposal: proposal,
					award: award,
					awardDate: awardDate,
					budgetMonth: budgetMonth,
					oversightOver: oversightOver,
					oversightUnder: oversightUnder,
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

//finds rejection letter if exists and renders page
router.get('/proposals/rejection/:id', function(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	})
	.then(function(proposal) {
		db.Rejection.find({
		where: {
			ProposalId: req.params.id
		}
		})
		.then(function(rejection) {
			if(rejection) {
				var rejectionDate = moment(new Date(rejection.createdAt)).format('MMMM Do YYYY');
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
	});
	
	
});

//Creates a rejection letter
router.post('/admin/rejection', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			id: req.body.rejectionProposalId
		}
	})
	.then(function(proposal) {
		//console.log(proposal);
		db.Award.find({
			where: {
				ProposalId: req.body.rejectionProposalId
			}
		}).then(function(award) {
			// this proposal has already been awarded
			if(award) {
				res.send({message:"Award exists"});
			} else {
				db.Rejection.find({
					where: {
						ProposalId: req.body.rejectionProposalId
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
			id: req.body.awardProposalId
		}
	}).then(function(proposal) {
		db.Award.find({
			where: {
				ProposalId: req.body.awardProposalId
			}
		})
		.then(function(award) {
			//If award already exists
			db.Rejection.find({
				where: {
					ProposalId: req.body.awardProposalId
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
								ProposalId: req.body.awardProposalId
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
								db.Award.create({
									ProposalId: proposal.id,
									ReportType: req.body.reportType,
									FundedAmount: total,
									AwardDate: moment().format(),
									BudgetDate: moment().month(awardDetails.BudgetMonth).format('MMMM YYYY'),
									OversightOver: moment().month(awardDetails.OversightOver).add(3, 'years').format('YYYY'),
									OversightUnder: moment().month(awardDetails.OversightUnder).add(7, 'years').format('YYYY'),
									Notes: req.body.awardNotes,
									updatedAt: moment().format(),
									createdAt: moment().format()
								})
								.then(function(Award) {
									//need to create quarterly/annual report layout too!
									// db.Report.create({
									// 	AwardId: Award.id,
									// 	Deadline: Award.oversightStartDate //need deadline?
									// });
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
						})
						.catch(function(err) {
							console.log(err);
							res.render('admin/award', {
								subject: 'Oops',
								message: "Proposal " + req.body.proposalId + " does not exist"
							});
						});
					}
				}
			});
			
		});

		
	});
});