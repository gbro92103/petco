const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('skus', {
    sku_nbr: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    primary_vend: {
      type: DataTypes.TEXT,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'vend_id'
      }
    },
    avg_cost: {
      type: DataTypes.REAL,
      allowNull: true
    },
    avg_retail: {
      type: DataTypes.REAL,
      allowNull: true
    },
    dept: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subclass: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'skus',
    timestamps: false
  });
};
