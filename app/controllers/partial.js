var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var h = require('../helper');


module.exports = function(app) {
	app.use('/', router);
};

router.get('/partials/new/:id', shib.ensureAuth('/login'), function(req, res) {
	db.User.find({
		where: {
			RegId: req.user.regId
		}
	}).then(function(user) {
		if (user && user.Permissions > 0) {

			db.Item.findAll({
				where: {
					ProposalId: req.params.id,
					PartialId: null
				}
			}).then(function(items) {
				var redirect;
				db.Partial.create({
					AuthorId: user.id,
					ProposalId: req.params.id
				}).then(function(partial) {
					console.log('partial id ' + partial.id)
					for (item in items) {
						var i = items[item].dataValues;
						i.id = null;
						i.createdAt = null;
						i.updatedAt = null;
						i.PartialId = partial.id;
						db.Item.create(i);
					}
					redirect = partial.id;
				}).then(function() {
					res.redirect('/partial/' + redirect + '/0');
				});
			})

		} else {
			res.render('error', {
				message: 'You are not a member of the STF committee',
				error: {status: 'Access Denied'}
			});
		}
	})
});

router.get('/partial/:partial/:item', shib.ensureAuth('/login'), function(req, res) {
	db.User.find( {
		where: {
			RegId: req.user.regId
		}
	}).then(function(user) {
		if (user && user.Permissions > 0) {

			db.Partial.find({
				where: {
					id: req.params.partial
				}
			}).then(function(partial) {
				if (res.locals.isAdmin || (partial && partial.AuthorId == user.id)) {
					db.Proposal.find({
						where: {
							id: partial.ProposalId,
						}
					}).then(function(proposal) {
						db.Item.findAll({
							where: {
								PartialId: partial.id,
							}
						}).then(function(items) {
							if (req.params.item != 0) {
								db.Item.find({
									where: {
										id: req.params.item
									}
								}).then(function(item) {
									res.render('items/partialview',{
										item: item,
										items: items,
										partial: partial,
										proposal: proposal
									});									
								})
							} else {
								res.render('items/partialview',{
									item: items[0],
									items: items,
									partial: partial,
									proposal: proposal
								});
							}
						})
					})



				} else { //we have a partial already created
					res.render('error', {
						message: 'The requested partial could not be found or you are not the author',
						error: {status: 'Requested does not Exist'}
					});
				}
			})




		} else {
			res.render('error', {
				message: 'You are not a member of STF', 
				error: {status: 'access denied'}
			})
		}
	})
});

router.post('/partial/:partial/:item', shib.ensureAuth('/login'), function(req, res) {
	console.log("updating item");
	db.Item.find({
		where: {
			id: req.params.item
		}
	}).then(function(item) {
		if (!item) {
			res.send(404);
		} 
		db.User.find({
			where: {
				RegId: req.user.regId
			}
		}).then (function(user) {
			if (res.locals.isAdmin || (partial && partial.AuthorId == user.id)) {
				db.Item.update(req.body, {
					where: {
						id: req.params.item
					}
				}).then(function(item) {
					 res.redirect('/partial/' + req.params.partial + '/' + req.params.item)
				});
			} else {
				h.displayErrorPage(res, 'You cannot edit this item', 'Chnage Refused');
			}
		})
	});
});

