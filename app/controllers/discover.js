var express = require('express');
var sequelize = require('sequelize');
var	router = express.Router();
var fs = require('fs');
var	db = require('../models');
var gmConfig = require('../../config/google'); //google key
var categories = require('../../config/categories');

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
	// 1. Yearly funding by departments - All Time, 2016, 2015...
	// Get total requested and total funded in an array for each year (value on clientside will determine the year 2001 - 0, 2002 - 1..)
	
	//The data orientation is gonna split into two main queries : 2001 - 2015, 2016+
	//Need Department Name, Award Amount
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
		getProposalsAndAwards(function(props) {
			for(prop in props) {
				if(year != props[prop].Year) {
					i++;
					year++;
					year_proposal[i] = [];
				}
				year_proposal[i].push(props[prop]);
			}
			getDepartments(function(departments) {
				res.render('discover/funds', {
					title: "Allocation of Funds",
					proposals: year_proposal,
					departments: departments,
					categories: categories
					});
			});
		});
	});
});

// sql query for retrieving all proposals 2016+ with award amounts (Not funded, Partially Funded and Fully Funded)
function getProposalsAndAwards(next) {
	db.sequelize.query('SELECT * FROM STF.Proposals p LEFT JOIN STF.Awards a ON p.id = a.ProposalId where p.Status = 4 OR p.Status = 5 OR p.Status = 6;')
	.spread(function(proposals) {
		var props = [];
		var year = 2016;
		for(proposal in proposals) {
			var p = {};
			if(year != proposals[proposal].Year) {
				i++;
				year++;
				year_proposal[i] = [];
			}
			p.Year = proposals[proposal].Year;
			p.Number = proposals[proposal].Number;
			p.UAC = proposals[proposal].UAC;
			p.Category = proposals[proposal].Category;
			p.PrimaryNetId = proposals[proposal].PrimaryNetId;
			p.PrimaryName = proposals[proposal].PrimaryName;
			p.Department = proposals[proposal].Department;
			p.Status = proposals[proposal].Status;
			if(proposals[proposal].FundedAmount) {
				p.Award = proposals[proposal].FundedAmount;
			} else {
				p.Award = 0;
			}
			props.push(p);
		}
		next(props);
	})
}

function getDepartments(next) {
	db.sequelize.query('SELECT DISTINCT Department FROM STF.Proposals ORDER BY Department ASC;')
	.spread(function(deps) {
		var departments = [];
		for(var i = 0; i < deps.length; i++) {
			departments.push(deps[i].Department);
		}
		next(departments);
	})
}