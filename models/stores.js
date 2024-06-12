const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stores', {
    str_nbr: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    str_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dist_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dt_opened: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dt_closed: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    rcac_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'rcac_id'
      }
    }
  }, {
    sequelize,
    tableName: 'stores',
    timestamps: false
  });
};
