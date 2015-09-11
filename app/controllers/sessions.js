var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');

module.exports = function(app) {
	app.use('/', router);
};

router.get('/user', shib.ensureAuth('/login'), function(req, res) {
	db.findAll
});

/*router.get('/login/callback', function login(req, res) {
	res.render("simples/helloworld");
	console.log("GET REQUEST");
});

router.post("/login/callback", function(req, res) {
	console.log("POST REQUEST");
	res.render("simples/helloworld");
})*/

//login

//logout

//verify