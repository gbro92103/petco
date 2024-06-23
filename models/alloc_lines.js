const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alloc_lines', {
    alloc_line_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sku_nbr: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    str_nbr: {
      type: DataTypes.INTEGER,
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
    use_ly_sld: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.like_sku_ly_sld || this.ly_sld || 0;
      }
    },
    use_cy_sld: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.like_sku_cy_sld || this.cy_sld || 0;
      }
    },
    use_sc_factor: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.like_sku_sc_factor || this.sc_factor || 0;
      }
    },
    use_sku_factor: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.like_sku_sku_factor || this.sku_factor || 0;
      }
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
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('qoo') + this.getDataValue('qoh');
      }
    },
    wos: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.qoh_plus_qoo / this.qty_sld_per_week;
      }
    },
    new_wos: {
      type: DataTypes.VIRTUAL,
      get() {
        return (this.qoh_plus_qoo + this.act_alloc_qty) / this.qty_sld_per_week;
      }
    },
    ar: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    attached_vend_id: {
      type: "TEXT(5)",
      allowNull: true
    },
    alloc_param_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    alloc_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    like_sku: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    avg_weekly_sold_per_store: {
      type: DataTypes.REAL,
      allowNull: true
    },
    alloc_method: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    target_value: {
      type: DataTypes.REAL,
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
    override_store_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_excluded: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_filtered: {
      type: DataTypes.BOOLEAN,
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
    override_vend_id: {
      type: "TEXT(5)",
      allowNull: true
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
    discounted_cost: {
      type: DataTypes.REAL,
      allowNull: true
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
    str_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    zone_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rdac_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rdac_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dist_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rcac_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rcac_name: {
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
    attached_vend_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    override_vend_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    act_vend_id: {
      type: DataTypes.VIRTUAL,
      get() {
        return override_vend_id || attached_vend_id 
      }
    },
    act_vend_name: {
      type: DataTypes.VIRTUAL,
      get() {
        return override_vend_name || override_vend_name
      }
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
      type: DataTypes.VIRTUAL,
      get() {
        return this.revised_alloc_qty || this.calc_alloc_qty || 0;
      }
    },
    notes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    changed_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    changed_by_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }    
  }, {
    sequelize,
    tableName: 'alloc_lines',
    timestamps: false,
  }
)};
