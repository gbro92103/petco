const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alloc_params', {
    alloc_param_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    alloc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'allocations',
        key: 'alloc_id'
      }
    },
    sku_nbr: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    avg_weekly_sold_per_store: {
      type: DataTypes.REAL,
      allowNull: false
    },
    target_value: {
      type: DataTypes.REAL,
      allowNull: false
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
      allowNull: false
    },
    override_store_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    alloc_method: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    main_sales_method: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    override_vend_id: {
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
      type: DataTypes.INTEGER,
      allowNull: true
    },
    exclude_stores: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    act_alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    avg_cost: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    discounted_cost: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_cost: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'alloc_params',
    timestamps: false
  });
};

