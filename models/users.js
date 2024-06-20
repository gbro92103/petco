const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    user_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    full_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    temp_password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    change_date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rcac_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false
  });
};
