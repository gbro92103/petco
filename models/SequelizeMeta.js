const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SequelizeMeta', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      unique: true
    }
  }, {
    sequelize,
    tableName: 'SequelizeMeta',
    timestamps: false,
    indexes: [
      {
        name: "sqlite_autoindex_SequelizeMeta_1",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
};
