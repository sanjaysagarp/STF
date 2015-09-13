var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var questions = require('../../config/metricsquestions');

module.exports = function(app) {
	app.use('/', router);
};


router.get('/metrics/:id', function(req, res, next) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {
		db.Metrics.findAll({
			where: {
				ProposalId: req.params.id
			}
		}).then(function(metrics) {
			db.User.findAll().then(function(users) {

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

				for (var obj in questions.special[proposal.Category]) {
					console.log(questions.special[proposal.Category]);
					console.log(obj);
					for (var prop in obj) {
						if (obj.hasOwnProperty(prop) && obj != 'name') {
							questionList['X' + obj] = questions.special[proposal.Category][obj];
						}
					}
				}
				console.log(questionList);

				res.render('metrics/view', {
					proposal: proposal,
					metrics: metrics,
					questions: questions,
					list: questionList,
					users: users
				});
			});
		})		
	});
});

router.post('/metrics/:id', shib.ensureAuth('/login'), function(re, res) {

});

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
						proposal: proposal,
						questions: questions,
						metric: metric
					});
				});
			} else {
				res.render('error', {
					message: 'You do not have permission to write metrics on proposals',
					error: {status: "Access denied"}
				});
			}
		});
	});
});

router.post('/metrics/:id/create', shib.ensureAuth('/login'), function(req, res, next) {
	console.log('request made!');
	db.User.find({
		where: {
			RegId: req.user.regId
		}
	}).then(function(user){
		if (user && user.Permissions > 0) {
			db.Metrics.find({
				where: {
					AuthorId: user.id,
					ProposalId: req.params.id
				}
			}).then(function(metrics) {
				var metric = {};
				for (name in req.body) {
					metric[name] = req.body[name];
				}
				console.log(metric);
				metric.ProposalId =  req.params.id,
				metric.AuthorId =  user.id,

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
					if (req.body["Next"]) {
						res.redirect('/metrics/' + req.body["Next"] + '/create');
					} else {
						res.redirect('/metrics/' + req.params.id);
					}
				});

			});
		} else {
			res.render('error', {
				message: 'You do not have permission to write metrics on proposals',
				error: {status: "Access denied"}
			});
		}
	});

	
});
