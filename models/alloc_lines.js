const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alloc_lines', {
    alloc_line_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    str_nbr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stores',
        key: 'str_nbr'
      }
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
    rcac_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'rcac_id'
      }
    },
    rcac_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rdac_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    rdac_name: {
      type: DataTypes.TEXT,
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
      type: DataTypes.INTEGER,
      allowNull: true
    },
    like_sku: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'skus',
        key: 'sku_nbr'
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
    desc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dept: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subclass: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alloc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'allocations',
        key: 'alloc_id'
      }
    },
    alloc_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alloc_review_due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    alloc_status: {
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
    alloc_vend_name: {
      type: DataTypes.TEXT,
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
    sales_method: {
      type: DataTypes.TEXT,
      allowNull: true
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
    qoh_plus_qoo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ar: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    attached_vend_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'vend_id'
      }
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    revised_alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    changed_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    changed_by_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changed_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    reviewed_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    reviewed_by_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reviewed_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alloc_method: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avg_cost: {
      type: DataTypes.REAL,
      allowNull: true
    },
    avg_retail: {
      type: DataTypes.REAL,
      allowNull: true
    },
    calc_alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    limit_to_attached_vendor: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    new_wos: {
      type: DataTypes.REAL,
      allowNull: true
    },
    wos: {
      type: DataTypes.REAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'alloc_lines',
    timestamps: false
  });
};
