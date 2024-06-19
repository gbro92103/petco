const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alloc_params_backup', {
    alloc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'allocations',
        key: 'alloc_id'
      }
    },
    sku_nbr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'skus',
        key: 'sku_nbr'
      }
    },
    like_sku: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'skus',
        key: 'sku_nbr'
      }
    },
    avg_weekly_sales_per_store: {
      type: DataTypes.REAL,
      allowNull: false
    },
    est_store_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    target_wos: {
      type: DataTypes.REAL,
      allowNull: true
    },
    target_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    min_per_store: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    max_per_store: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eoq: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nbr_of_stores: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    main_sales_method: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alloc_vend_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'vend_id'
      }
    },
    limit_to_attached_vendor: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    hard_qty_limit: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    exclude_stores: {
      type: "",
      allowNull: true
    },
    act_alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    avg_cost: {
      type: DataTypes.REAL,
      allowNull: true
    },
    total_cost: {
      type: DataTypes.REAL,
      allowNull: true
    },
    act_nbr_of_stores: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    alloc_param_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'alloc_params_backup',
    timestamps: false
  });
};
