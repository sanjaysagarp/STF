// Example model
var Item = require('./item');

module.exports = function(sequelize, DataTypes) {

	var Proposal = sequelize.define('Proposal', {
		ProposalCode: {
			type: DataTypes.STRING,
			primary: true
		},
		ProposalTitle: DataTypes.STRING,
		Category: DataTypes.STRING,
		Department: DataTypes.STRING,
		PrimaryRegId: DataTypes.STRING,
		PrimaryNetId: DataTypes.STRING,
		PrimaryName: DataTypes.STRING,
		PrimaryTitle: DataTypes.STRING,
		PrimaryPhone: DataTypes.STRING,
		PrimaryEmail: DataTypes.STRING,
		PrimaryMail: DataTypes.STRING,
		BudgetName: DataTypes.STRING,
		BudgetTitle: DataTypes.STRING,
		BudgetPhone: DataTypes.STRING,
		BudgetEmail: DataTypes.STRING,
		BudgetMail: DataTypes.STRING,
		DeanName: DataTypes.STRING,
		DeanTitle: DataTypes.STRING,
		DeanPhone: DataTypes.STRING,
		DeanEmail: DataTypes.STRING,
		DeanMail: DataTypes.STRING,
		StudentName: DataTypes.STRING,
		StudentTitle: DataTypes.STRING,
		StudentPhone: DataTypes.STRING,
		StudentEmail: DataTypes.STRING,
		StudentMail: DataTypes.STRING,
		Abstract: DataTypes.TEXT(4000),
		Background: DataTypes.TEXT(4000),
		CategoryJustification: DataTypes.TEXT(4000),
		Benefits: DataTypes.TEXT(4000),
		AccessRestrictions: DataTypes.STRING, 
		Hours: DataTypes.INTEGER,
		Days: DataTypes.STRING,
		DepartmentalResources: DataTypes.TEXT(4000), 
		InstallationTimeline: DataTypes.STRING(45),
		Status: DataTypes.STRING(45)
	}

	// , {
	//   classMethods: {
	//     associate: function(models) {
	//       Proposal.hasMany(models.Item);
	//       // example on how to add relations
	//       // Article.hasMany(models.Comments);
	//     }
	//   }
	// }

	);

	return Proposal;
};
