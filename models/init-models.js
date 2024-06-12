var DataTypes = require("sequelize").DataTypes;
var _alloc_lines = require("./alloc_lines");
var _alloc_params = require("./alloc_params");
var _allocations = require("./allocations");
var _invloc = require("./invloc");
var _rcac_review = require("./rcac_review");
var _skus = require("./skus");
var _stores = require("./stores");
var _users = require("./users");
var _vendors = require("./vendors");
var _zones = require("./zones");

function initModels(sequelize) {
  var alloc_lines = _alloc_lines(sequelize, DataTypes);
  var alloc_params = _alloc_params(sequelize, DataTypes);
  var allocations = _allocations(sequelize, DataTypes);
  var invloc = _invloc(sequelize, DataTypes);
  var rcac_review = _rcac_review(sequelize, DataTypes);
  var skus = _skus(sequelize, DataTypes);
  var stores = _stores(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var vendors = _vendors(sequelize, DataTypes);
  var zones = _zones(sequelize, DataTypes);

  rcac_review.belongsTo(allocations, { as: "alloc", foreignKey: "alloc_id"});
  allocations.hasMany(rcac_review, { as: "rcac_reviews", foreignKey: "alloc_id"});
  alloc_lines.belongsTo(allocations, { as: "alloc", foreignKey: "alloc_id"});
  allocations.hasMany(alloc_lines, { as: "alloc_lines", foreignKey: "alloc_id"});
  alloc_params.belongsTo(allocations, { as: "alloc", foreignKey: "alloc_id"});
  allocations.hasMany(alloc_params, { as: "alloc_params", foreignKey: "alloc_id"});
  alloc_lines.belongsTo(skus, { as: "like_sku_sku", foreignKey: "like_sku"});
  skus.hasMany(alloc_lines, { as: "alloc_lines", foreignKey: "like_sku"});
  alloc_lines.belongsTo(skus, { as: "sku_nbr_sku", foreignKey: "sku_nbr"});
  skus.hasMany(alloc_lines, { as: "sku_nbr_alloc_lines", foreignKey: "sku_nbr"});
  alloc_params.belongsTo(skus, { as: "like_sku_sku", foreignKey: "like_sku" });
  alloc_params.belongsTo(skus, { as: "sku_nbr_sku", foreignKey: "sku_nbr" });
  skus.hasMany(alloc_params, { as: "alloc_params_like_sku", foreignKey: "like_sku" });
  skus.hasMany(alloc_params, { as: "alloc_params_sku_nbr", foreignKey: "sku_nbr" });
  invloc.belongsTo(skus, { as: "sku_nbr_sku", foreignKey: "sku_nbr"});
  skus.hasMany(invloc, { as: "invlocs", foreignKey: "sku_nbr"});
  alloc_lines.belongsTo(stores, { as: "str_nbr_store", foreignKey: "str_nbr"});
  stores.hasMany(alloc_lines, { as: "alloc_lines", foreignKey: "str_nbr"});
  invloc.belongsTo(stores, { as: "str_nbr_store", foreignKey: "str_nbr"});
  stores.hasMany(invloc, { as: "invlocs", foreignKey: "str_nbr"});
  rcac_review.belongsTo(users, { as: "review_by", foreignKey: "review_by_id"});
  users.hasMany(rcac_review, { as: "rcac_reviews", foreignKey: "review_by_id"});
  rcac_review.belongsTo(users, { as: "rcac", foreignKey: "rcac_id"});
  users.hasMany(rcac_review, { as: "rcac_rcac_reviews", foreignKey: "rcac_id"});
  alloc_lines.belongsTo(users, { as: "reviewed_by", foreignKey: "reviewed_by_id"});
  users.hasMany(alloc_lines, { as: "alloc_lines", foreignKey: "reviewed_by_id"});
  alloc_lines.belongsTo(users, { as: "changed_by", foreignKey: "changed_by_id"});
  users.hasMany(alloc_lines, { as: "changed_by_alloc_lines", foreignKey: "changed_by_id"});
  alloc_lines.belongsTo(users, { as: "rdac", foreignKey: "rdac_id"});
  users.hasMany(alloc_lines, { as: "rdac_alloc_lines", foreignKey: "rdac_id"});
  alloc_lines.belongsTo(users, { as: "rcac", foreignKey: "rcac_id"});
  users.hasMany(alloc_lines, { as: "rcac_alloc_lines", foreignKey: "rcac_id"});
  stores.belongsTo(users, { as: "rcac", foreignKey: "rcac_id"});
  users.hasMany(stores, { as: "stores", foreignKey: "rcac_id"});
  zones.belongsTo(users, { as: "rdac", foreignKey: "rdac_id"});
  users.hasMany(zones, { as: "zones", foreignKey: "rdac_id"});
  alloc_lines.belongsTo(vendors, { as: "attached_vend", foreignKey: "attached_vend_id"});
  vendors.hasMany(alloc_lines, { as: "alloc_lines", foreignKey: "attached_vend_id"});
  alloc_lines.belongsTo(vendors, { as: "alloc_vend", foreignKey: "override_vend_id"});
  vendors.hasMany(alloc_lines, { as: "alloc_vend_alloc_lines", foreignKey: "override_vend_id"});
  alloc_params.belongsTo(vendors, { as: "alloc_vend", foreignKey: "override_vend_id"});
  vendors.hasMany(alloc_params, { as: "alloc_params", foreignKey: "override_vend_id"});
  invloc.belongsTo(vendors, { as: "vend", foreignKey: "vend_id"});
  vendors.hasMany(invloc, { as: "invlocs", foreignKey: "vend_id"});
  skus.belongsTo(vendors, { as: "primary_vend_vendor", foreignKey: "primary_vend"});
  vendors.hasMany(skus, { as: "skus", foreignKey: "primary_vend"});

  alloc_lines.belongsTo(vendors, { as: 'act_vendor', foreignKey: 'act_vend_id' });
  vendors.hasMany(alloc_lines, { as: 'alloc_lines1', foreignKey: 'act_vend_id' });

  return {
    alloc_lines,
    alloc_params,
    allocations,
    invloc,
    rcac_review,
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
