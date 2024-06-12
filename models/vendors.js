const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vendors', {
    vend_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      primaryKey: true,
      unique: true
    },
    vend_name: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vendors',
    timestamps: false,
    indexes: [
      {
        name: "sqlite_autoindex_vendors_1",
        unique: true,
        fields: [
          { name: "vend_id" },
        ]
      },
    ]
  });
};
