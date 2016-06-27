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

//Creates a report based on proposalid and annual report (to find out if quarterly/annually was assigned)
router.post('/reports/create/:proposalid', shib.ensureAuth('/login'), function(req, res) {
	db.Award.find({
		where: {
			ProposalId: req.params.proposalid
		}
	})
	.then(function(award) {
		db.Proposal.find({
			where: {
				id: req.params.id
			}
		})
		.then(function(proposal) {
			db.Report.create({
				AwardId: award.id
			})
			.then(function(report) {
				res.redirect('/reports/update/' + report.id);
			});
		});
	});
});

//gets the report from a user
router.get('/reports/update/:reportid', shib.ensureAuth('/login'), function(req, res) {
	db.Report.find({
		where: {
			id: req.params.reportid
		}
	})
	.then(function(report) {
		db.Award.find({
			where: {
				AwardId: report.AwardId
			}
		})
		.then(function(award) {
			db.Proposal.find({
				where: {
					id: award.ProposalId
				}
			})
			.then(function(proposal) {
				if (h.approvedEditor(res, req.user, proposal, false)) {
					res.render('reports/update',{
						title: "Report for " + proposal.ProposalTitle,
						report: report,
						award: award
					});
				} else {
					h.displayErrorPage(res, 'You do not have permission to update',
						'Access denied');
				}
			});
		});
	});
});