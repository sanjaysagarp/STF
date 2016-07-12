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
	res.render('discover/find/find', {
		title: "Find a resource"
	});
});

router.get('/subdomain/discover/map', function(req, res) {
	res.render('discover/map', {
		title: "Technology Map",
		mapKey: gmConfig.key
	})
});