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
router.get('/supplemental/new/:id', function(req, res) {
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

				//create thye partial
				db.Supplemental.create({
					AuthorId: user.id,
					ProposalId: req.params.id
				}).then(function(supplemental) {
					
					//create each duplicated item, bound tot he partial
					for (item in items) {
						var i = items[item].dataValues;
						i.id = null;
						i.createdAt = null;
						i.updatedAt = null;
						i.SupplementalId = supplemental.id;
						db.Item.create(i);
					}
					redirect = supplemental.id;

				//redirect to new partial
				}).then(function() {
					res.redirect('/supplemental/' + redirect + '/0');
				})
			})
		}
	})
});


