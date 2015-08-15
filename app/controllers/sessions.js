var express = require('express');
var	router = express.Router();
var	db = require('../models');
var session = require("express-session");
var passport = require('passport');

module.exports = function(app) {
	app.use('/', router);
};

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