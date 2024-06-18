var DataTypes = require("sequelize").DataTypes;
var _alloc_lines = require("./alloc_lines");
var _alloc_params = require("./alloc_params");
var _allocations = require("./allocations");
var _invloc = require("./invloc");
var _rcac_review = require("./rcac_review");
const save_rcac_notes = require("./save_rcac_notes");
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
  var save_rcac_notes = _save_rcac_notes(sequelize, DataTypes);
  var skus = _skus(sequelize, DataTypes);
  var stores = _stores(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var vendors = _vendors(sequelize, DataTypes);
  var zones = _zones(sequelize, DataTypes);

  rcac_review.belongsTo(allocations, { as: "alloc", foreignKey: "alloc_id"});
  allocations.hasMany(rcac_review, { as: "rcac_reviews", foreignKey: "alloc_id"});
  alloc_params.belongsTo(allocations, { as: "alloc", foreignKey: "alloc_id"});
  allocations.hasMany(alloc_params, { as: "alloc_params", foreignKey: "alloc_id"});
  alloc_params.belongsTo(skus, { as: "like_sku_sku", foreignKey: "like_sku" });
  alloc_params.belongsTo(skus, { as: "sku_nbr_sku", foreignKey: "sku_nbr" });
  skus.hasMany(alloc_params, { as: "alloc_params_like_sku", foreignKey: "like_sku" });
  skus.hasMany(alloc_params, { as: "alloc_params_sku_nbr", foreignKey: "sku_nbr" });
  invloc.belongsTo(skus, { as: "sku_nbr_sku", foreignKey: "sku_nbr"});
  skus.hasMany(invloc, { as: "invlocs", foreignKey: "sku_nbr"});
  invloc.belongsTo(stores, { as: "str_nbr_store", foreignKey: "str_nbr"});
  stores.hasMany(invloc, { as: "invlocs", foreignKey: "str_nbr"});
  rcac_review.belongsTo(users, { as: "review_by", foreignKey: "review_by_id"});
  users.hasMany(rcac_review, { as: "rcac_reviews", foreignKey: "review_by_id"});
  rcac_review.belongsTo(users, { as: "rcac", foreignKey: "rcac_id"});
  users.hasMany(rcac_review, { as: "rcac_rcac_reviews", foreignKey: "rcac_id"});
  stores.belongsTo(users, { as: "rcac", foreignKey: "rcac_id"});
  users.hasMany(stores, { as: "stores", foreignKey: "rcac_id"});
  zones.belongsTo(users, { as: "rdac", foreignKey: "rdac_id"});
  users.hasMany(zones, { as: "zones", foreignKey: "rdac_id"});
  alloc_params.belongsTo(vendors, { as: "alloc_vend", foreignKey: "override_vend_id"});
  vendors.hasMany(alloc_params, { as: "alloc_params", foreignKey: "override_vend_id"});
  invloc.belongsTo(vendors, { as: "vend", foreignKey: "vend_id"});
  vendors.hasMany(invloc, { as: "invlocs", foreignKey: "vend_id"});
  skus.belongsTo(vendors, { as: "primary_vend_vendor", foreignKey: "primary_vend"});
  vendors.hasMany(skus, { as: "skus", foreignKey: "primary_vend"});

  return {
    alloc_lines,
    alloc_params,
    allocations,
    invloc,
    rcac_review,
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
