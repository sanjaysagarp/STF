// Example model
var Proposal = require('./proposal');

module.exports = function(sequelize, DataTypes) {

	var Item = sequelize.define('Item', {
		ProposalId: 'MEDIUMINT',
		PartialId: 'MEDIUMINT',
		SupplementalId: 'MEDIUMINT',
		LocationId: 'MEDIUMINT',
		ItemName: DataTypes.STRING,
		Group: DataTypes.STRING,
		Quantity: DataTypes.INTEGER,
		Price: DataTypes.FLOAT,
		Justification: DataTypes.TEXT,
		Description: DataTypes.TEXT
	});

	return Item;
};
