// Example model
var Proposal = require('./proposal');

module.exports = function(sequelize, DataTypes) {

  var Item = sequelize.define('Item', {
    ProposalId: DataTypes.STRING,
    PartialId: DataTypes.STRING,
    ItemCode: DataTypes.STRING,
    ItemName: DataTypes.STRING,
    OtherType: DataTypes.STRING,
    Group: DataTypes.STRING,
    Quantity: DataTypes.INTEGER,
    Price: DataTypes.FLOAT,
    Type: DataTypes.STRING,
    Justification: {
      type: DataTypes.STRING,
      validate: {
        max: 500
      }
    },
    Description: {
      type: DataTypes.STRING,
      validate: {
        max: 500
      }
    },

  });

  return Item;
};
