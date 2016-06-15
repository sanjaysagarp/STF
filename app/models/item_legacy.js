module.exports = function(sequelize, DataTypes) {

	var Legacy_Item = sequelize.define('Legacy_Item', {
		ProposalId: 'MEDIUMINT',
		Title: DataTypes.STRING(40),
		Type: DataTypes.STRING(40),
		Description: DataTypes.TEXT,
		Justification: DataTypes.TEXT,
		Building: DataTypes.STRING(40),
		Location: DataTypes.STRING(40),
		Price: DataTypes.DECIMAL(12,2),
		Quantity: DataTypes.INTEGER,
		Approved: DataTypes.CHAR(1),
		Purchased: DataTypes.CHAR(1),
		Supplemental: DataTypes.CHAR(1),
		Removed: DataTypes.CHAR(1)
	});

	return Legacy_Item;
};