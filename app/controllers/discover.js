var express = require('express');
var	router = express.Router();
var fs = require('fs');
var	db = require('../models');
var gmConfig = require('../../config/google'); //google key
router.use( require('express-subdomain-handler')({ baseUrl: 'uwstf.org', prefix: 'subdomain', logger: true }) ); //uses subdomain of 'discover'

module.exports = function(app) {
	app.use('/', router);
};

router.get('/subdomain/discover', function(req, res){
	res.render('discover/index', {
		title: "Discover STF"
	});
});

router.get('/subdomain/discover/find', function(req, res){
	res.render('discover/find', {
		title: "Find a resource"
	});
});

router.get('/subdomain/discover/map', function(req, res) {
	res.render('discover/map', {
		title: "Technology Map",
		mapKey: gmConfig.key
	});
});

router.get('/subdomain/discover/funds', function(req, res) {
	//TODO - Need all data necessary for funding expenditure graph
	// 1. Yearly funding by departments - All Time, 2016, 2015...
	// Get total requested and total funded in an array for each year (value on clientside will determine the year 2001 - 0, 2002 - 1..)
	
	//The data orientation is gonna split into two main queries : 2001 - 2015, 2016+
	//Only need Department Name, Award Amount
	var year_proposal = [];
	var year = 2001;
	var i = 0;
	year_proposal[i] = [];
	db.Legacy_Proposal.findAll({
		where : {
			Decision: ["Rejected","Funded","Partially Funded"]
		}
	})
	.then(function(leg_proposals) {
		for(leg_proposal in leg_proposals) {
			if(year != leg_proposals[leg_proposal].Year) {
				i++;
				year++;
				year_proposal[i] = [];
			}
			year_proposal[i].push(leg_proposals[leg_proposal]);
		}
		//2013+ legacy proposals
		db.Proposal.findAll({
			where: {
				Status: [2,3,4]
			}
		})
		.then(function(proposals) {
			for(proposal in proposals) {
				if(year != proposals[proposal].Year) {
					i++;
					year++;
					year_proposal[i] = [];
				}
				db.Award.find({where:{id: proposals[proposal].id}})
					.then(function(award) {
						if(award) {
							proposals[proposal].Award = award.FundedAmount;
						} else {
							proposals[proposal].Award = 0;
						}
					});
				year_proposal[i].push(proposals[proposal]);
			}

			console.log(year_proposal[3][2]);
			res.render('discover/funds', {
				title: "Allocation of Funds",
				proposals: year_proposal
			});
		});
	});
	// res.render('discover/funds', {
	// 	title: "Allocation of Funds"
	// });
});