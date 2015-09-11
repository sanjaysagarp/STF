// Example model


module.exports = function (sequelize, DataTypes) {

	var Metric = sequelize.define('Metrics', {
		ProposalId: 'INT',
		AuthorId: 'MEDIUMINT',
		A1: 'SMALLINT',
		A2: 'SMALLINT',
		C1: 'SMALLINT',
		C2: 'SMALLINT',
		C3: 'SMALLINT',
		C4: 'SMALLINT',
		D1: 'SMALLINT',
		D2: 'SMALLINT',
		D3: 'SMALLINT',
		D4: 'SMALLINT',
		U1: 'SMALLINT',
		U2: 'SMALLINT',
		U3: 'SMALLINT',
		X1: 'SMALLINT',
		X2: 'SMALLINT',
		X3: 'SMALLINT',
		X4: 'SMALLINT',
		Notes: 'LONGTEXT'
	});

	return Metric;
};

