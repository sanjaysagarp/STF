module.exports = function (sequelize, DataTypes) {

	var Rejection = sequelize.define('Rejection', {
		ProposalId: 'MEDIUMINT',
		YearId: 'MEDIUMINT',
		Notes: 'MEDIUMTEXT'
	});
	
	return Rejection;
};