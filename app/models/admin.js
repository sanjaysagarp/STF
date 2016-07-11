module.exports = function (sequelize, DataTypes) {

	var Admin = sequelize.define('Admin', {
		ProposalSubmissions: 'TINYINT',
		FastTrack: 'TINYINT',
		CurrentQuarter: DataTypes.STRING,
		CurrentYear: 'SMALLINT',
		CurrentNumber: 'SMALLINT'
	});
	
	return Admin;
};

// ProposalSubmissions/FastTrack:
// 0 - closed
// 1 - opened
