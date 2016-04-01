module.exports = function(sequelize, DataTypes) {

	var Supplemental = sequelize.define('Supplemental', {
		ProposalId: 'MEDIUMINT',
		Author: 'VARCHAR(20)',
		Title: 'VARCHAR(40)',
		Status: 'TINYINT(4)'
	});

	return Supplemental;
};

//Author is netid 