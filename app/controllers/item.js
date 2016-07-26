//displays all the item pages

var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var h = require('../helper');

module.exports = function(app) {
	app.use('/', router);
};

//ensure a user is logge din on all item pages
router.all('/item*', shib.ensureAuth('/login'), function(req, res, next) {next(); });


//makes a new blank item that is part of a proposal
router.get('/items/new/:proposal', function(req, res) {itemMaker(req, res)});

//makes a new blank item that is part of a partial
router.get('/items/new/:partial/:proposal', function(req, res) {itemMaker(req, res)});

router.get('/items/new/supplemental/:supplemental/:proposal', function(req, res) {itemMakerSupplemental(req, res)});

//makes a new blank item that belongs to a partial or proposal
function itemMakerSupplemental(req, res) {
	if (h.approvedReporter(res, req.user, req.params.proposal)) {
		db.Item.create({
			ProposalId: req.params.proposal,
			SupplementalId: req.params.supplemental
		}).then(function(item) {
			res.redirect('/supplemental/' + req.params.supplemental + "/" + item.id)
		});
	}
}

//makes a new blank item that belongs to a partial or proposal
function itemMaker(req, res) {
	if (h.approvedEditor(res, req.user, req.params.proposal) ||  h.approvedReporter(res, req.user, req.params.proposal)) {
		db.Item.create({
			ProposalId: req.params.proposal,
			PartialId: (req.params.partial ? req.params.partial : null)
		}).then(function(item) {
			res.redirect('/item/' + item.id)
		});
	} else {
		displayErrorPage(res, 'You are not able to create an item', 'Access Denied');
	}
}


//Make a new item from posted data. 
router.post('/items/new', function(req, res) {
	if (h.approvedEditor(res, req.user, req.body['ProposalId']) ||  h.approvedReporter(res, req.user, req.body['ProposalId'])) {
		db.Item.create(req.body).then(function(item) {
			res.json({
				message: "Success", 
				item: item
			});
		});
	} else {
		displayErrorPage(res, 'You are not able to create an item', 'Access Denied');
	}
});


//deletes an item by its id
router.get('/item/delete/:id', function(req, res) {
	db.Item.find({ where: {id: req.params.id} })
	.then(function(item) {
		var partial = item.PartialId;
		var supplemental = item.SupplementalId;
		db.Proposal.find({ where: {id: item.ProposalId} }).then(function(proposal) {
			if (res.locals.isAdmin || h.approvedEditor(res, req.user, proposal) ||  h.approvedReporter(res, req.user, proposal)) {
				item.destroy().then(function() {
					if (partial != null) {
						res.redirect('/partial/' + partial + '/0')
					} else if (supplemental != null) {
						res.redirect('/supplemental/' + supplemental + '/0')
					} else if (proposal.Status != 0) { //if a proposal is submitted, goto showpage
						res.redirect('/proposals/' + proposal.id);
					} else { //go back to the edit proposal page
						res.redirect('/proposals/update/' + proposal.id + '#step-7');
					}
				});
			} else {
				displayErrorPage(res, 'You are not an Approved reporter of this Proposal', 'Access Denied');
			}
		});
	});
});


//Get an item's items page from its id
router.get('/item/:id', function(req,res) {
	db.Item.find({
		where: {
			id: req.params.id,
		}
	}).then(function(item) {

		//make sure the item is not in  a partial
		if (item.PartialId == null) {	
			//get the rest of the items
			db.Item.findAll({
				where: {
					ProposalId: item.ProposalId,
					PartialId: null
				}
			}).then(function(items) {
				db.Proposal.find({
					where: {
						id: item.ProposalId
					}
				}).then(function(proposal) {
					if (h.approvedEditor(res, req.user, proposal) ||  h.approvedReporter(res, req.user, proposal)) {
						res.render('items/proposalview',{
							title: item.ItemName,
							item: item,
							items: items,
							proposal: proposal
						});
					}
				});
			});

		//This item is in a partial, redirect
		} else {
			res.redirect('/partial/' + item.PartialId + '/' + item.id);
		}
	});
});


//update an item's data by its id
router.post('/item/:id', function(req, res) {
	db.Item.find({
		where: {
			id: req.params.id
		}
	}).then(function(item) {
		if (!item) {
			res.send(404);
		}

		if (h.approvedEditor(res, req.user, item.ProposalId) ||  h.approvedReporter(res, req.user, item.ProposalId)) {
			db.Item.update(req.body, {
				where: {
					id: req.params.id
				}
			}).then(function(item) {
				 res.redirect('/item/' + req.params.id)
			});
		}

	});
});
