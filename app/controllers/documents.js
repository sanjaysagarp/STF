//shows all documents in public/docs
//allows for the user to traverse the docs tree and
//share documents by copying a url

var express = require('express');
var	router = express.Router();
var glob = require('glob');

module.exports = function(app) {
	app.use('/', router);
};

router.get('/documents*', function serveDocsHome(req, res) {
	//this removes %20 from the requested url to match links with spaces
	req.originalUrl = req.originalUrl.replace('%20', ' ');

	//fun string stuff to make links work
	var dir = '/docs' + req.originalUrl.substr(10);
	var url = req.originalUrl + '/';

	//for moving up a directory
	var goUp = false;
	var folderName = 'Home';
	if (req.originalUrl != '/documents') {
		var end = req.originalUrl.lastIndexOf('/');
		folderName = req.originalUrl.substr(end + 1);
		goUp = true;
	}

	//get all the folders
	var folders = glob.sync('*/', {
		cwd : 'public' + dir
	});
	for (var i = 0; i < folders.length; i++) {
		folders[i] = folders[i].substr(0, folders[i].length - 1);
	}
	
	//get all the files
	var files = glob.sync('*', {
		cwd : 'public' + dir,
		nodir : true
	});

	//attach the files and folders
	res.locals.folders = folders;
	res.locals.files = files;
	res.locals.loc = dir + '/';
	res.locals.goUp = goUp;
	res.locals.url = url;
	res.locals.folderName = folderName;

	//render the doc
	res.render('documents', {
		title : 'Documents',
	});
});