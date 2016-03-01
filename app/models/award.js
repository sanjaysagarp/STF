module.exports = function (sequelize, DataTypes) {

	var Award = sequelize.define('Award', {
		ProposalId: 'MEDIUMINT',
		ReportType: 'TINYINT',
		FundedAmount: DataTypes.FLOAT,
		AwardDate: DataTypes.DATE,
		BudgetDate: DataTypes.DATE,
		OversightStartDate: DataTypes.DATE,
		OversightEndDate: DataTypes.DATE
	});
	
	return Award;
};

//Report Type
//0 = Quarterly
//1 = Anually
//2 = Both

//AwardYear = July 2016
//OversightStart = July 2019
//OversightEnd = July 2023
