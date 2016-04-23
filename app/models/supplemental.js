module.exports = function(sequelize, DataTypes) {

	var Supplemental = sequelize.define('Supplemental', {
		ProposalId: 'MEDIUMINT',
		Author: 'VARCHAR(20)',
		Title: 'VARCHAR(40)',
		Abstract: 'TEXT',
		Status: 'TINYINT(4)'
	});

	return Supplemental;
};

//Author is netid 

//Status
//0 = open for voting
//1 = approved
//2 = denied