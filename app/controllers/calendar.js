//prepares and shows the clanedar

var express = require('express');
var	router = express.Router();

module.exports = function(app) {
	app.use('/', router);
};

router.get('/calendar', function serveCalendar(req, res) {
	res.render('calendar',
		{title : 'Calendar'}
	);
});