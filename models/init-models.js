var DataTypes = require("sequelize").DataTypes;
var _SequelizeMeta = require("./SequelizeMeta");
var _alloc_lines = require("./alloc_lines");
var _alloc_lines_old = require("./alloc_lines_old");
var _alloc_params = require("./alloc_params");
var _alloc_params_backup = require("./alloc_params_backup");
var _allocations = require("./allocations");
var _invloc = require("./invloc");
var _rcac_reviews = require("./rcac_reviews");
var _save_rcac_notes = require("./save_rcac_notes");
var _skus = require("./skus");
var _stores = require("./stores");
var _users = require("./users");
var _vendors = require("./vendors");
var _zones = require("./zones");

function initModels(sequelize) {
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var alloc_lines = _alloc_lines(sequelize, DataTypes);
  var alloc_lines_old = _alloc_lines_old(sequelize, DataTypes);
  var alloc_params = _alloc_params(sequelize, DataTypes);
  var alloc_params_backup = _alloc_params_backup(sequelize, DataTypes);
  var allocations = _allocations(sequelize, DataTypes);
  var invloc = _invloc(sequelize, DataTypes);
  var rcac_reviews = _rcac_reviews(sequelize, DataTypes);
  var save_rcac_notes = _save_rcac_notes(sequelize, DataTypes);
  var skus = _skus(sequelize, DataTypes);
  var stores = _stores(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var vendors = _vendors(sequelize, DataTypes);
  var zones = _zones(sequelize, DataTypes);

  alloc_params.belongsTo(allocations, { as: "alloc", foreignKey: "alloc_id"});
  allocations.hasMany(alloc_params, { as: "alloc_params", foreignKey: "alloc_id"});
  alloc_params_backup.belongsTo(allocations, { as: "alloc", foreignKey: "alloc_id"});
  allocations.hasMany(alloc_params_backup, { as: "alloc_params_backups", foreignKey: "alloc_id"});
  rcac_reviews.belongsTo(allocations, { as: "alloc", foreignKey: "alloc_id"});
  allocations.hasMany(rcac_reviews, { as: "rcac_reviews", foreignKey: "alloc_id"});
  alloc_params.belongsTo(skus, { as: "like_sku_sku", foreignKey: "like_sku"});
  skus.hasMany(alloc_params, { as: "alloc_params", foreignKey: "like_sku"});
  alloc_params.belongsTo(skus, { as: "sku_nbr_sku", foreignKey: "sku_nbr"});
  skus.hasMany(alloc_params, { as: "sku_nbr_alloc_params", foreignKey: "sku_nbr"});
  alloc_params_backup.belongsTo(skus, { as: "like_sku_sku", foreignKey: "like_sku"});
  skus.hasMany(alloc_params_backup, { as: "alloc_params_backups", foreignKey: "like_sku"});
  alloc_params_backup.belongsTo(skus, { as: "sku_nbr_sku", foreignKey: "sku_nbr"});
  skus.hasMany(alloc_params_backup, { as: "sku_nbr_alloc_params_backups", foreignKey: "sku_nbr"});
  invloc.belongsTo(skus, { as: "sku_nbr_sku", foreignKey: "sku_nbr"});
  skus.hasMany(invloc, { as: "invlocs", foreignKey: "sku_nbr"});
  invloc.belongsTo(stores, { as: "str_nbr_store", foreignKey: "str_nbr"});
  stores.hasMany(invloc, { as: "invlocs", foreignKey: "str_nbr"});
  rcac_reviews.belongsTo(users, { as: "review_by", foreignKey: "review_by_id"});
  users.hasMany(rcac_reviews, { as: "rcac_reviews", foreignKey: "review_by_id"});
  rcac_reviews.belongsTo(users, { as: "rcac", foreignKey: "rcac_id"});
  users.hasMany(rcac_reviews, { as: "rcac_rcac_reviews", foreignKey: "rcac_id"});
  stores.belongsTo(users, { as: "rcac", foreignKey: "rcac_id"});
  users.hasMany(stores, { as: "stores", foreignKey: "rcac_id"});
  zones.belongsTo(users, { as: "rdac", foreignKey: "rdac_id"});
  users.hasMany(zones, { as: "zones", foreignKey: "rdac_id"});
  alloc_params.belongsTo(vendors, { as: "override_vend", foreignKey: "override_vend_id"});
  vendors.hasMany(alloc_params, { as: "alloc_params", foreignKey: "override_vend_id"});
  alloc_params_backup.belongsTo(vendors, { as: "alloc_vend", foreignKey: "alloc_vend_id"});
  vendors.hasMany(alloc_params_backup, { as: "alloc_params_backups", foreignKey: "alloc_vend_id"});
  invloc.belongsTo(vendors, { as: "vend", foreignKey: "vend_id"});
  vendors.hasMany(invloc, { as: "invlocs", foreignKey: "vend_id"});
  skus.belongsTo(vendors, { as: "primary_vend_vendor", foreignKey: "primary_vend"});
  vendors.hasMany(skus, { as: "skus", foreignKey: "primary_vend"});

  alloc_params.hasMany(alloc_lines, {as: 'par', foreignKey: 'alloc_param_id' });
  alloc_lines.belongsTo(alloc_params, {as: 'alloc_params', foreignKey: 'alloc_param_id' });
  stores.hasMany(alloc_lines, {as: 'str', foreignKey: 'str_nbr'});
  alloc_lines.belongsTo(stores, {as: 'str_meth', foreignKey: 'str_nbr' });
  stores.hasMany(alloc_lines, {foreignKey: 'str_nbr', sourceKey: 'str_nbr' });
  alloc_lines.belongsTo(stores, {foreignKey: 'str_nbr', targetKey: 'str_nbr' });
  
  alloc_lines.prototype.calculateQtySldPerWeek = async function() {
    const salesMethod = this.sales_method;
    const avgWeeklySldPerStore = this.avg_weekly_sold_per_store || 0;
    const store = await this.getStore();
  
    if (!store) return 0;
  
    const cyWeeksOpen = store.cy_weeks_open || 1; // Avoid division by zero
    const lyWeeksOpen = store.ly_weeks_open || 1; // Avoid division by zero
  
    if (salesMethod === 'LY Sold' || salesMethod === '') {
      return this.use_ly_sld / lyWeeksOpen;
    } else if (salesMethod === 'CY Sold') {
      return this.use_cy_sld / cyWeeksOpen;
    } else if (salesMethod === 'SC Factor') {
      return this.use_sc_factor * avgWeeklySldPerStore;
    } else if (salesMethod === 'Sku Factor') {
      return this.use_sku_factor * avgWeeklySldPerStore;
    }
    return 0;
  };
  
  // Hook to calculate qty_sld_per_week before fetching
  alloc_lines.addHook('afterFind', async (allocLines, options) => {
    if (!Array.isArray(allocLines)) {
      allocLines = [allocLines];
    }
    for (const allocLine of allocLines) {
      if (allocLine) {
        allocLine.qty_sld_per_week = await allocLine.calculateQtySldPerWeek();
      }
    }
  });
  
  return {
    SequelizeMeta,
    alloc_lines,
    alloc_lines_old,
    alloc_params,
    alloc_params_backup,
    allocations,
    invloc,
    rcac_reviews,
    save_rcac_notes,
    skus,
    stores,
    users,
    vendors,
    zones,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
