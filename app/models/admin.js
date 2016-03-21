module.exports = function (sequelize, DataTypes) {

	var Admin = sequelize.define('Admin', {
		ProposalSubmissions: 'TINYINT',
		FastTrack: 'TINYINT'
	});
	
	return Admin;
};

// ProposalSubmissions/FastTrack:
// 0 - closed
// 1 - opened
