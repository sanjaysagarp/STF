module.exports = function(sequelize, DataTypes) {

	var Report = sequelize.define('Report', {
		AwardId: 'MEDIUMINT',
		TimelineProgress: 'VARCHAR(255)',
		Modification: 'VARCHAR(255)',
		Risks: 'VARCHAR(255)',
		StudentUse: 'VARCHAR(255)',
		BudgetUse: 'VARCHAR(255)',
		Financial: 'VARCHAR(255)',
		Outreach: 'VARCHAR(255)',
		Impact: 'VARCHAR(255)',
		Sustainability: 'VARCHAR(255)'
	});

	return Report;
};