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


//create a new supplemental with duplicated items
router.get('/supplementals/new/:id', function(req, res) {
	db.User.find({
		where: {RegId: req.user.regId}
	}).then(function(user) {
		//THIS SHOULD WORK -- IF NOT, you're not finding proposal correctly
		if (h.approvedEditor(res, req.user, db.Proposal.find({where:{id: req.params.id}}))) {

			//get all base items from the original proposal
			db.Item.findAll({
				where: {
					ProposalId: req.params.id,
					SupplementalId: null
				}
			}).then(function(items) {
				var redirect;

				//create the supplemental
				db.Supplemental.create({
					AuthorId: user.id,
					ProposalId: req.params.id
				}).then(function(supplemental) {
					
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
				}).then(function() {
					res.redirect('/supplemental/' + redirect + '/0');
				})
			})
		}
	})
});

//get a supplemental by its item
router.get('/supplemental/:supplemental/:item', function(req, res) {
	db.User.find( {
		where: {
			RegId: req.user.regId
		}
	}).then(function(user) {
		//Should change check to if editor
		if (true || h.activeCommitteeMember(res, user)) {

			//get the supplemental 
			db.Supplemental.findById(req.params.supplemental).then(function(supplemental) {
				
				//so long as the author is the supplemental's author or the user is an admin
				if (res.locals.isAdmin || (supplemental)) {
					db.Proposal.find({
						where: {
							id: supplemental.ProposalId,
						}
					}).then(function(proposal) {

						//need to check proposal status (if submitted or awaiting decision)
						//grab all items that match the supplemental
						db.Item.findAll({
							where: {
								SupplementalId: supplemental.id,
							}
						}).then(function(items) {
							if (req.params.item != 0) {
								db.Item.find({
									where: {
										id: req.params.item
									}
								}).then(function(item) {
									res.render('items/supplementalview',{
										title: 'Supplemental for ' + proposal.ProposalTitle,
										item: item,
										items: items,
										supplemental: supplemental,
										proposal: proposal
									});									
								})
							} else {
								res.render('items/supplementalview',{
									title: 'Supplemental for ' + proposal.ProposalTitle,
									item: 0,
									items: items,
									supplemental: supplemental,
									proposal: proposal
								});
							}
						})
					})

				} else { 
					h.displayErrorPage(res, 'The requested supplemental could not be found or you are not the author',
						'Requested does not Exist');
				}
			})
		} 
	})
});


//change item data on a supplemental
router.post('/supplemental/:supplemental/:item', function(req, res) {
	db.User.find({
		where: {
			RegId: req.user.regId
		}
	}).then (function(user) {
		db.Supplemental.findById(req.params.supplemental)
		.then(function(supplemental) {
			if (res.locals.isAdmin || (supplemental && supplemental.AuthorId == user.id)) {
				if (req.params.item != 0) {
					db.Item.find({
						where: {
							id: req.params.item
						}
					}).then(function(item) {
						db.Item.update(req.body, {
							where: {
								id: req.params.item
							}
						}).then(function(item) {
							if (!item) {
								res.send(404);
							} 
							res.redirect('/supplemental/' + req.params.supplemental + '/' + req.params.item)
						});
					});
				} else {
					if (req.body['delete']) {
							res.redirect('/proposals/' + supplemental.ProposalId);
							supplemental.destroy()
						
							db.Item.destroy({
								where: {
									SupplementalId: req.params.supplemental
								}
							})
					} else {
						db.Supplemental.update({
							Title: req.body['SupplementalTitle']
						}, {
							where: {id: req.params.supplemental}
						}).then(function() {
							res.redirect('/supplemental/' + req.params.supplemental + '/' + req.params.item)
						})
					}
				}
			} else {
				h.displayErrorPage(res, 'You cannot edit this item', 'Change Refused');
			}
		})
	})
});

