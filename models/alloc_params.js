const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alloc_params', {
    alloc_param_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    alloc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'allocations',
        key: 'alloc_id'
      },
      unique: true
    },
    sku_nbr: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skus',
        key: 'sku_nbr'
      },
      unique: true
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
    alloc_method: {
      type: DataTypes.TEXT,
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
      allowNull: false,
      defaultValue: 0
    },
    avg_cost: {
      type: DataTypes.REAL,
      allowNull: false,
      defaultValue: 0.0
    },
    discounted_cost: {
      type: DataTypes.REAL,
      allowNull: false,
      defaultValue: 0.0
    },
    total_cost: {
      type: DataTypes.REAL,
      allowNull: false,
      defaultValue: 0.0
    },
    act_nbr_of_stores: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'alloc_params',
    timestamps: false,
    indexes: [
      {
        name: "sqlite_autoindex_alloc_params_1",
        unique: true,
        fields: [
          { name: "alloc_id" },
          { name: "sku_nbr" },
        ]
      },
    ]
  });
};
