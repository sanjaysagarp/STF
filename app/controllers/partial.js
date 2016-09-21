//partials pages

var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var h = require('../helper');

module.exports = function(app) {
	app.use('/', router);
};

//ensure login on all partial pages
router.all('/partial*', shib.ensureAuth('/login'), function(req, res, next) {next()} );


//create a new partial with duplicated items
router.get('/partials/new/:id', function(req, res) {
	db.User.find({
		where: {RegId: req.user.regId}
	}).then(function(user) {

		if (res.locals.isCommitteeMember || res.locals.isAdmin) {

			//get all base items from the original proposal
			db.Item.findAll({
				where: {
					ProposalId: req.params.id,
					PartialId: null
				}
			}).then(function(items) {
				var redirect;

				//create thye partial
				db.Partial.create({
					AuthorId: user.id,
					ProposalId: req.params.id
				}).then(function(partial) {
					
					//create each duplicated item, bound tot he partial
					for (item in items) {
						var i = items[item].dataValues;
						i.id = null;
						i.createdAt = null;
						i.updatedAt = null;
						i.PartialId = partial.id;
						console.log(i);
						db.Item.create(i).then(function(newItem) {
							//find old location row and creates location for new item
							if(newItem.LocationId) {
								db.Location.find({
									where : {
										id: newItem.LocationId
									}
								})
								.then(function(location) {
									//creates new location if found
									db.Location.create({
										ItemId: newItem.id,
										ProposalId: location.ProposalId,
										Address: location.Address,
										Lat: location.Lat,
										Lng: location.Lng,
										Description: location.Description
									})
									.then(function(newLocation) {
										db.Item.update({
											LocationId: newLocation.id
										}, {
											where: {
												id: newItem.id
											}
										});
									});
								});
							}
						});
					}
					redirect = partial.id;

				//redirect to new partial
				}).then(function() {
					res.redirect('/partial/' + redirect + '/0');
				})
			})
		}
	})
});


//get a partial by its item
router.get('/partial/:partial/:item', function(req, res) {
	db.User.find( {
		where: {
			RegId: req.user.regId
		}
	}).then(function(user) {
		if (h.activeCommitteeMember(res, user)) {

			//get the partial 
			db.Partial.find({where : {id: req.params.partial}})
				.then(function(partial) {
				
				//so long as the author is the partial's author or the user is an admin
				if (res.locals.isAdmin || (partial && partial.AuthorId == user.id)) {
					db.Proposal.find({
						where: {
							id: partial.ProposalId,
						}
					}).then(function(proposal) {

						//need to check proposal status (if submitted or awaiting decision)
						//grab all items that match the partial
						db.Item.findAll({
							where: {
								PartialId: partial.id,
								SupplementalId: null
							}
						}).then(function(items) {
							if (req.params.item != 0) {
								db.Item.find({
									where: {
										id: req.params.item
									}
								}).then(function(item) {
									res.render('items/partialview',{
										title: 'Partial for ' + proposal.ProposalTitle,
										item: item,
										items: items,
										partial: partial,
										proposal: proposal
									});									
								})
							} else {
								res.render('items/partialview',{
									title: 'Partial for ' + proposal.ProposalTitle,
									item: 0,
									items: items,
									partial: partial,
									proposal: proposal
								});
							}
						})
					})

				} else { 
					h.displayErrorPage(res, 'The requested partial could not be found or you are not the author',
						'Requested does not Exist');
				}
				});
		} 
	});
});


//change item data on a partial
router.post('/partial/:partial/:item', function(req, res) {
	db.User.find({
		where: {
			RegId: req.user.regId
		}
	}).then (function(user) {
		db.Partial.find({where : {id: req.params.partial}})
			.then(function(partial) {
				if (res.locals.isAdmin || (partial && partial.AuthorId == user.id)) {
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
								res.redirect('/partial/' + req.params.partial + '/' + req.params.item)
							});
						});
					} else {
						if (req.body['delete'] == 'true') {
								res.redirect('/proposals/' + partial.ProposalId);
								partial.destroy()
							
								db.Item.destroy({
									where: {
										PartialId: req.params.partial
									}
								})
						} else {
							db.Partial.update({
								Title: req.body['PartialTitle']
							}, {
								where: {id: req.params.partial}
							}).then(function() {
								res.redirect('/partial/' + req.params.partial + '/' + req.params.item)
							})
						}
					}
				} else {
					h.displayErrorPage(res, 'You cannot edit this item', 'Change Refused');
				}
			});
	});
});

