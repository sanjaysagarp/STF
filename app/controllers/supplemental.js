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
			
			var editor = false;
			if (req.user) {
				editor = h.approvedReporter(res, req.user, proposal, false);
			}
			//find all items associated with supplemental
			db.Item.findAll({
				where: {
					ProposalId: proposal.id,
					SupplementalId: req.params.supplemental
				}
			})
			.then(function(itemsRaw) {
				//find all items associated with proposal
				//item, price, quantity
				var items = [];
				for (itemRaw in itemsRaw) {
					var i = {
						id: itemsRaw[itemRaw].id,
						ItemName: itemsRaw[itemRaw].ItemName,
						Group: itemsRaw[itemRaw].Group,
						Price: itemsRaw[itemRaw].Price,
						Quantity: itemsRaw[itemRaw].Quantity,
						Description: itemsRaw[itemRaw].Description,
						Justification: itemsRaw[itemRaw].Justification
					};
					items.push(i);
				}
				
				//need to check is user has voted or not -- search for user and vote
				db.User.find({
					where: {
						RegId: req.user.regId
					}
				})
				.then(function(user) {
					db.Vote.find({
						where: {
							VoterId: user.id,
							SupplementalId: req.params.supplemental
						}
					})
					.then(function(vote) {
						//check if proposal status is fully funded to get items from that
						if(proposal.Status == 4) {
							db.Item.findAll({
								where: {
									ProposalId: proposal.id,
									SupplementalId: null,
									PartialId: null
								}
							})
							.then(function(originalItemsRaw) {
								//need to parse through both original FUNDED ITEMS -- check proposal for status (5 is partial funded, 4 is fully funded)
								//create a new list of different items
								//how to compare the lists?
								var originalItems = [];
								for (originalItemRaw in originalItemsRaw) {
									var i = {
										id: originalItemsRaw[originalItemRaw].id,
										ItemName: originalItemsRaw[originalItemRaw].ItemName,
										Group: originalItemsRaw[originalItemRaw].Group,
										Price: originalItemsRaw[originalItemRaw].Price,
										Quantity: originalItemsRaw[originalItemRaw].Quantity,
										Description: originalItemsRaw[originalItemRaw].Description,
										Justification: originalItemsRaw[originalItemRaw].Justification
									};
									originalItems.push(i);
								}
								//parse through supplemental items
								//check if supplemental item is found in original items - if no: add to modifiedItemsList
								var modifiedItems = [];
								//searches through supplemental items
								for (item in items) {
									//foreach sup item, check if it's found in the original funded items
									//if not, add to modified items
									var c = notContains(items[item], originalItems);
									if(c != undefined) {
										if(items[item] != undefined) {
											var i;
											if(c.Price != items[item].Price && c.Quantity != items.Quantity) {
												i = {
													ItemName: items[item].ItemName,
													Group: items[item].Group,
													PriceText: c.Price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " >> $" + items[item].Price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
													Price: items[item].Price,
													QuantityText: c.Quantity + " >> " + items[item].Quantity,
													Quantity: items[item].Quantity,
													Description: items[item].Description,
													Justification: items[item].Justification
												};
											} else if(c.Price != items[item].Price) {
												i = {
													ItemName: items[item].ItemName,
													Group: items[item].Group,
													PriceText: c.Price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " >> $" + items[item].Price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
													Price: items[item].Price,
													Quantity: items[item].Quantity,
													Description: items[item].Description,
													Justification: items[item].Justification
												};
											} else {
												i = {
													ItemName: items[item].ItemName,
													Group: items[item].Group,
													Price: items[item].Price,
													QuantityText: c.Quantity + " >> " + items[item].Quantity,
													Quantity: items[item].Quantity,
													Description: items[item].Description,
													Justification: items[item].Justification
												};
											}
											modifiedItems.push(i);
										}
									}
								}
								
								for (originalItem in originalItems) {
									var c = getDeletedItems(originalItems[originalItem], items)
									if(c != undefined) {
										var i = {
											ItemName: c.ItemName,
											Group: c.Group,
											Price: c.Price,
											QuantityText: c.Quantity + " >> " + 0,
											Quantity: 0,
											Description: c.Description,
											Justification: c.Justification
										};
										modifiedItems.push(i);
									}
								}
								
								db.Vote.findAll({
									where: {
										SupplementalId: req.params.supplemental,
										Value: 1
									}
								})
								.then(function(yesVotes) {
									db.Vote.findAll({
										where: {
											SupplementalId: req.params.supplemental,
											Value: 0
										}
									})
									.then(function(noVotes) {
										res.render('proposals/supplemental',{
											title: 'Supplemental for ' + proposal.ProposalTitle,
											supplemental: supplemental,
											items: items,
											originalItems: originalItems,
											modifiedItems: modifiedItems,
											editor: editor,
											vote: vote,
											yesVotes: yesVotes,
											noVotes: noVotes
										});
									});
								});
							});
						//proposal--partially funded
						} else if (proposal.Status == 5) {
							db.Item.findAll({
								where: {
									ProposalId: proposal.id,
									SupplementalId: null,
									PartialId: proposal.PartialFunded
								}
							})
							.then(function(partialItemsRaw) {
								//need to parse through both original FUNDED ITEMS -- check proposal for status (5 is partial funded, 4 is fully funded)
								//create a new list of different items
								//how to compare the lists?
								var partialItems = [];
								for (partialItemRaw in partialItemsRaw) {
									var i = {
										id: partialItemsRaw[partialItemRaw].id,
										ItemName: partialItemsRaw[partialItemRaw].ItemName,
										Group: partialItemsRaw[partialItemRaw].Group,
										Price: partialItemsRaw[partialItemRaw].Price,
										Quantity: partialItemsRaw[partialItemRaw].Quantity,
										Description: partialItemsRaw[partialItemRaw].Description,
										Justification: partialItemsRaw[partialItemRaw].Justification
									};
									partialItems.push(i);
								}
								
								//parse through supplemental items
								//check if supplemental item is found in partial items - if no: add to modifiedItemsList
								var modifiedItems = [];
								for (item in items) {
									//foreach sup item, check if it's found in the partial funded items
									//if not, add to modified items
									var c = notContains(items[item], partialItems);
									if(c != undefined) {
										if(items[item] != undefined) {
											var i;
											if(c.Price != items[item].Price && c.Quantity != items.Quantity) {
												i = {
													ItemName: items[item].ItemName,
													Group: items[item].Group,
													PriceText: c.Price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " >> $" + items[item].Price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
													Price: items[item].Price,
													QuantityText: c.Quantity + " >> " + items[item].Quantity,
													Quantity: items[item].Quantity,
													Description: items[item].Description,
													Justification: items[item].Justification
												};
											} else if(c.Price != items[item].Price) {
												i = {
													ItemName: items[item].ItemName,
													Group: items[item].Group,
													PriceText: c.Price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " >> $" + items[item].Price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
													Price: items[item].Price,
													Quantity: items[item].Quantity,
													Description: items[item].Description,
													Justification: items[item].Justification
												};
											} else {
												i = {
													ItemName: items[item].ItemName,
													Group: items[item].Group,
													Price: items[item].Price,
													QuantityText: c.Quantity + " >> " + items[item].Quantity,
													Quantity: items[item].Quantity,
													Description: items[item].Description,
													Justification: items[item].Justification
												};
											}
											modifiedItems.push(i);
										}
									}
								}
								
								for (partialItem in partialItems) {
									var c = getDeletedItems(partialItems[partialItem], items)
									if(c != undefined) {
										var i = {
											ItemName: c.ItemName,
											Group: c.Group,
											Price: c.Price,
											QuantityText: c.Quantity + " >> " + 0,
											Quantity: 0,
											Description: c.Description,
											Justification: c.Justification
										};
										modifiedItems.push(i);
									}
								}
								//check if supplemental items are found in original items
								//if it isn't, add to separate lists (one for olditems and one for new items)
								//once those lists are separate, highlight that as what is changed (red text)
								db.Vote.findAll({
									where: {
										SupplementalId: req.params.supplemental,
										Value: 1
									}
								})
								.then(function(yesVotes) {
									db.Vote.findAll({
										where: {
											SupplementalId: req.params.supplemental,
											Value: 0
										}
									})
									.then(function(noVotes){
										res.render('proposals/supplemental',{
											title: 'Supplemental for ' + proposal.ProposalTitle,
											supplemental: supplemental,
											items: items,
											originalItems: partialItems,
											modifiedItems: modifiedItems,
											editor: editor,
											vote: vote,
											yesVotes: yesVotes,
											noVotes: noVotes
										});
									});
								});
							});
						} else {
							h.displayErrorPage(res, 'The requested supplemental does not exist',
								'Supplemental not found!');
						}
					});
				});
				
			});
		});
	});
});

//create a new supplemental with duplicated items
router.get('/supplementals/new/:id', function(req, res) {
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
									//show vote totals
									
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
			Title: req.body['SupplementalTitle'],
			Abstract: req.body['Abstract']
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

//approve or deny a supplemental -- must check if there's enough votes to change supplemental status (only on vote accepted)
router.post('/api/v1/vote/supplemental/:supplemental', function(req, res) {
	//need to check if active user
	db.User.find({
		where: {
			RegId: req.user.regId
		}
	})
	.then(function(user) {
		//create the vote and send a message back
		if(user) {
			//need to check if user has voted already
			db.Vote.find({
				where : {
					SupplementalId: req.params.supplemental,
					VoterId: user.id
				}
			})
			.then(function(vote) {
				if(!vote) {
					db.Vote.create({
						SupplementalId: req.params.supplemental,
						Value: req.body['voteDecision'],
						VoterId: user.id
					})
					.then(function() {
						//look up all votes found in Vote where supplementalid is req.params.supplemental
						//need to refer to how many committee members there are currently - add in helper js
						db.User.findAll({where: {Permissions: 1}}).then(function(committeeMembers) {
							//(committeeMembers.length / 2) + 1;
							db.Vote.findAll({
								where: {
									SupplementalId: req.params.supplemental,
									Value: 1
								}
							})
							.then(function(yesVotes) {
								if (yesVotes.length > Math.floor(((committeeMembers.length / 2) + 1))) {
									//update supplmental to be funded
									db.Supplemental.update(
									{
										Status: 1
									}, 
									{
										where: {id: req.params.supplemental}
									})
								}
							});
							
							db.Vote.findAll({
								where: {
									SupplementalId: req.params.supplemental,
									Value: 0
								}
							})
							.then(function(noVotes) {
								if (noVotes.length > Math.floor(((committeeMembers.length / 2) + 1))) {
									//update supplmental to be not funded
									db.Supplemental.update(
									{
										Status: 2
									}, 
									{
										where: {id: req.params.supplemental}
									})
								}
							});
						});
						
						
						res.redirect('/supplemental/view/' + req.params.supplemental);
					});
				} else {
					h.displayErrorPage(res, 'You have already voted for this supplemental',
						'Vote Rejected');
				}
			});
		} else {
			h.displayErrorPage(res, 'You are not an active member on the committee',
						'Vote Rejected');
		}
	});
	
});

function notContains(supItem, itemArray) {
	for(item in itemArray) {
		if(supItem != undefined && itemArray[item].ItemName == supItem.ItemName && (itemArray[item].Quantity != supItem.Quantity || itemArray[item].Price != supItem.Price)) {
			return itemArray[item];
		}
	}
	return undefined;
}

function getDeletedItems(singleItem, itemArray) {
	for(item in itemArray) {
		if(singleItem != undefined && singleItem.ItemName == itemArray[item].ItemName) {
			return undefined;
		}
	}
	return singleItem;
}