//faq, about, contact and other likewise simple, static pages
//this document also holds the data that is displayed on the pages

var express = require('express');
var	router = express.Router();
var fs = require('fs');
var shib = require('passport-uwshib');


module.exports = function(app) {
	app.use('/', router);
};


router.get('/loginUser', shib.ensureAuth('/login'), function(req, res) {
	res.redirect('/proposals/myproposals')
})

router.get('/user', shib.ensureAuth('/login'), function(req, res) {
	res.redirect('/proposals/myproposals')
})

//displays the homepage
router.get('/', function(req, res, next) {
	res.render('index', {
		title : 'Student Technology Fee'
	});
});


//shows the calendar
router.get('/calendar', function serveCalendar(req, res) {
	res.render('simples/calendar',
		{title : 'Calendar'}
	);
});


//displays the hellowworld page
// router.get('/helloworld', shib.ensureAuth('/login'), shib.ensureAuth('/login'), function serveHelloWorld(req, res) {
// 	res.render('simples/helloworld',
// 		{message : req.session.message}
// 	);
// });


//displays the about page
router.get('/about', function serveAbout(req, res) {
	res.render('simples/about', {
		title : 'About',
		examples : ['Over 200 iMacs for Odegaard',
				'Equipment for the Undergraduate Theater Society',
				'U-Drive Storage',
				'Ionization Source for Department of Chemistry',
				'Clickers for the ASUW Senate',
				'Space Scout appropriated',
				'Dozens of computer labs accross campus',
				'Microsoft Software for all students',
				'Hardware and Software for The Daily',
				'Next Generation Sequencing Pipeline for the Biology Department',
				'Equipment for Earth and Space Sciences',
				'Graphics Processing Units for Applied Mathematics']
	});
});

//displays the policy page
router.get('/policies', function servePolicies(req, res) {
	res.render('simples/policies', {
		title : 'Policies'
	});
});


//displays the contact page
router.get('/contact', function serveContact(req, res) {
	res.render('simples/contact', {
		title : 'Contact Us',
		
		contacts : [{
			title : 'Chair',
			name : 'Bryce Knolton',
			email : 'STFChair@uw.edu'
		}, {	
			title : 'Operations and Finance Manager',
			name : 'Rajiv Raina',
			email : 'TechFee@uw.edu'
		}, {
			title : 'Web Developer',
			name : 'Sanjay Sagar',
			email : 'STFCWeb@uw.edu'
		}, {
			title : 'Proposal Officer',
			name : 'Alec Meade',
			email : 'STFAgent@uw.edu'
		}]
	});
});


//displays the faq page. 
router.get('/faq', function serveFaq(req, res) {
	res.render('simples/faq', {
		title : 'Frequently Asked Questions',
		faqs : {
			students : [{
				q : 'May I attend a Meeting?',
				a : 'Yes! All meetings are open to any visitors. Due to time constraints, you may not be able to ask questions to presenters or the committee, but we encourage and welcome visitors. All of our meetings are posted on the <a href="/calendar">calendar</a>.'
			} , {
				q : 'Does the STF Committee use all of its funds?',
				a : 'Over several fiscal years, all money given to STF by the fee is expended for student technological needs. In any given year, the Committee may decide not to use all its funds, due to low proposal numbers, low quality proposals, or expected higher-than-average need the following year. These funds roll into the next fiscal year.'
			} ,{
				q : 'I\'m a Graduate or Professional Student, how does the STF work for me?',
				a : 'You pay the same STF that all other students at UW pays. As such, we consider your place in the general student body, and the needs you have. While a specific resource we fund may not be utilized very much by the graduate community, others usually will.'
			} , {
				q : 'I\'m a Student, am I required to pay the fee?',
				a : 'Yes. The STF is part of your tuition bill. All matriculated students of the University of Washington must pay the fee, as dictated by the Washington State Legislature. For more info, see <a href="/about">about the STF</a>.'
			}] , 
			authors : [{
				q : 'What happened to Fast Track?',
				a : 'The STFC is moving from a yearly funding schedule to a quarterly schedule. Fast Track proposals were for time-sensitive funding methods and were handled early Winter Quarter. As the committee now approves groups quarterly, there is no longer a need for the Fast Track process. '
			} , {
				q : 'When will I receive my funds?',
				a : 'Funds are sent out by the first day of the next quarter. The exception to this is Spring Quarter, the funds of which will be available starting July 1st. All budgets close on June 30th.'
			} , {
				q : 'Will you fund my department\'s basic technological needs?',
				a : 'Likely, no. The STF exists to supplement student technological needs, not as a crutch for departments. It is expected that a fictional Department of Underwater Basket Weaving would provide its students with wicker and water, which seem rather essential to the education of that department\'s students. The Committee expects departments to fund such basic requirements. A good rule of thumb is if the answer to the question "Could my students learn without [item]" is "no", the committee will likely ask the department to fund the item. More information is available in the Instructional Use document, <a href="/documents/Findings">here</a>.'
			} , {
				q : 'How can I best present to the committee?',
				a : 'A good presentation quickly goes over what the proposal is, the purpose of the proposal, how many students will use the funded proposal, any past similar proposals, any similar funded proposals already on campus, and departmental support.'
			} , {
				q : 'How long may I present for?',
				a : 'You will have about 3-5 minutes to present, and then will be questioned by the committee until seen fit. A lack or plethora of questions does not indicate how the committee will vote.'
			} , {
				q : 'Should I present for the whole time?',
				a : 'Often, no. Simple proposals, such as for printers or a small computer lab, often do not need to spend the whole allotted time. Committee members will ask questsions to fill in any knowledge gaps that they missed out on if confused. More complicated proposals generally should spend more time explaining, but if you run out of words to say, just end your presentation early to allow for more questions if need be.'
			} , {
				q : 'What are metrics?',
				a : 'At any time, although frequently during your presentation and in the time immediately after, the committee members will rank the perceived performance of your proposal, were the committee to fund it. This is a not an exact science, but we try to do the best we can to be impartial to the proposal. We use these metrics as a guide when voting on whether to fund a proposal later in the year. Metrics are never the be-all end-all of our decision making process, and are merely there as an additional help to our regular process of discussion during voting.'
			} , {
				q : 'Are there often conflicts of interest?',
				a : 'Most committee members have many roles throughout campus and ASUW, leading to frequent conflicts of interest were a member to vote on a proposal that would directly impact their other positions within the university. For this reason, members will recuse themselves during voting on a proposal were it to directly impact them.'
			}]
		}
	});
});