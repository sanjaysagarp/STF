module.exports = function(sequelize, DataTypes) {

	var Proposal = sequelize.define('Proposal', {
		Number: 'SMALLINT',
		Year: 'SMALLINT',
		ProposalTitle: DataTypes.STRING,
		Category: DataTypes.STRING,
		Department: DataTypes.STRING,
		FastTrack: 'TINYINT',
		Quarter: DataTypes.STRING,
		UAC: 'TINYINT',
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
		Background: DataTypes.TEXT('medium'),
		ProposalFeedback: DataTypes.TEXT('medium'),
		StudentsEstimated: DataTypes.INTEGER,
		EstimateJustification: DataTypes.TEXT('medium'),
		ResearchScholarship: DataTypes.TEXT('medium'),
		EducationalExperience: DataTypes.TEXT('medium'),
		CareerEnhancement: DataTypes.TEXT('medium'),
		AccessRestrictions: DataTypes.TEXT('medium'), 
		Hours: DataTypes.STRING,
		Days: DataTypes.STRING,
		Outreach: DataTypes.TEXT('medium'),
		ProposalTimeline: DataTypes.TEXT('medium'),
		HumanResources: DataTypes.TEXT('medium'),
		TechnologyResources: DataTypes.TEXT('medium'),
		FinancialResources: DataTypes.TEXT('medium'),
		Protection: DataTypes.TEXT('medium'),
		Status: 'TINYINT',
		LetterStatus: 'TINYINT',
		VotingDisplay: 'TINYINT',
		PartialFunded: 'MEDIUMINT'
	});

	return Proposal;
};

/* proposal status codes
	0 = working proposal
	1 = submitted proposal
	2 = in voting
	3 = Awaiting Decision
	4 = Funded
	5 = Partially Funded
	6 = Not Funded
	7 = Cancelled by User
	8 = Cancelled by Admin
*/

/* letter status codes
	0 = no letter
	1 = award letter
	2 = rejection letter
*/