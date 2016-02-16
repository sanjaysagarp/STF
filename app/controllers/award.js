//controller for award letters
var express = require('express');
var	router = express.Router();
var shib = require('passport-uwshib');
var db = require('../models');
var h = require('../helper');

module.exports = function(app) {
	app.use('/', router);
};

router.get('/proposals/award/:id', shib.ensureAuth('/login'), function showAwardLetter(req, res) {
	// db.Proposal.find({
	// 	where: {
	// 		id: req.params.id
	// 	}
	// }).then(function(proposal) {
	// 	// need to check if either partial or original proposal is funded
	// 	// if partial funded, retrieve the funded items based on the retrieved partial id from the proposal schema
	// 	// Original items will be retrieved from item where item.partialid = null and item.proposalid = req.params.id
	// 	db.Item.findAll({
	// 		where: {
	// 			ProposalId: req.params.id
	// 		}
	// 	}).then(function(items){
	// 		res.render('proposals/view', {
	// 			title: proposal.ProposalTitle,
	// 			proposal: proposal,
	// 			status: h.proposalStatus(proposal.Status)
	// 		});
	// 	})
	// });
	res.render('proposals/award', {
		title: "Award Letter"
	});
	
});