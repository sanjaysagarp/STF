module.exports = function (sequelize, DataTypes) {

	var Denial = sequelize.define('Denial', {
		ProposalId: 'MEDIUMINT',
		YearId: 'MEDIUMINT',
		Notes: 'MEDIUMTEXT'
	});
	
	return Denial;
};