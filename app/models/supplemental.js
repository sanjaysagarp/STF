module.exports = function(sequelize, DataTypes) {

	var Supplemental = sequelize.define('Supplemental', {
		ProposalId: 'MEDIUMINT',
		AuthorId: 'SMALLINT',
		Title: 'VARCHAR(40)',
		Status: 'TINYINT(4)'
	});

	return Supplemental;
};
