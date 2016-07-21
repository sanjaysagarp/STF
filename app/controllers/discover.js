var express = require('express');
var	router = express.Router();
var fs = require('fs');
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
	res.render('discover/funds', {
		title: "Allocation of Funds"
	});
});