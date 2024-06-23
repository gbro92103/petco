const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('allocations', {
    alloc_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    alloc_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alloc_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    alloc_review_due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    alloc_status: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_cost: {
      type: DataTypes.REAL,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'allocations',
    timestamps: false
  });
};
