module.exports = function(sequelize, DataTypes) {

	var Proposal = sequelize.define('Proposal', {
		ProposalTitle: DataTypes.STRING,
		Category: DataTypes.STRING,
		Department: DataTypes.STRING,
		PrimaryRegId: DataTypes.STRING,
		PrimaryNetId: DataTypes.STRING,
		PrimaryName: DataTypes.STRING,
		PrimaryTitle: DataTypes.STRING,
		PrimaryPhone: DataTypes.STRING,
		PrimaryMail: DataTypes.STRING,
		BudgetName: DataTypes.STRING,
		BudgetTitle: DataTypes.STRING,
		BudgetPhone: DataTypes.STRING,
		BudgetNetId: DataTypes.STRING,
		BudgetMail: DataTypes.STRING,
		BudgetSignature: 'TINYINT',
		DeanName: DataTypes.STRING,
		DeanTitle: DataTypes.STRING,
		DeanPhone: DataTypes.STRING,
		DeanNetId: DataTypes.STRING,
		DeanMail: DataTypes.STRING,
		DeanSignature: 'TINYINT',
		StudentName: DataTypes.STRING,
		StudentTitle: DataTypes.STRING,
		StudentPhone: DataTypes.STRING,
		StudentNetId: DataTypes.STRING,
		StudentMail: DataTypes.STRING,
		StudentSignature: 'TINYINT',
		Abstract: DataTypes.TEXT,
		Background: DataTypes.TEXT,
		CategoryJustification: DataTypes.TEXT,
		Benefits: DataTypes.TEXT,
		AccessRestrictions: DataTypes.TEXT, 
		Hours: DataTypes.INTEGER,
		Days: DataTypes.STRING,
		DepartmentalResources: DataTypes.TEXT, 
		InstallationTimeline: DataTypes.TEXT,
		Status: 'TINYINT',
		VotingDisplay: 'TINYINT',
		PartialFunded: 'MEDIUMINT'
	});

	return Proposal;
};

/* proposal status cosdes
   0 = working proposal
   1 = submitted proposal
   2 = voting mode
   3 = cancelled proposal (by user)
   4 = cancelled proposal (by admin)
*/