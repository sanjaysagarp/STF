//displays all the item pages

var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var h = require('../helper');
var gmConfig = require('../../config/google'); //google key

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
				db.Location.find({where: {id: item.LocationId}}).then(function(location) {
					if(location) {
						location.destroy();
					}
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
				});
			} else {
				displayErrorPage(res, 'You are not an Approved reporter of this Proposal', 'Access Denied');
			}
		});
	});
});

//renders location map page for an item
router.get('/item/location/:id', function(req, res) {
	db.Item.find({where: {id: req.params.id}})
	.then(function(item) {
		if(item) {
			db.Proposal.find({where: {id: item.ProposalId}})
			.then(function(proposal) {
				db.Item.findAll({
					where: {
						ProposalId: item.ProposalId,
						PartialId: null,
						SupplementalId: null
					}
				})
				.then(function(items) {
					db.Location.find({
						where: {
							ItemId: item.id
						}
					})
					.then(function(location) {
						if (res.locals.isAdmin || h.approvedEditor(res, req.user, proposal) ||  h.approvedReporter(res, req.user, proposal)) {
							res.render('items/locationview', {
								title: item.ItemName,
								location: location,
								item: item,
								items: items,
								proposal: proposal,
								mapKey: gmConfig.key
							});
						} else {
							displayErrorPage(res, 'You are not an Approved reporter of this Proposal', 'Access Denied');
						}
					})
				});
			});
		} else {
			displayErrorPage(res, "Item does not exists", "Bad Request");
		}
	});
});

//saves location for item
router.post('/v1/update/location', function(req, res) {
	// find location to see if it exists
	db.Location.find({
		where : {
			ItemId: req.body.itemId
		}
	})
	.then(function(location) {
		if(!location) {
			// create location
			db.Location.create({
				ItemId: req.body.itemId,
				ProposalId: req.body.proposalId,
				Address: req.body.address,
				Lat: req.body.latitude,
				Lng: req.body.longitude,
				Description: req.body.description
			})
			.then(function(loc) {
				db.Item.update({
					LocationId: loc.id
				},
				{
					where : {
						id: req.body.itemId
					}
				})
				.then(function() {
					res.send({message: "updated"});
				});
			});
		} else {
			//update location
			db.Location.update({
				Address: req.body.address,
				Lat: req.body.latitude,
				Lng: req.body.longitude,
				Description: req.body.description
			},
			{
				where: {
					ItemId: req.body.itemId
				}
			})
			.then(function() {
				res.send({message: "updated"});
			});
		}
	});
});

//Get an item's items page from its id
router.get('/item/:id', function(req,res) {
	db.Item.find({
		where: {
			id: req.params.id,
		}
	}).then(function(item) {

		//make sure the item is not in a partial / supplemental
		if (item.PartialId == null && item.SupplementalId == null) {
			//get the rest of the items
			db.Item.findAll({
				where: {
					ProposalId: item.ProposalId,
					PartialId: null,
					SupplementalId: null
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
					} else {
						displayErrorPage(res, 'You are not an Approved reporter of this Proposal', 'Access Denied');
					}
				});
			});

		//This item is in a partial / supplemental, redirect
		} else {
			if(item.PartialId == null) {
				res.redirect('/partial/' + item.PartialId + '/' + item.id);
			} else {
				res.redirect('/supplemental/' + item.SupplementalId + '/' + item.id);
			}
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
		} else {
			displayErrorPage(res, 'You are not an Approved reporter of this Proposal', 'Access Denied');
		}

	});
});
