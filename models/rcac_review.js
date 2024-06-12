const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rcac_review', {
    review_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    alloc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'allocation',
        key: 'alloc_id'
      }
    },
    rcac_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'rcac_id'
      }
    },
    reviewed: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    review_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    review_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'user_id'
      }
    }
  }, {
    sequelize,
    tableName: 'rcac_review',
    timestamps: false
  });
};
