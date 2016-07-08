var express = require('express');
var	router = express.Router();
var fs = require('fs');
var shib = require('passport-uwshib');
router.use( require('express-subdomain-handler')({ baseUrl: 'uwstf.org', prefix: 'subdomain', logger: true }) ); //uses subdomain of 'discover'

module.exports = function(app) {
	app.use('/', router);
};

router.get('/subdomain/discover', function(req, res){
	res.render('discover/index', {
			title: "Hiya"
		});
});