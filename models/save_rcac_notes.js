const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('save_rcac_notes', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    alloc_param_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sku_nbr: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    str_nbr: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    revised_alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changed_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    changed_by_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    alloc_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'save_rcac_notes',
    timestamps: false
  });
};
