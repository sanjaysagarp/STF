module.exports = function(sequelize, DataTypes) {

	var Legacy_Item = sequelize.define('Legacy_Item', {
		ProposalId: 'MEDIUMINT',
		LegacyId: DataTypes.INTEGER,
		ObjectId: 'INT',
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
		Removed: DataTypes.CHAR(1),
		PartialItemId: DataTypes.INTEGER,
		SupplementalItemId: DataTypes.INTEGER
		
	});

	return Legacy_Item;
};

// The migration process was split into two
// First being from 2001-2012, second: 2013-2015
// PartialItemId and SupplementalItemId were used for 2013-2015
