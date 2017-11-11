'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define('users', {
    name: DataTypes.STRING,
    userId: DataTypes.STRING,
    service: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return users;
};
