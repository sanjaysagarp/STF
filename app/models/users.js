module.exports = function (sequelize, DataTypes) {

	var User = sequelize.define('User', {
		NetId: 'VARCHAR(20)',
		RegId: 'VARCHAR(40)',
		FirstName: 'VARCHAR(30)',
		LastName: 'VARCHAR(40)',
		Permissions: 'TINYINT'
	});

	//PERMISSIONS//
	//1 general member
	//2 admin

	return User;
};