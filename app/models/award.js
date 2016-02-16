module.exports = function (sequelize, DataTypes) {

	var Award = sequelize.define('Award', {
		ProposalId: 'MEDIUMINT',
		Quarter: 'TINYINT',
		Annual: 'TINYINT',
		
		Text: DataTypes.STRING,
		NetId: 'VARCHAR(20)',
		RegId: 'VARCHAR(40)',
		FirstName: 'VARCHAR(30)',
		LastName: 'VARCHAR(40)',
		Permissions: 'TINYINT'
	});
	
	return Award;
};