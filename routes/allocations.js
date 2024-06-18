const express = require('express');
const router = express.Router();

// Require controller modules.
const allocation_controller = require("../controllers/allocationController");
const allocation_lines_controller = require("../controllers/allocationLinesController")
const rcac_controller = require("../controllers/rcacController");
const vendor_controller = require("../controllers/vendorController");
const { requireLogin, requirePermission } = require("../routes/middleware");

/* List Pages */
//GET request for list of all allocations.
router.get("/", requireLogin, allocation_controller.allocations_list_get);

//GET request for list of all RCAC reviews.
router.get("/reviews/", requireLogin, requirePermission("canViewRcacReviews"), rcac_controller.review_list_get);

//GET request for list of all RCAC notes.
router.get("/notes/", requireLogin, requirePermission("canViewRcacNotes"), rcac_controller.notes_list_get);

//POST request for list of all RCAC notes.
router.post("/notes/", requireLogin, requirePermission("canResolveRcacNotes"), rcac_controller.notes_list_post);

/*GET vendor qty breakouts */
router.get("/vendor-qty-breakouts/", requireLogin, requirePermission("canViewVendorBreakouts"), vendor_controller.vendor_qty_breakout_get);

/*Allocation Routes*/
router.get("/create/", requireLogin, requirePermission("canAddAllocations"), allocation_controller.new_allocation_get);
router.get("/:id/update/", requireLogin, allocation_controller.update_allocation_get);

/*save alloc settings and params */
router.post("/submit-allocation/", requireLogin, requirePermission("canUpdateAllocParams"), allocation_controller.validateAllocSettings, allocation_controller.validateAllocParams, allocation_controller.save_allocation_post);

/*recalc allocation */
router.post("/:id/recalc-allocation/", requireLogin, requirePermission("canUpdateAllocParams"), allocation_lines_controller.recalc_allocation_post);

/*save alloc lines*/
router.post("/:id/save-alloc-line/", requireLogin, requirePermission("canReviewAllocations"), allocation_controller.save_alloc_line_post);

/*update desc and costs when sku number is changed in alloc params table */
router.get("/:skuNbr/get-desc-and-costs/", requireLogin, requirePermission("canUpdateAllocations"), allocation_controller.update_desc_and_costs_post);

/*delete alloc params */
router.get("/params/:id/delete", requireLogin, requirePermission("canAddAllocParams"), allocation_controller.delete_alloc_param_post);

module.exports = router;
