var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
	domain: "https://uwstf.org",
	root: rootPath + '/',
	app: {
		name: 'stf'
	},
	port: 80,
	db: 'mysql://root:STFP@ss@localhost:3306/test'
};

module.exports = config;
