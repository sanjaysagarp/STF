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
				
		
		function testUser(res, u, p, redir) {
			if (redir === null) {
				redir = true;
			} if (res.locals.isAdmin || (
				(u.regId == p.PrimaryRegId) ||
				(u.netId == p.PrimaryNetId) ||
				(u.netId == p.BudgetNetId) ||
				(u.netId == p.DeanNetId) || 
				(u.netId == p.StudentNetId) ||
				(u.netId == p.AdditionalContactNetId1) ||
				(u.netId == p.AdditionalContactNetId2) ||
				(u.netId == p.AdditionalContactNetId3)
				) && p.Status == 0)	{
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
			} if (u && u.Permissions > 0) {
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