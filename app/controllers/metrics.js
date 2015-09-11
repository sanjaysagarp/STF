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


	/*			questions.general.forEach(function(typeElem, typeIndex) {
					typeElem.forEach(function(quesElem, quesIndex) {
						if (quesIndex != 'name') {
							questionList[typeIndex + quesIndex] = quesElem;
						} 
					});
				});
				console.log(questionList);*/


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

router.get('/metrics/:id/create', shib.ensureAuth('/login'), function(req, res, next) {
	db.Proposal.find({
		where: {
			id: req.params.id
		}
	}).then(function(proposal) {
		res.render('metrics/create', {
			proposal: proposal,
			questions: questions
		});
	});
});

router.post('/metrics/:id/create'), shib.ensureAuth('/login'), function(req, res) {

}
