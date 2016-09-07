module.exports = function(sequelize, DataTypes) {

	var Department = sequelize.define('Department', {
		Name: 'INT',
		Address: DataTypes.STRING,
		Lat: DataTypes.FLOAT(10, 6),
		Lng: DataTypes.FLOAT(10, 6)
	});

	return Department;
};

// Departments have a default location
// TODO -- Need to be able to modify default location from admin side