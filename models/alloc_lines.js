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
      allowNull: false
    },
    str_nbr: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ly_sld: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cy_sld: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sc_factor: {
      type: DataTypes.REAL,
      allowNull: false
    },
    sku_factor: {
      type: DataTypes.REAL,
      allowNull: false
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
      allowNull: false
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    attached_vend_id: {
      type: "TEXT(5)",
      allowNull: true
    },
    act_vend_id: {
      type: "TEXT(5)",
      allowNull: true
    },
    alloc_param_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    sales_method: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rdac_id: {
      type: DataTypes.INTEGER,
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
    override_vend_id: {
      type: DataTypes.TEXT,
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
      allowNull: false
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

