module.exports = function(sequelize, DataTypes) {

	var Proposal = sequelize.define('Proposal', {
		ProposalTitle: DataTypes.STRING,
		Category: DataTypes.STRING,
		Department: DataTypes.STRING,
		FastTrack: 'TINYINT',
		PrimaryRegId: DataTypes.STRING,
		PrimaryNetId: DataTypes.STRING,
		PrimaryName: DataTypes.STRING,
		PrimaryTitle: DataTypes.STRING,
		PrimaryPhone: DataTypes.STRING,
		PrimaryMail: DataTypes.STRING,
		PrimarySignature: 'TINYINT',
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
		AdditionalContactName1: DataTypes.STRING,
		AdditionalContactNetId1: DataTypes.STRING,
		AdditionalContactName2: DataTypes.STRING,
		AdditionalContactNetId2: DataTypes.STRING,
		AdditionalContactName3: DataTypes.STRING,
		AdditionalContactNetId3: DataTypes.STRING,
		Abstract: DataTypes.TEXT,
		Background: DataTypes.TEXT,
		StudentsEstimated: DataTypes.INTEGER,
		EstimateJustification: DataTypes.TEXT,
		ResearchScholarship: DataTypes.TEXT,
		EducationalExperience: DataTypes.TEXT,
		CareerEnhancement: DataTypes.TEXT,
		AccessRestrictions: DataTypes.TEXT, 
		Hours: DataTypes.STRING,
		Days: DataTypes.STRING,
		Outreach: DataTypes.TEXT,
		ProposalTimeline: DataTypes.TEXT,
		HumanResources: DataTypes.TEXT,
		TechnologyResources: DataTypes.TEXT,
		FinancialResources: DataTypes.TEXT,
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