module.exports = function(sequelize, DataTypes) {

	var Vote = sequelize.define('Vote', {
		ProposalId: 'INT',
		VoterId: 'MEDIUMINT',
		Value: 'MEDIUMINT'
	});
	
	return Vote;
}