var express = require('express');
var	router = express.Router();
var fs = require('fs');
var shib = require('passport-uwshib');
router.use( require('express-subdomain-handler')({ baseUrl: 'uwstf.org', prefix: 'subdomain', logger: true }) ); //uses subdomain of 'discover'

router.get('/subdomain/discover/home', function(req, res){
	res.send("Subdomain huzzuh!");
});

module.exports = function(app) {
	app.use('/', router);
};