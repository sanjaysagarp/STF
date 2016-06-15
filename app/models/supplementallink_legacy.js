module.exports = function(sequelize, DataTypes) {

	var SupplementalLink_Legacy = sequelize.define('Supplementallink_Legacy', {
		SupplementalItemId: DataTypes.INTEGER,
		OriginalItemId: DataTypes.INTEGER
	});

	return SupplementalLink_Legacy;
};