// Example model


module.exports = function (sequelize, DataTypes) {

	var Metric = sequelize.define('Metrics', {
		ProposalId: 'INT',
		AuthorId: 'MEDIUMINT',
		MN: 'SMALLINT',
		AC: 'SMALLINT',
		RE: 'SMALLINT',
		CE: 'SMALLINT',
		UN: 'SMALLINT',
		AP: 'SMALLINT',
		MT: 'SMALLINT',
		AD: 'SMALLINT',
		OU: 'SMALLINT',
		AV: 'SMALLINT',
		Notes: 'LONGTEXT'
	});

	return Metric;
};

