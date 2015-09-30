module.exports = function(sequelize, DataTypes) {

  var Partial = sequelize.define('Partial', {
    ProposalId: 'MEDIUMINT',
    AuthorId: 'SMALLINT',
    Title: 'VARCHAR(40)'
  });

  return Partial;
};
