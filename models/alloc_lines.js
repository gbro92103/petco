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
    str_active: {
      type: DataTypes.BOOLEAN,
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
    eoq: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    override_store_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    main_sales_method: {
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
    ar: {
      type: DataTypes.BOOLEAN,
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
    limit_to_attached_vendor: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    calc_alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    revised_alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    act_alloc_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changed_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    changed_by_date: {
      type: DataTypes.DATE,
      allowNull: false
  }
  }, {
    sequelize,
    tableName: 'alloc_lines',
    timestamps: false
  });
};
