module.exports = function(sequelize, DataTypes) {

	var Vote = sequelize.define('Vote', {
		ProposalId: 'INT',
		SupplementalId: 'INT',
		VoterId: 'MEDIUMINT',
		Value: 'MEDIUMINT'
	});
	
	return Vote;
}

//VoterId corresponds to UserId