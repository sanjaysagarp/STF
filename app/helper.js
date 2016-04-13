//a bunch of commonly used helper functions

var db = require('/STF/app/models');
var shib = require('passport-uwshib');
var bb = require('bluebird');

module.exports = {

	//This function accepts the response express parameter, The user from
	//req.user, and a Proposal ID (or proposal), and finally a bool redirect
	//flag. It will check the proposal in question for if a user's netId is
	//listed somewhere in it as an approved editor
	
	//Returns true if approved, false and redirects to error page if not, 
	//and false if redirect flag is false
	approvedEditor: function(res, u, pId, redir) {
		
		if (pId.id === undefined) {
			return db.Proposal.find({where: {id: pId} }).then(function(p) {
				testUser(res, u, p, redir)
			})
		}

		return testUser(res, u, pId, redir);
				
		// checks if user is associated with proposal (Primary, Budget, Dean, Additional...)
		function testUser(res, u, p, redir) {
			if (redir === null) {
				redir = true;
			} if (res.locals.isAdmin || (
				(u.regId == p.PrimaryRegId) ||
				(u.netId.toLowerCase() == p.PrimaryNetId) ||
				(u.netId.toLowerCase() == p.BudgetNetId) ||
				(u.netId.toLowerCase() == p.DeanNetId) || 
				(u.netId.toLowerCase() == p.StudentNetId) ||
				(u.netId.toLowerCase() == p.AdditionalContactNetId1) ||
				(u.netId.toLowerCase() == p.AdditionalContactNetId2) ||
				(u.netId.toLowerCase() == p.AdditionalContactNetId3)
				)&& p.Status < 2)	{ 
				return true;
			} else {
				if (redir) {
					module.exports.displayErrorPage(res, 'You are not an Approved editor of this Proposal', 'Access Denied');
				}
				return false;
			}
		}
	},

	activeCommitteeMember: function(res, uRegId, redir) {

		if (uRegId.id === undefined) {
			return db.User.find({where: {RegId: uRegId}})
				.then(function(u) {
					testUser(res, u, redir)
				})
		} else {
			return testUser(res, uRegId, redir)
		}

		function testUser(res, u, redir) {
			if (redir == null) {
				redir = true;
			}
			if (u && u.Permissions > 0) {
				return true;
			} else {
				if (redir) {
					module.exports.displayErrorPage(res, 'You are not an active committee member', 'Access Denied');
				}
				return false;
			}
		}
	},

	//A simple error page displayer. Accepts res, a message, and the status
	//of hte request
	displayErrorPage: function(res, mess, status) {
		res.render('error', {
			message: mess,
			error: {status: status}
		})
	},


	//
	proposalStatus: function(status) {
		var messages = [
			'Unsubmitted',
			'Submitted',
			'In Voting',
			'Awaiting Decision',
			'Funded',
			'Partially Funded',
			'Not Funded',
			'Cancelled by User',
			'Cancelled by Admin'];
		return "<div class='text-center status-wrap status-" + status + 
			"'><p><b>" + messages[status] + "</b></p></div>";
	}


}