module.exports = function (sequelize, DataTypes) {

	var Award = sequelize.define('Award', {
		ProposalId: 'MEDIUMINT',
		ReportType: 'TINYINT',
		FundedAmount: DataTypes.FLOAT,
		AwardDate: DataTypes.DATE,
		BudgetDate: DataTypes.DATE,
		BudgetCloseDate: DataTypes.DATE,
		OversightOver: DataTypes.DATE,
		OversightUnder: DataTypes.DATE,
		Notes: 'MEDIUMTEXT',
		QuarterlyDate1: DataTypes.DATE,
		QuarterlyDate2: DataTypes.DATE,
		QuarterlyDate3: DataTypes.DATE,
		AnnualDate: DataTypes.DATE
	});
	
	return Award;
};

//Report Type
//0 = Quarterly
//1 = Anually
//2 = Both