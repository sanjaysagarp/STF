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


router.get('/voting', function(req, res) {
	res.redirect('/metrics/voting');
})

router.get('/vote', function(req, res) {
	res.redirect('/metrics/voting');
})
router.all('/metrics*', shib.ensureAuth('/login'), function(req, res, next) {
	if(res.locals.isAdmin || res.locals.isCommitteeMember) {
		next();
	} else {
		h.displayErrorPage(res, 'Only committee members have access to metrics',
					"Access denied");
	}

});

//displays the base metrics homepage
router.get('/metrics', function(req, res) { //todo unspaghetti this
	db.Metrics.findAll({
		order: ['ProposalId']
	}).then(function(metrics) {
		var scores = {};
		var totalPercent = 100;
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
			var weight = 10; //weight is number of metric questions
			for (score in line) {
				sum += ((line[score] * weight) / totalPercent);
			}
			if (!scores[proposalId]) {
				scores[proposalId] = {};
			}
			scores[proposalId][i] = sum;
		}

		for (proposal in scores) {
			var prop = scores[proposal];
			var total = 0;
			var count = 0;
			for (sum in prop) {
				total += prop[sum]
				count++;
			}
			scores[proposal] = total / count; 		
		}

		db.Proposal.findAll({
			order: [['id', 'DESC']],
			where: {id: Object.keys(scores)}
		}).then(function(proposals) {
			res.render('metrics/index', {
				title: 'All Metric Scores',
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

//Long Explanation: This gets all the data for the metrics voting page. It is a
//long, robust, but fairly unreadable slice of code. I've annotated it as mych 
//as I can think of. The basic idea is to gather all data for proposals and 
//voting into the data object. data is organized in a hierarchy as show below,
//where any number represents any number of items, and the first reference after
//data is a proposal
//
//  data
//    |-1
//      |-partials
//      |    |-1
//      |      |-items
//      |          |-1
//      |-items
//      |    |-1
//      |-metrics
//           |-1
//
//The hierarchy isn't that bad, but the reference semantics below are. 
//Somewhat surpirisingly, there should not be any issues with the below code.
//If you do encounter an error, make sure to check the database data first,
//as a partial missing items, or items missing partial, or items missing
//proposal will all crash the page load. 

function renderVotingFullOrPartial(fullPage, req, res) {
	//check for activve user
	db.User.find({
		where: {
			RegId: req.user.regId
		}
	}).then(function(user) {
		if (h.activeCommitteeMember(res, user)) {

			var data = {};

			//find all proposals that are open to voting or discussion
			db.Proposal.findAll({
				where: {
					$or: {
						Status: 2,
						VotingDisplay: 1
					}
				}
			}).then(function(proposals) {

				//reorder and append to data the proposals by their ids
				var proposalNums = [];
				for (proposal in proposals) {
					data[proposals[proposal].id] = proposals[proposal].dataValues;
					proposalNums.push(proposals[proposal].id);
					data[proposals[proposal].id].StatusHtml = h.proposalStatus(proposals[proposal].Status)
				}

				//find all partials of the proposals we found
				db.Partial.findAll({
					where: {
						ProposalId: proposalNums
					}
				}).then(function(partials) {

					//put the partials under the 'partials' object of each 
					//proposal
					for (partial in partials) {
						if (data[partials[partial].ProposalId].partials === undefined) {
							data[partials[partial].ProposalId].partials = {};
						}	
						data[partials[partial].ProposalId].partials[partials[partial].id] = partials[partial].dataValues;
					}

					//get all items for each proposal
					db.Item.findAll({
						where: {
							ProposalId: proposalNums
						}
					}).then(function(items) {

						//attach items to proposal base or partial
						for (item in items) {
							if (items[item].PartialId) { //assign to partial
								if (data[items[item].ProposalId].partials[items[item].PartialId].items === undefined) {
									data[items[item].ProposalId].partials[items[item].PartialId].items = {};
								}
								data[items[item].ProposalId].partials[items[item].PartialId].items[items[item].id] = items[item].dataValues;
							} else { //assign to root
								if (data[items[item].ProposalId].items === undefined) {
									data[items[item].ProposalId].items = {};
								}
								data[items[item].ProposalId].items[items[item].id] = items[item].dataValues;
							}
						}

						//get all the metrics data
						db.Metrics.findAll({
							where: {
								ProposalId: proposalNums
							}
						}).then(function(metrics) {

							//attach the metrics data to the proposal
							var avgScores = [];
							var totalAvg = [];
							for (metric in metrics) {
								if (data[metrics[metric].ProposalId].metrics === undefined) {
									data[metrics[metric].ProposalId].metrics = {};
								}
								data[metrics[metric].ProposalId].metrics[metrics[metric].id] = metrics[metric].dataValues;
								var authorId = metrics[metric].dataValues.AuthorId;
								var proposalId = metrics[metric].dataValues.ProposalId;
								
								var total = 0;
								var i = 0;
								
								//Assigns average metric score to each member
								for (index in metrics[metric].dataValues) {
									//console.log(index);
									if(i>2 && i<13) {
										total += metrics[metric].dataValues[index];
									}
									i++;
								}
								avgScores[authorId] = (total / 10).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //10 is # of metrics
								
							}
							//Gets the total average for metrics of a proposal
							
							//get all the votes by the user
							db.Vote.findAll({
								where: {
									VoterId: user.id
								}
							}).then(function(votes) {

								//mark which proposals the user has voted on
								var alreadySubmitted = [];
								for (vote in votes) {
									alreadySubmitted.push(votes[vote].ProposalId);
								}

								//get all relevant endorsements
								db.Endorsement.findAll({
									where: {
										ProposalId: proposalNums
									}
								}).then(function(ends) {

									//attach number of endorsements to each proposal
									for (end in ends) {
										if (data[ends[end].ProposalId].ends === undefined) {
											data[ends[end].ProposalId].ends = 0;
										}
										data[ends[end].ProposalId].ends++;
									}

									//we did it! make the page!
									db.User.findAll().then(function(users) {
										var userData = {};
										for (userN in users) {
											userData[users[userN].id] = users[userN];
										}
										//console.log(totalAvg);
										res.render((fullPage ? 'metrics/voting' : 'metrics/votingpartial'), {
											title: 'STF Voting',
											user: user,
											users: userData,
											data: data,
											avgScores: avgScores,
											voted: alreadySubmitted
										}); 
									});
								});
							})
						})
					})
				})
			})
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
					for (var key in questions.impact) { //A, C, D etc.
						if (questions.impact.hasOwnProperty(key)) {
							var obj = questions.impact[key];
							for (var prop in obj) {
								if (obj.hasOwnProperty(prop) && prop != "name") {
									questionList[key] = obj[prop];
								}
							}
						}
					}
					// 
					for (var key in questions.method) { //A, C, D etc.
						if (questions.method.hasOwnProperty(key)) {
							var obj = questions.method[key];
							for (var prop in obj) {
								if (obj.hasOwnProperty(prop) && prop != "name") {
									questionList[key] = obj[prop];
								}
							}
						}
					}
					for (var key in questions.accessibility) { //A, C, D etc.
						if (questions.accessibility.hasOwnProperty(key)) {
							var obj = questions.accessibility[key];
							for (var prop in obj) {
								if (obj.hasOwnProperty(prop) && prop != "name") {
									questionList[key] = obj[prop];
								}
							}
						}
					}
					

					//add the special questions into the list
					/*for (var obj in questions.special[proposal.Category]) {
						for (var prop in obj) {
							if (obj.hasOwnProperty(prop) && obj != 'name') {
								questionList['X' + obj] = questions.special[proposal.Category][obj];
							}
						}
					}*/

					var userData = {};
					for (var obj in users) {
						userData[users[obj].id] = users[obj]
					}


					res.render('metrics/view', {
						title: 'Metrics for ' + proposal.ProposalTitle,
						proposal: proposal,
						metrics: metrics,
						questions: questions,
						list: questionList,
						users: userData
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
					res.render('metrics/create', {
						title: 'Your Metrics for ' + proposal.ProposalTitle,
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
		if (h.activeCommitteeMember(res, user)) {

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
				((metrics != null) 
					? db.Metrics.update(
						metric, {
							where: {id: metrics.id}
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
