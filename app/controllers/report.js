var promise = require('bluebird')
var express = require('express');
var multer = require('multer');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var h = require('../helper');


module.exports = function(app) {
	app.use('/', router);
};

//create storage location for receipts
var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, '../uploads/receipts/');
	},
	limits: { fileSize: 1 * 1024 * 1024}, //32 mb limit <-- should fix it
	onFileUploadStart: function(file, req, res) {
		console.log(file.fieldname + ' fileupload is starting...');
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now());
	}
});
var upload = multer({ storage: storage}).single('receipt');

//Creates a quarterly report based on proposalid
router.get('/reports/create/quarterly/:proposalid', shib.ensureAuth('/login'), function(req, res) {
	db.Award.find({
		where: {
			ProposalId: req.params.proposalid
		}
	})
	.then(function(award) {
		if (award) {
			db.Proposal.find({
				where: {
					id: req.params.proposalid
				}
			})
			.then(function(proposal) {
				if (h.approvedReporter(res, req.user, proposal, false)) {
					db.Report.create({
						AwardId: award.id,
						ProposalId: req.params.proposalid,
						Type: 0
					})
					.then(function(report) {
						res.redirect('/reports/update/' + report.id);
					});
				} else {
					//error page
					h.displayErrorPage(res, 'You do not have permission to submit a report',
						'Access denied');
				}
			});
		} else {
			//error page
			h.displayErrorPage(res, 'A report cannot be submitted to this proposal',
						'Access denied');
		}
	});
});

//Creates an annual report based on proposalid
router.get('/reports/create/annual/:proposalid', shib.ensureAuth('/login'), function(req, res) {
	db.Award.find({
		where: {
			ProposalId: req.params.proposalid
		}
	})
	.then(function(award) {
		if (award) {
			db.Proposal.find({
				where: {
					id: req.params.proposalid
				}
			})
			.then(function(proposal) {
				//user must be an approved reporter of the proposal to create a report
				if (h.approvedReporter(res, req.user, proposal, false)) {
					db.Report.create({
						AwardId: award.id,
						ProposalId: req.params.proposalid,
						Type: 1
					})
					.then(function(report) {
						res.redirect('/reports/update/' + report.id);
					});
				} else {
					//error page
					h.displayErrorPage(res, 'You do not have permission to submit a report',
						'Access denied');
				}
			});
		} else {
			//error page
			h.displayErrorPage(res, 'A report cannot be submitted to this proposal',
						'Access denied');
		}
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
				id: report.AwardId
			}
		})
		.then(function(award) {
			db.Proposal.find({
				where: {
					id: award.ProposalId
				}
			})
			.then(function(proposal) {
				if (h.approvedReporter(res, req.user, proposal, false)) {
					res.render('reports/update',{
						title: "Report for " + proposal.ProposalTitle,
						report: report,
						award: award,
						proposal: proposal
					});
				} else {
					h.displayErrorPage(res, 'You do not have permission to update',
						'Access denied');
				}
			});
		});
	});
});

//saves report data - DOES NOT INCLUDE UPDATING CONTACTS
router.post('/reports/update/:reportid', shib.ensureAuth('/login'), function(req, res) {
	db.Report.find({
		where: {
			id: req.params.reportid
		}
	})
	.then(function(report) {
		db.Award.find({
			where: {
				id: report.AwardId
			}
		})
		.then(function(award) {
			db.Proposal.find({
				where: {
					id: award.ProposalId
				}
			})
			.then(function(proposal) {
				if (h.approvedReporter(res, req.user, proposal, false)) {
					upload(req, res, function (err) {
						if (err) {
							console.log(err);
						} else {
							console.log("Upload Success");
						}
						console.log(req);
						var form = {
							TimelineProgress: req.body.timeline,
							Modification: req.body.modification,
							Risks: req.body.risks,
							StudentUse: req.body.studentUse,
							BudgetUse: req.body.budgetUse,
							Financial: req.body.financial,
							Outreach: req.body.outreach,
							Impact: req.body.impact,
							Sustainability: req.body.sustainability
						};
						db.Report.update(form, {
							where: {
								id: req.params.reportid
							}	
						})
						.then(function(e) {
							//res.redirect('/reports/update/' + report.id);
							res.send({message: "Success"});
						});
					});
				} else {
					res.send({message:"Failure"});
				}
			});
		});
	});
});

//view report
router.get('/reports/:reportid', shib.ensureAuth('/login'), function(req, res) {
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
				res.render('reports/view',{
					title: "Report for " + proposal.ProposalTitle,
					report: report,
					award: award
				});
			});
		});
	});
});