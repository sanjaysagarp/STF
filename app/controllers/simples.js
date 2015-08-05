//faq, about, contact and other likewise simple, static pages
//this document also holds the data that is displayed on the pages

var express = require('express');
var	router = express.Router();

module.exports = function(app) {
	app.use('/', router);
};


//displays the hellowworld page
router.get('/helloworld', function serveHelloWorld(req, res) {
	res.render('simples/helloworld',
		{title : 'heheheh'}
	);
});


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


//displays the contact page
router.get('/contact', function serveContact(req, res) {
	res.render('simples/contact', {
		title : 'Contact Us',
		
		contacts : [{
			title : 'Chair',
			name : 'David Goldstone',
			email : 'STFChair@uw.edu'
		}, {	
			title : 'Program Coordinator',
			name : 'Alton Lu',
			email : 'TechFee@uw.edu'
		}, {
			title : 'Web Developer',
			name : 'Bryce Kolton',
			email : 'BBKolton@uw.edu'
		}]
	});
});


//displays the faq page. 
router.get('/faq', function serveFaq(req, res) {
	res.render('simples/faq', {
		title : 'Frequently Asked Questions',
		faqs : {
			students : [{
				q : 'May I Attend a Meeting?',
				a : 'Yes! All meetings are open to any visitors. Due to time constraints, you may not be able to ask questions to presenters or the committee, but we encourage and welcome visitors. All of our meetings are posted on the <a href="/calendar">calendar</a>.'
			} , {
				q : 'Does the STF Committee Use all of its Funds?',
				a : 'Over several fiscal years, all money given to STF by the fee is expended for student technological needs. In any given year, the Committee may decide not to use all its funds, due to low proposal numbers, low quality proposals, or expected higher-than-average need the following year. These funds roll into the next fiscal year.'
			} ,{
				q : 'I\'m a Graduate or Professional Student, How Does the STF Work for me?',
				a : 'You pay the same STF that all other students at UW pays. As such, we consider your place in the general student body, and the needs you have. While a specific resource we fund may not be utilized very much by the graduate community, others usually will.'
			} , {
				q : 'I\'m a Student, am I Required to Pay the Fee?',
				a : 'Yes. The STF is part of your tuition bill. All matriculated students of the University of Washington must pay the fee, as dictated by the Washington State Legislature. For more info, see <a href="/about">about the STF</a>.'
			}] , 
			authors : [{
				q : 'What is Fast Track?',
				a : 'The STF Committee rarely uses all of the funds available in a year. Unused money is rolled over into the next year, and available immediately for proposals. Usually, the Committee will have a quick, early session during the begginning of Fall Quarter where proposals that must be funded before the next Summer can be heard. Voting and funding is put on an accelerated schedule.'
			} , {
				q : 'When Will I Receive my Funds?',
				a : 'Funds are sent out after Spring Quarter ends. You can expect them to arrive sometime during Summer Quarter. If you were on Fast Track, you will hear back from us within a week of voting, and should receive your funds within several weeks.'
			} , {
				q : 'Will You Fund My Department\'s Basic Technological Needs?',
				a : 'Likely, no. The STF exists to supplement student technological needs, not as a crutch for departments. It is expected that a fictional Department of Underwater Basket Weaving would provide its students with wicker and water, which seem rather essential to the education of that department\'s students. The Committee expects departments to fund such basic requirements. A good rule of thumb is if the answer to the question "Could my students learn without [item]" is yes, the Committee will likely ask the department to fund the item. More information is available in the policy section'
			} , {
				q : 'How Can I Best Present to the Committee?',
				a : 'A good presentation quickly goes over what the proposal is, the purpose of the proposal, how many students will use the funded proposal, any past similar proposals, any similar funded proposals already on campus, and departmental support.'
			} , {
				q : 'How Long May I Present For?',
				a : 'You will have about 3-5 minutes to present, and then will be questioned by the committee until seen fit. A lack or plethora of questions does not indicate how the committee will vote.'
			} , {
				q : 'Should I Present for the Whole Time?',
				a : 'Often, no. Simple proposals, such as for printers or a small computer lab, often do not need to spend the whole allotted time. Committee members will ask questsions to fill in any knowledge gaps that they missed out on if confused. More complicated proposals generally should spend more time explaining, but if you run out of words to say, just end your presentation early to allow for more questions if need be.'
			}]
		}
	});
});