var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
	domain: "https://uwstf.org",
	root: rootPath + '/',
	app: {
		name: 'stf'
	},
	port: 80,
	db: 'mysql://root:STFP@ss@localhost:3306/test',
	sessionSecret: '4QM9bUORPjg0IjqYdFCrpFcgepzF4WQKo0BthuLc',
	cookieSecret: 'Rax8W8EtmqgNUwtFfntN9BVJjcyWSvg8YtOLIlJq',
	sequelize: function() {
		var sequelize =  require('sequelize');
		return new sequelize('STF', 'root', 'STFP@ssW0rd', {
			host: "127.0.0.1",
			port: 3306
		});
	}
};

module.exports = config;
