var promise = require('bluebird')
var express = require('express');
var multer = require('multer');
var fs = require('fs');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var h = require('../helper');
var moment = require('moment');

module.exports = function(app) {
	app.use('/', router);
};

//create storage location for receipts
var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './uploads/receipts/');
	},
	limits: { fileSize: 1 * 1024 * 1024}, //32 mb limit <-- should fix it
	onFileUploadStart: function(file, req, res) {
		console.log(file.fieldname + ' fileupload is starting...');
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now()+".pdf");
	}
});
var upload = multer({ storage: storage}).single('receipt');

//Creates a quarterly report based on proposalid -- number is quarterly report number (1, 2, 3)
router.get('/reports/create/quarterly/:proposalid/:number', shib.ensureAuth('/login'), function(req, res) {
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
					var dueDate = '00-00-0000';
					if(req.params.number == 1) {
						dueDate = award.QuarterlyDate1;
					} else if(req.params.number == 2) {
						dueDate = award.QuarterlyDate2;
					} else if(req.params.number == 3) {
						dueDate = award.QuarterlyDate3;
					}
					db.Report.create({
						AwardId: award.id,
						ProposalId: req.params.proposalid,
						Type: 0,
						DueDate: dueDate
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
						Type: 1,
						DueDate: award.AnnualDate
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

//saves report data - DOES NOT INCLUDE UPDATING CONTACTS / RECEIPTS
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
						}
						console.log("Upload Success");
						//console.log(req);
						var path = report.ReceiptPath;
						if(req.file) {
							path = req.file.path;
						}
						var form = {
							TimelineProgress: req.body.timeline,
							Modification: req.body.modification,
							Risks: req.body.risks,
							StudentUse: req.body.studentUse,
							BudgetUse: req.body.budgetUse,
							Financial: req.body.financial,
							Outreach: req.body.outreach,
							Impact: req.body.impact,
							Sustainability: req.body.sustainability,
							AdditionalNotes: req.body.additionalNotes,
							ReceiptPath: path
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

//submits report -- TODO redirect and update status
router.post('/reports/submit/:reportid', shib.ensureAuth('/login'), function(req, res) {
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
						}
						console.log("Upload Success");
						//console.log(req);
						var path = report.ReceiptPath;
						if(req.file) {
							path = req.file.path;
						}
						//console.log(req);
						var form = {
							Status: 1,
							TimelineProgress: req.body.timeline,
							Modification: req.body.modification,
							Risks: req.body.risks,
							StudentUse: req.body.studentUse,
							BudgetUse: req.body.budgetUse,
							Financial: req.body.financial,
							Outreach: req.body.outreach,
							Impact: req.body.impact,
							Sustainability: req.body.sustainability,
							ReceiptPath: path,
							AdditionalNotes: req.body.additionalNotes,
							SubmittedDate: moment().utc()
						};
						db.Report.update(form, {
							where: {
								id: req.params.reportid
							}
						})
						.then(function(e) {
							//need to update proposal
							//res.redirect('/reports/' + report.id);
							var proposalContacts = {
								PrimaryName: req.body['primary-name'],
								PrimaryTitle: req.body['primary-title'],
								PrimaryNetId: req.body['primary-netId'],
								PrimaryPhone: req.body['primary-phone'],
								PrimaryMail: req.body['primary-mail'],
								BudgetName: req.body['budget-name'],
								BudgetTitle: req.body['budget-title'],
								BudgetNetId: req.body['budget-netId'],
								BudgetPhone: req.body['budget-phone'],
								BudgetMail: req.body['budget-mail']
							}
							
							db.Proposal.update(proposalContacts, {
								where: {
									id: report.ProposalId
								}
							})
							.then(function(ev) {
								res.send({message:"Success"});
							});
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
				var reporter = false;
				reporter = h.approvedReporter(res, req.user, proposal, false);
				res.render('reports/view',{
					title: "Report for " + proposal.ProposalTitle,
					report: report,
					proposal: proposal,
					award: award,
					reporter: reporter
				});
			});
		});
	});
});

//allows user to view receipts or any uploads under the path STF/uploads -- must be pdfs
router.get('/uploads*', function(req, res) {
	fs.readFile(__dirname.substr(0,4) + req.originalUrl, function (err,data){
		res.contentType("application/pdf");
		res.send(data);
	});
});