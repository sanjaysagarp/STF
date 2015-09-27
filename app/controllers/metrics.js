//manages metrics and voting pages

var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var questions = require('../../config/metricsquestions');
var Sequelize = require('sequelize');
var h = require('../helper')

module.exports = function(app) {
	app.use('/', router);
};


//displays the base metrics homepage
router.get('/metrics', function(req, res) { //todo unspaghetti this
	db.Metrics.findAll({
		order: ['ProposalId']
	}).then(function(metrics) {
		var scores = {};
		for (var i = 0; i < metrics.length; i++) {
			var line = metrics[i].dataValues;
			var proposalId = line.ProposalId;
			delete line.id;
			delete line.Notes;
			delete line.AuthorId;
			delete line.ProposalId;
			delete line.createdAt;
			delete line.updatedAt;
			var sum = 0;
			var count = 0;
			for (score in line) {
				sum += line[score];
				count++;
			}
			if (!scores[proposalId]) {
				scores[proposalId] = {};
			}
			scores[proposalId][i] = sum;
		}

		for (proposal in scores) {
			console.log(scores[proposal])
			var prop = scores[proposal];
			var total = 0;
			var count = 0;
			for (sum in prop) {
				total += prop[sum]
				count++;
			}
			scores[proposal] = total / count; //MISSING TOTAL Q NUMBER, comment below is partial souloution
		}
		console.log(Object.keys(scores));

		db.Proposal.findAll({
			order: [['id', 'DESC']],
			where: {id: Object.keys(scores)}
		}).then(function(proposals) {
		console.log(scores);
/*			for (score in scores) {
				console.log(score)
				var cat = proposals[12].Category;
				var questionCount = questions.general.length + questions.special[cat].length - 1;
				scores[score] = scores[score] / questionCount;
			}*/
			res.render('metrics/index', {
				proposals: proposals,
				scores: scores
			})
		});
	});
});

//displays the full metrics voting page
router.get('/metrics/voting', shib.ensureAuth('/login'), function(req, res) {
	renderVotingFullOrPartial(true, req, res);
});

//displays the partial metrics voting page
router.post('/metrics/votingpartial', shib.ensureAuth('/login'), function(req, res) {
	renderVotingFullOrPartial(false, req, res);
});

//handles all the logic for metrics voting
function renderVotingFullOrPartial(fullPage, req, res) {
	db.User.find({
		where: {
			RegId: req.user.regId
		}
	}).then(function(user) {
		var data = {};
		if (user && user.Permissions > 0) {
			db.Proposal.findAll({
				where: {
					$or: {
						Status: 2,
						VotingDisplay: 1
					}
				}
			}).then(function(proposals) {
				var proposalNums = [];
				for (proposal in proposals) {
					data[proposals[proposal].id] = proposals[proposal].dataValues;
					proposalNums.push(proposals[proposal].id);
				}
				db.Partial.findAll({
					where: {
						ProposalId: proposalNums
					}
				}).then(function(partials) {
					for (partial in partials) {
						if (data[partials[partial].ProposalId].partials === undefined) {

							data[partials[partial].ProposalId].partials = {};
						}	
						
						data[partials[partial].ProposalId].partials[partials[partial].id] = partials[partial].dataValues;
					}
					db.Item.findAll({
						where: {
							ProposalId: proposalNums
						}
					}).then(function(items) {
						for (item in items) {
							if (items[item].PartialId) {
								if (data[items[item].ProposalId].partials[items[item].PartialId].items === undefined) {
									data[items[item].ProposalId].partials[items[item].PartialId].items = {};
								}
								data[items[item].ProposalId].partials[items[item].PartialId].items[items[item].id] = items[item].dataValues;
							} else {
								if (data[items[item].ProposalId].items === undefined) {
									data[items[item].ProposalId].items = {};
								}
								data[items[item].ProposalId].items[items[item].id] = items[item].dataValues;
							}
						}
						db.Metrics.findAll({
							where: {
								ProposalId: proposalNums
							}
						}).then(function(metrics) {
							for (metric in metrics) {
								if (data[metrics[metric].ProposalId].metrics === undefined) {
									data[metrics[metric].ProposalId].metrics = {};
								}
								data[metrics[metric].ProposalId].metrics[metrics[metric].id] = metrics[metric].dataValues;
							}
							db.Vote.findAll({
								where: {
									VoterId: user.id
								}
							}).then(function(votes) {
								var alreadySubmitted = [];
								for (vote in votes) {
									alreadySubmitted.push(votes[vote].ProposalId);
								}
								db.Endorsement.findAll({
									where: {
										ProposalId: proposalNums
									}
								}).then(function(ends) {
									for (end in ends) {
										if (data[ends[end].ProposalId].ends === undefined) {
											data[ends[end].ProposalId].ends = 0;
										}
										data[ends[end].ProposalId].ends++;
									}
									db.User.findAll().then(function(users) {
										res.render((fullPage ? 'metrics/voting' : 'metrics/votingpartial'), {
											user: user,
											users: users,
											data: data,
											voted: alreadySubmitted
										}); 
									});
								});
							})
						})
					})
				})
			})
		} else {
			res.render('error', {
				message: 'You are not a member of STF',
				error: {status: 'Access Denied'}
			});
		}
	});
}


//Get a proposals metrics data, and display its metrics page
router.get('/metrics/:id', function(req, res) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {

		if (proposal) { //check for existing proposal
			db.Metrics.findAll({
				where: {
					ProposalId: req.params.id
				}
			}).then(function(metrics) {
				db.User.findAll().then(function(users) {

					//assemble general questions into a list
					var questionList = {};
					for (var key in questions.general) { //A, C, D etc.
						if (questions.general.hasOwnProperty(key)) {
							var obj = questions.general[key];
							for (var prop in obj) {
								if (obj.hasOwnProperty(prop) && prop != "name") {
									questionList[key + prop] = obj[prop];
								}
							}
						}
					}

					//add the special questions into the list
					for (var obj in questions.special[proposal.Category]) {
						for (var prop in obj) {
							if (obj.hasOwnProperty(prop) && obj != 'name') {
								questionList['X' + obj] = questions.special[proposal.Category][obj];
							}
						}
					}

					res.render('metrics/view', {
						proposal: proposal,
						metrics: metrics,
						questions: questions,
						list: questionList,
						users: users
					});
				});
			})	

		} else { //There aint no proposal!
			h.displayErrorPage(res, 'The specified proposal does not exist', 'Does Not Exist');
		}

	});
});


//displays the create new metrics page
router.get('/metrics/:id/create', shib.ensureAuth('/login'), function(req, res, next) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {
		db.User.find({
			where: {
				RegId: req.user.regId
			}
		}).then(function(user) {
			if (user && user.Permissions > 0) {
				db.Metrics.find({
					where: {
						AuthorId: user.id,
						ProposalId: req.params.id
					}
				}).then(function(metric) {
					console.log(questions)
					res.render('metrics/create', {
						proposal: proposal,
						questions: questions,
						metric: metric
					});
				});
			} else {
				h.displayErrorPage(res, 'You do not have permission to write metrics on proposals', 'Access denied');
			}
		});
	});
});


//create or save metrics data from a metrics submit
router.post('/metrics/:id/create', shib.ensureAuth('/login'), function(req, res) {
	
	//get and check user
	db.User.find({
		where: {
			RegId: req.user.regId
		}
	}).then(function(user){
		if (h.activeCommitteeMember) {

			//get their metrics
			db.Metrics.find({
				where: {
					AuthorId: user.id,
					ProposalId: req.params.id
				}
			}).then(function(metrics) {
				
				//assign data
				var metric = {};
				for (name in req.body) {
					metric[name] = req.body[name];
				}
				
				metric.ProposalId = req.params.id,
				metric.AuthorId =  user.id,

				//create metrics if none, update if exists
				((metrics) 
					? db.Metrics.update(
						metric, {
							where: metrics.id
						}
					)
					: db.Metrics.create(
						metric
					)
				).then(function() {
					if (req.body["Next"]) { //redirect if redirect
						res.redirect('/metrics/' + req.body["Next"] + '/create');
					} else {
						res.redirect('/metrics/' + req.params.id);
					}
				});
			});
		}
	});
});
