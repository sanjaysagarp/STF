module.exports = function(sequelize, DataTypes) {

	var Location = sequelize.define('Location', {
		ItemId: 'INT',
		ProposalId: 'INT',
		Address: DataTypes.STRING,
		Lat: DataTypes.FLOAT(10, 6),
		Lng: DataTypes.FLOAT(10, 6),
		Description: DataTypes.STRING
	});

	return Location;
};

// This stores an address to be associated with a proposal and/or an individual item
// Use google maps to figure out longitude / latitude and store float values