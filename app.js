var http = require('http'); //for rerouting during netid logins
var https = require('https'); //for rerouting during netid logins
var express = require('express'); //the xpress app framework
var glob = require('glob'); //allows for globbing files by names
var favicon = require('serve-favicon'); //literally oinly serves favicons
var logger = require('morgan'); //logs things to files 
var cookieParser = require('cookie-parser'); //no explanation needed
var bodyParser = require('body-parser'); //parses json, html, etc to html
var compress = require('compression'); //compresses files and output to users
var passport = require('passport'); //user authentication
var shib = require('passport-uwshib'); //for shiubboleth authentication
var session = require('express-session'); //for user sessions
var fs = require('fs'); //to read files
var config = require('./config/config'); //configuration file 
var db = require('./app/models'); //database connections

var app = express(); //let's get started!


//authentication for uwnetid shibboleth communication
var loginURL = '/login';
var loginCallbackURL = '/login/callback';
var httpPort = process.env.HTTPPORT || 80;
var httpsPort = process.env.HTTPSPORT || 443;
//load certificate files
var pubCert = fs.readFileSync(config.root + 'security/server-cert.pem', 'utf-8');
var privKey = fs.readFileSync(config.root + 'security/server-pvk.pem', 'utf-8');


app.set('views', config.root + 'app/views');
app.set('view engine', 'jade');

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.use(favicon('public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(compress());
app.use(express.static(config.root + '/public'));

app.use(cookieParser('secret'));
app.use(session({
	secret: "TemporarySecretKey",
/*    key: fs.readFileSync('security/session-secret.txt', 'utf-8'),
    cookie: {secret: true}*/
}));
app.use(passport.initialize());
app.use(passport.session());
//create teh strategy for passport and have it use it
var strat = new shib.Strategy({
	entityId : "https://uwstf.org",
	privateKey : privKey,
	callbackUrl : loginCallbackURL,
	domain : "uwstf.org"
});
passport.use(strat);

//serialize and deserialize the user's session
passport.serializeUser(function(user, done) {
  done(null, user);
});
 
passport.deserializeUser(function(user, done) {
    done(null, user);
});

//user login, login callback, and metadata routes for netid
app.get(loginURL, passport.authenticate(strat.name), shib.backToUrl());
app.post(loginCallbackURL, passport.authenticate(strat.name), shib.backToUrl());
app.get(shib.urls.metadata, shib.metadataRoute(strat, pubCert));

//require auth on all pages
//app.use(shib.ensureAuth(loginURL));
//or just the ones I want 
/* app.get('protected/thing', shib.ensureAuth('/login'), function(req, response) {
	//routing
}); */


//removes evil trailing slashes off of requests for pages. This fixes
//issues with error pages not loading if we're deep in folder
//hierarchies, and simplifies the types of pages we have to look for.
app.use(function removeTrailingSlashes(req, res, next) {
	var url = req.url;
	if(url.substring(url.length- 1, url.length) == '/' && url.length > 1) {
		console.log('removed trailing slash');
		res.redirect(301, url.substring(0, url.length - 1));
	} else {
		next();
	}
});


//for seamless integration fo new users. An Admin will add a netid, 
//and when that netid logs in, we grab their info and insert it to teh database
app.use(function memberAddIfNotExists(req, res, next) {
	if (req.user) {
		db.User.find({
			where: {
				NetId: req.user.netId
			}
		}).then(function(user) {
			if (user && !user.RegId) {
				console.log('new user!');
				console.log('regid is '+ user.RegId);
				console.log(!user.RegId)
				user.updateAttributes({
					RegId: req.user.regId,
					FirstName: req.user.givenName,
					LastName: req.user.surname
				}).then(function() {
					next();
				});
			} else {
				next();
			}
		});
	} else {
		console.log('failed req.user')
		next();
	}
});

//adds a flag to users if they're logged in if they're admins
app.use(function adminCheck(req, res, next) {
	if (req.user) {
		db.User.find({
			where: {
				RegId: req.user.regId
			}
		}).then(function(user) {
			if (user && user.Permissions && user.Permissions == 2) {
				res.locals.isAdmin = true;
			} else {
				res.locals.isAdmin = false;
			}
			next();
		});
	} else { //needed or it doesnt wait for callback
		next();
	}
});


//assigns either "login" or the user's name to the response locals
app.use(function passUserName(req, res, next) {
	var netId = null;
	if (req.user && req.user.netId) {
		var netId = req.user.netId;
	}
	res.locals.netId = netId;
	next();
});

//grabs all the controllers in the folder, and adds them to the controllers
//list. synchronous function.
var controllers = glob.sync(config.root + '/app/controllers/*.js');
controllers.forEach(function assignController(controller) {
	require(controller)(app);
});


app.use(function fileNotFound(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

//if we're in development, give verbose errors
if(app.get('env') === 'development'){
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err,
			title: 'error'
		});
	});
}

//dont give verbose errors 
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {},
		title: 'error'
	});
});


//https server nbetid auth shib
//create https server and pass the express app
var httpsServer = https.createServer({
	key : privKey,
	cert : pubCert 
}, app);

var httpServer = http.createServer(function(req, res) {
	var redirURL = config.domain;
	redirURL += req.url;
	res.writeHead(301, {'Location' : redirURL});
	res.end();
	console.log("redirected to " + redirURL);
});



db.sequelize
	.sync()
	.then(function() {
		httpsServer.listen(443, function() {
			console.log('https listening on ' + httpsServer.address().port);
		});
		httpServer.listen(80, function() {
			console.log('http listening on ' + httpServer.address().port);
		});
	}).catch(function(e) {
		throw new Error(e);
	});


