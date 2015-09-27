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
		var p = new bb(function() {
			if (!pId.id) {
				return db.Proposal.find({where: {id: pId} });
			}
			return pId;
		});
			
		if (redir === null) {
			redir = true;
		} if (res.locals.isAdmin || (
			(u.regId == p.PrimaryRegId) ||
			(u.netId == p.PrimaryNetId) ||
			(u.netId == p.BudgetNetId) ||
			(u.netId == p.DeanNetId) || 
			(u.netId == p.StudentNetId)
			) && p.Status == 0)	{
			return true;
		} else {
			if (redir) {
				module.exports.displayErrorPage(res, 'You are not an Approved editor of this Proposal', 'Access Denied');
			}
			return false;
		}
		
	},

	activeCommitteeMember: function(res, uRegId, redir) {
		var u = new bb(function() {
			if (!uRegId.id) {
				return db.User.find({where: {RegId: uRegId}});
			} 
			return uRegId
		});

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
	},

	//A simple error page displayer. Accepts res, a message, and the status
	//of hte request
	displayErrorPage: function(res, mess, status) {
		res.render('error', {
			message: mess,
			error: {status: status}
		})
	}


}