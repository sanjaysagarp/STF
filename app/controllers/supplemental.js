//supplemental pages

var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var h = require('../helper');

module.exports = function(app) {
	app.use('/', router);
};

//ensure login on all supplemental pages
router.all('/supplemental*', shib.ensureAuth('/login'), function(req, res, next) {next()} );

//renders the supplemental view/voting page
router.get('/supplemental/view/:supplemental', function(req, res) {
	db.Supplemental.find({
		where: {id: req.params.supplemental}
	})
	.then(function(supplemental) {
		db.Proposal.find({
			where: {id: supplemental.ProposalId}
		})
		.then(function(proposal) {
			//find all items associated with supplemental
			db.Item.findAll({
				where: {
					ProposalId: proposal.id,
					SupplementalId: req.params.supplemental
					}
			})
			.then(function(items) {
				res.render('proposals/supplemental',{
					title: 'Supplemental for ' + proposal.ProposalTitle,
					supplemental: supplemental,
					items: items
				});
			});
		});
	
	});
});

//create a new supplemental with duplicated items
router.get('/supplementals/new/:id', function(req, res) {
	//THIS SHOULD WORK -- IF NOT, you're not finding proposal correctly
	if (res.locals.isAdmin || res.locals.isCommitteeMember || h.approvedEditor(res, res.user, db.Proposal.find({where:{id: req.params.id}}))) {

		//get all funded items from the original proposal
		db.Item.findAll({
			where: {
				ProposalId: req.params.id,
				SupplementalId: null,
				PartialId: null
			}
		}).then(function(items) {
			var redirect;

			//create the supplemental
			db.Supplemental.create({
				Author: res.locals.netId,
				ProposalId: req.params.id
			})
			.then(function(supplemental) {
				
				//create each duplicated item, bound to the supplemental -- Do we want this?
				for (item in items) {
					var i = items[item].dataValues;
					i.id = null;
					i.createdAt = null;
					i.updatedAt = null;
					i.SupplementalId = supplemental.id;
					db.Item.create(i);
				}
				redirect = supplemental.id;

			//redirect to new supplemental
			})
			.then(function() {
				res.redirect('/supplemental/' + redirect + '/0');
			});
		});
	} else {
		h.displayErrorPage(res, 'The requested supplemental could not be found or you are not the author',
						'Requested does not Exist');
	}
});


router.get('/supplemental/:supplemental/:item', function(req, res) {
	//find supplemental
	//check res.locals.netId with netid associated with supplemental
	//get all items and render page
	db.Supplemental.find({
		where: {id:req.params.supplemental}
	})
	.then(function(supplemental) {
		//if supplemental not found
		if(!supplemental) {
			h.displayErrorPage(res, 'The requested supplemental could not be found',
						'Supplemental not found!');
		} else {
			//check if user is author of supplemental or an admin
			if (res.locals.netId == supplemental.Author || res.locals.isAdmin) {
				//retrieve items and render page!
				db.Proposal.find({
						where: {
							id: supplemental.ProposalId
						}
					})
					.then(function(proposal) {
						//need to check proposal status (if submitted or awaiting decision)
						//grab all items that match the supplemental
						db.Item.findAll({
							where: {
								SupplementalId: supplemental.id
							}
						})
						.then(function(items) {
							if (req.params.item != 0) {
								db.Item.find({
									where: {
										id: req.params.item
									}
								})
								.then(function(item) {
									res.render('items/supplementalview',{
										title: 'Supplemental for ' + proposal.ProposalTitle,
										item: item,
										items: items,
										supplemental: supplemental,
										proposal: proposal
									});									
								});
							} else {
								res.render('items/supplementalview',{
									title: 'Supplemental for ' + proposal.ProposalTitle,
									item: 0,
									items: items,
									supplemental: supplemental,
									proposal: proposal
								});
							}
						});
					});
			} else {
				h.displayErrorPage(res, 'You are not the author of this supplemental',
						'You do not have permission!');
			}
		}
	});
});

//deletes a supplemental and all items associated with it
router.post('/supplemental/delete/:supplemental', function(req, res) {
	db.Supplemental.find({
		where: {id:req.params.supplemental}
	})
	.then(function(supplemental) {
		if(!supplemental) {
			h.displayErrorPage(res, 'The requested supplemental does not exist',
						'Supplemental not found!');
		} else {
			supplemental.destroy();
			db.Item.destroy({
				where: {
					SupplementalId: req.params.supplemental
				}
			})
			.then(function() {
				res.redirect('/proposals/' + supplemental.ProposalId);
			});
		}
	});
});

//update title of supplemental and redirects
router.post('/supplemental/:supplemental/:item', function(req, res) {
	if(req.params.item == 0) {
		db.Supplemental.update(
		{
			Title: req.body['SupplementalTitle']
		}, 
		{
			where: {id: req.params.supplemental}
		})
		.then(function() {
			res.redirect('/supplemental/' + req.params.supplemental + '/' + req.params.item)
		});
	} else {
		db.Item.find({
			where: {
				id: req.params.item
			}
		})
		.then(function(item) {
			db.Item.update(req.body, {
				where: {
					id: req.params.item
				}
			})
			.then(function(item) {
				if (!item) {
					res.send(404);
				} 
				res.redirect('/supplemental/' + req.params.supplemental + '/' + req.params.item)
			});
		});
	}
});

