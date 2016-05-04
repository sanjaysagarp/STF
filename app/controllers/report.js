var promise = require('bluebird')
var express = require('express');
var	router = express.Router();
var	db = require('../models');
var shib = require('passport-uwshib');
var categories = require('../../config/categories');
var h = require('../helper');


module.exports = function(app) {
	app.use('/', router);
};


//Check award controller for report creation!