module.exports = function (sequelize, DataTypes) {

	var Rejection = sequelize.define('Rejection', {
		ProposalId: 'INT',
		YearId: 'INT',
		Notes: 'MEDIUMTEXT'
	});
	
	return Rejection;
};