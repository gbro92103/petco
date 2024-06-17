const asyncHandler = require("express-async-handler");
const db = require('../config/db');
const permissions = require('../controllers/permissionsController');
const { check, validationResult } = require('express-validator');

// Display list of all allocations.
exports.allocations_list_get = asyncHandler(async (req, res, next) => {

    try {
        const loggedInUser = req.session.user;
        const menuOptions = permissions.getMenuOptions(loggedInUser.user_type);
        const userPermissions = permissions.getPermissions(loggedInUser.user_type);

        // Retrieve all records from the "allocations" table
        const allocations = await db.allocations.findAll();
        
        res.render("allocation_list", { 
            title: "Allocation List", 
            currentPage: "allocations", 
            allocations: allocations, 
            user: loggedInUser,
            menuOptions: menuOptions,
            permissions: userPermissions
        });
    } catch (error) {
        console.error("Error:", error.message);
    }    
});

//new allocation GET
exports.new_allocation_get = asyncHandler(async (req, res, next) => {
    
    try {
        const loggedInUser = req.session.user;
        const menuOptions = permissions.getMenuOptions(loggedInUser.user_type);
        const userPermissions = permissions.getPermissions(loggedInUser.user_type);

        const allocDate = new Date();
        let reviewDate = new Date();

        reviewDate.setDate(allocDate.getDate() + 10);
    
        //set default values
        const alloc = {
            alloc_id: "",
            alloc_date: allocDate.toISOString().split('T')[0],
            alloc_review_due_date: reviewDate.toISOString().split('T')[0],
            alloc_status: "Setup"
        };

        const sums = {totalAllocQty: 0, totalAllocCost: "$0.00"};

        res.render("main_allocation_template", { 
            title: "Create New Allocation",
            currentPage: "allocations",
            allocation: alloc, 
            sums: sums,
            user: loggedInUser,
            menuOptions: menuOptions,
            permissions: userPermissions
        });
    } catch (error) {
        console.error("Error:", error.message);
    }
});

//update allocation GET
exports.update_allocation_get = asyncHandler(async (req, res, next) => {
    try {
        const loggedInUser = req.session.user;
        const menuOptions = permissions.getMenuOptions(loggedInUser.user_type);
        const userPermissions = permissions.getPermissions(loggedInUser.user_type);

        const alloc = await db.allocations.findOne({
            where: {alloc_id: req.params.id}
        });

        let params = await db.alloc_params.findAll({
            include: [{
                model: db.skus,
                as: 'sku_nbr_sku',
                attributes: ['desc']
            }],
            where: {
                alloc_id: req.params.id
            }
        });
    
        const lines = await db.alloc_lines.findAll({
            where: {
                alloc_id: req.params.id
            }   
        });

        const sums = {totalAllocCost: "$0.00", totalAllocQty: 0};
          
        res.render("main_allocation_template", { 
          title: "Update Allocation",
          currentPage: "allocations",
          allocation: alloc,
          allocParams: params,
          allocLines: lines, 
          sums: sums,
          user: loggedInUser,
          menuOptions: menuOptions,
          permissions: userPermissions
        });  

    } catch (error) {
        console.error("Error:", error.message);
    }
});

exports.save_alloc_settings_post = asyncHandler(async (req, res, next) => {
  try {
    const allocationData = {
      alloc_name: req.body.allocationName,
      alloc_date: req.body.allocationDate,
      alloc_review_due_date: req.body.allocationReviewDate,
      alloc_status: req.body.allocationStatus,
      alloc_id: req.body.allocationID || null
    };

    console.log("alloc data that made it to the server: ", allocationData);

    let settings;

    if (allocationData.alloc_id) {
      settings = await db.allocations.update(allocationData, { where: { alloc_id: allocationData.alloc_id } });
    } else {
      settings = await db.allocations.create(allocationData);
    }

    res.status(200).json({ message: 'Allocation settings saved successfully', allocID: settings.alloc_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving the allocation settings' });
  }
});


exports.save_alloc_params_post = asyncHandler(async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const tableData = req.body;
    console.log('Received table data:', tableData);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const uniqueErrorMessages = [...new Set(errors.array().map(error => error.msg))];
      console.log('Discovered errors:', uniqueErrorMessages);
      return res.status(200).json({ errors: uniqueErrorMessages });
    }

    console.log('Validation passed, saving data to the database...');

    for (const key in tableData) {
      if (tableData.hasOwnProperty(key)) {
        const param = { ...tableData[key], alloc_id: req.params.id };

        if (!param.like_sku) param.like_sku = null;
        if (!param.override_vend_id) param.override_vend_id = null;

        if (param.alloc_param_id) {
          await db.alloc_params.update(param, { where: { alloc_param_id: param.alloc_param_id }, transaction });
        } else {
          param.alloc_param_id = null;
          await db.alloc_params.create(param, { transaction });
        }
      }
    }

    await transaction.commit();
    res.status(200).json({ message: 'Data saved successfully.' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.delete_alloc_param_post = asyncHandler(async (req, res, next) => {
  
  try {

    const result = await db.alloc_params.destroy({
        where: {
            alloc_param_id: req.params.id
        }
    });

    if (result) {
        res.status(200).json({ message: `Row was deleted successfully.`});
    } else {
        console.log(`No row found with alloc_param_id = ${paramID}.`);
        res.status(500).json({ error: 'Allocation parameter not found.' });
    }
  } catch (error) {
      console.error('Error deleting row:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

exports.update_desc_and_costs_post = asyncHandler(async (req, res, next) => {
  const { skuNbr } = req.params;

  try {
      // Look up the SKU number in the database
      const sku = await db.skus.findOne({ where: { sku_nbr: skuNbr } });

      if (!sku) {
          // SKU not found
          return res.json({ error: 'SKU number not found' });
      }

      // SKU found, return the description and average cost
      res.json({
          desc: sku.desc,
          avg_cost: sku.avg_cost
      });
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

exports.save_alloc_line_post = asyncHandler(async (req, res, next) => {

});


async function isSkuExists(sku_nbr) {
  try {
    const sku = await db.skus.findByPk(sku_nbr);
    if (sku)
      return true;
    else
      return false;

  } catch (error) {
    console.error('Error validating allocation parameters:', error);
    return error;
  }
}

async function isVendorExists(vend_id) {
  try {
    const vend = await db.vendors.findByPk(vend_id);
    if (vend)
      return true;
    else
      return false;

  } catch (error) {
    console.error('Error validating allocation parameters:', error);
    return error;
  }
}

exports.validateAllocParams = [
  check('*.sku_nbr')
    .notEmpty().withMessage('sku is required.')
    .custom(value => isSkuExists(value).then(exists => {
      if (!exists) {
        return Promise.reject('Sku Number is not found.');
      }
    })),
    
  check('*.like_sku')
    .optional({ nullable: true, checkFalsy: true })
    .custom(value => {
      if (value) {
        return isSkuExists(value).then(exists => {
          if (!exists) {
            return Promise.reject('Like Sku is not found.');
          }
        });
      }
      return true;
    }),

  check('*.alloc_method')
    .isIn(['Target WOS', 'Target Qty', 'Ignore QOH/Target Qty'])
    .withMessage('Allocation Method is not valid.'),

  check('*.target_value')
    .custom((value, { req, path }) => {
      const index = path.match(/\d+/)[0];
      const alloc_method = req.body[index].alloc_method;
      const numValue = parseFloat(value);
      if (alloc_method === 'Target WOS') {
        return numValue > 0;
      } else {
        return Number.isInteger(numValue) && numValue > 0;
      }
    })
    .withMessage('"Target WOS/Qty" must be greater than 0. Target Qty (if selected) must be an integer.'),

  check('*.main_sales_method')
    .isIn(['CY Sold', 'LY Sold', 'Subclass Factor', 'Sku Factor'])
    .withMessage('Main Sales Method is not valid.'),

  check('*.avg_weekly_sold_per_store')
    .notEmpty().withMessage("Avg Weekly sold is required.")
    .custom(value => {
      if (!value) return true; // If the value is not present, skip further checks as notEmpty() will handle this case
      if (parseFloat(value) > 0) return true; // If the value is a positive number greater than zero, validation passes
      throw new Error('Avg Weekly Sold must be a positive number greater than zero.');
    }),

  check('*.eoq')
    .isInt({ min: 1 })
    .withMessage('EOQ must be a positive integer greater than zero.'),

  check('*.override_store_count')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Override Store Count must be a positive integer greater than zero.'),

  check('*.exclude_stores')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['', 'Yes', 'No'])
    .withMessage('Exclude Stores must be Yes or No.'),

  check('*.min_per_store')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Min Per Store must be a positive integer greater than zero.')
    .custom((value, { req, path }) => {
      if (!value) {
        return true; // Skip the check if value is blank
      }
      const index = path.match(/\d+/)[0];
      const max_per_store = req.body[index].max_per_store;
      if (max_per_store && parseInt(value) > parseInt(max_per_store)) {
        throw new Error('Min Per Store must be less than Max Per Store.');
      }
      return true;
    }),

  check('*.max_per_store')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Max Per Store must be a positive integer greater than zero.'),

  check('*.override_vend_id')
    .optional({ nullable: true, checkFalsy: true })
    .custom(value => {
      if (value) {
        return isVendorExists(value).then(exists => {
          if (!exists) {
            return Promise.reject('Override Vendor ID is not found.');
          }
        });
      }
      return true;
    }),

  check('*.limit_to_attached_vendor')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['', 'Yes', 'No'])
    .withMessage('Limit to Attached Vendor must be Yes or No.'),

  check('*.hard_qty_limit')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Hard Qty Limit must be a positive integer greater than zero.'),

  check('*.discounted_cost')
    .optional({ nullable: true, checkFalsy: true })
    .customSanitizer(value => value.replace('$', ''))
    .custom(value => {
      if (value === '') return true; // Skip validation if the field is empty
      return parseFloat(value) > 0;
    })
    .withMessage('Allocation Cost must be a positive number greater than zero.')
];


