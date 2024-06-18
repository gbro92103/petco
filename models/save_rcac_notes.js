const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('save_rcac_notes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    alloc_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    alloc_param_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sku_nbr: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    str_nbr: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    }
  }, {
    sequelize,
    tableName: 'save_rcac_notes',
    timestamps: false
  });
};