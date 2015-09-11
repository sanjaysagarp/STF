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
			res.render('metrics/view', {
				proposal: proposal,
				metrics: metrics,
				questions: questions
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
		db.Metrics.findAll({
			where: {
				ProposalId: req.params.id
			}
		}).then(function(metrics) {
			res.render('metrics/create', {
				proposal: proposal,
				metrics: metrics,
				questions: questions
			});
		})		
	});
});