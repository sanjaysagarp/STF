module.exports = function(sequelize, DataTypes) {

	var Endorsement = sequelize.define('Endorsement', {
		ProposalId: DataTypes.INTEGER,
		RegId: DataTypes.STRING,
		NetId: DataTypes.STRING,
		Name: DataTypes.STRING,
		Message: 'LONGTEXT' 
	});

	return Endorsement;
};