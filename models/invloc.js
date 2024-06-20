const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('invloc', {
    sku_nbr: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skus',
        key: 'sku_nbr'
      },
      unique: true
    },
    str_nbr: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'str_nbr'
      },
      unique: true
    },
    ly_sld: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cy_sld: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sc_factor: {
      type: DataTypes.REAL,
      allowNull: true
    },
    sku_factor: {
      type: DataTypes.REAL,
      allowNull: true
    },
    qoh: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    qoo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ar: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    vend_id: {
      type: "TEXT(5)",
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'vend_id'
      }
    }
  }, {
    sequelize,
    tableName: 'invloc',
    timestamps: false,
    indexes: [
      {
        name: "sqlite_autoindex_invloc_1",
        unique: true,
        fields: [
          { name: "sku_nbr" },
          { name: "str_nbr" },
        ]
      },
    ]
  });
};
