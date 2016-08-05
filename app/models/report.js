module.exports = function(sequelize, DataTypes) {

	var Report = sequelize.define('Report', {
		AwardId: 'MEDIUMINT',
		ProposalId: 'INT',
		Type: 'TINYINT',
		Status: 'TINYINT',
		TimelineProgress: DataTypes.TEXT,
		Modification: DataTypes.TEXT,
		Risks: DataTypes.TEXT,
		StudentUse: DataTypes.TEXT,
		BudgetUse: DataTypes.TEXT,
		Financial: DataTypes.TEXT,
		Outreach: DataTypes.TEXT,
		Impact: DataTypes.TEXT,
		Sustainability: DataTypes.TEXT,
		AdditionalNotes: DataTypes.TEXT,
		ReceiptPath: DataTypes.STRING(150),
		DueDate: DataTypes.DATE,
		SubmittedDate: DataTypes.DATE
	});
	return Report;
};

// Status:
// 0 = unsubmitted
// 1 = submitted

// Type:
// 0 = Quarterly
// 1 = Annually