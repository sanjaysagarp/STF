//controller for award letters
//need to grab: Proposal Title and Id, Date of award letter creation, reportType (0 for quarterly, 1 for anually, 2 for both?), total funded amount
var express = require('express');
var	router = express.Router();
var shib = require('passport-uwshib');
var db = require('../models');
var h = require('../helper');
var moment = require('moment'); //momentjs handles date format well -- need to npm install that
var awardDetails = require('../../config/awarddetails');

module.exports = function(app) {
	app.use('/', router);
};

router.get('/proposals/award/:id', shib.ensureAuth('/login'), function(req, res) {
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
				id: req.body.proposalId
			}
		})
		.then(function(proposal) {
			res.render('proposals/award', {
				proposal: proposal,
				award: award
			});
		});
	})
	.catch(function(err) {
		console.log(err);
		h.displayErrorPage(res, 'There is no award found for this proposal', 'Award not found!');
	});
});

router.post('/admin/award', shib.ensureAuth('/login'), function(req, res) {
	db.Proposal.find({
		where: {
			id: req.body.proposalId
		}
	}).then(function(proposal) {
		// need to check if either partial or original proposal is funded
		// if partial funded, retrieve the funded items based on the retrieved partial id from the proposal schema
		// Original items will be retrieved from item where item.partialid = null and item.proposalid = req.params.id
		db.Item.findAll({
			where: {
				ProposalId: req.body.proposalId
			}
		})
		.then(function(items) {
			var total = 0.0;
			if (proposal.status == 4) { //fully funded
				for (var item in items) {
					if (item.SupplementalId === null && item.PartialId === null) {
						total += Math.round(item.Price * item.Quantity);
					}
				}
			} else if(proposal.status == 5) { //partially funded
				for (var item in items) {
					//checks the id of the funded partial with the items
					if(item.PartialId == proposal.PartialFunded) {
						total += Math.round(item.Price * item.Quantity);
					}
				}
			} else {
				res.render('admin/award', {
					subject: 'Proposal has not been voted on',
					message: "Please decide funding or not for proposal " +  proposal.id + " before creating an award letter"
				});
			}
			total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			
			db.Award.create({
				ProposalId: proposal.id,
				ReportType: req.body.reportType,
				FundedAmount: total,
				AwardDate: moment().format('MMMM Do YYYY'),
				BudgetDate: moment().month(awardDetails.BudgetMonth).format('MMMM YYYY'),
				OversightStartDate: moment().month(awardDetails.OversightStartMonth).add(3, 'years').format('YYYY'),
				OversightEndDate: moment().month(awardDetails.OversightEndMonth).add(7, 'years').format('YYYY')
			});
			res.render('admin/award', {
				subject: 'Award Letter Successfully Created',
				message: "An award letter has been created for proposal " +  proposal.id
			});
		})
		.catch(function(err) {
			console.log(err);
			res.render('admin/award', {
				subject: 'Oops',
				message: "Proposal " + req.body.proposalId + " does not exist"
			});
		});
		
	});
});