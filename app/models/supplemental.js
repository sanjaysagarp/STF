module.exports = function(sequelize, DataTypes) {

	var Supplemental = sequelize.define('Supplemental', {
		ProposalId: 'MEDIUMINT',
		Author: DataTypes.STRING,
		Title: DataTypes.STRING,
		Abstract: DataTypes.TEXT,
		Status: 'TINYINT'
	});

	return Supplemental;
};

//Author is netid 

//Status
//0 = open for voting
//1 = approved
//2 = denied