//displays a 
var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');

module.exports = function(app) {
	app.use('/', router);
};


router.post('/items/new', shib.ensureAuth('/login'), function(req, res) {
	console.log("trying to submit");
	console.log(req.body);
	db.Item.create(req.body).then(function(item){
		console.log("Item Created");
		res.json({message: "Success", 
			item:item
		});
	});
});

router.get('/item/:id', shib.ensureAuth('/login'), function(req,res,next) {
	console.log("in item.js");
	console.log("executing Query with item name: " + req.params.id);
	db.Item.find({
		where: {
			id: req.params.id
		}
	}).then(function(item) {
		console.log(item);
		db.Item.findAll({
			where: {
				ProposalCode: item.ProposalCode
			}
		}).then(function(items) {
			db.Proposal.find({
				where: {
					id: item.ProposalCode
				}
			}).then(function(proposal) {
				res.render('item',{
					item: item,
					items: items,
					proposal: proposal
				});
			});
		});
	});
});

router.post('/item/:id', shib.ensureAuth('/login'), function(req, res) {
	console.log("updating item");
	db.Item.find({
		where: {
			id: req.params.id
		}
	}).then(function(item) {
		if (!item) {
			res.send(404);
		}
		db.Item.update(req.body, {
			where: {
				id: req.params.id
			}
		}).then(function(item) {
			 res.redirect('/item/' + req.params.id)
		});
	});
})
