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
            alloc_date: allocDate.toISOString().split('T')[0],
            alloc_review_due_date: reviewDate.toISOString().split('T')[0],
            alloc_status: "Setup"
        };

        res.render("main_allocation_template", { 
            title: "Create New Allocation",
            currentPage: "allocations",
            allocation: alloc, 
            user: loggedInUser,
            menuOptions: menuOptions,
            permissions: userPermissions
        });
    } catch (error) {
        console.error("Error:", error.message);
    }
});

//new allocation POST 
exports.new_allocation_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: new allocation post");
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
        delete param.row_index;

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
  const paramID = req.params.id;
  let allocID = 0;
  
  try {
    const allocParam = await db.alloc_params.findByPk(paramID);

    if (allocParam) {
      allocID = allocParam.alloc_id;
    } else {
      res.redirect("/petco/live-animal/allocations/");
    }

    const result = await db.alloc_params.destroy({
        where: {
            alloc_param_id: paramID
        }
    });

    if (result) {
        console.log(`Row with alloc_param_id = ${paramID} was deleted successfully.`);
    } else {
        console.log(`No row found with alloc_param_id = ${paramID}.`);
    }
    res.redirect(`/petco/live-animal/allocations/${allocID}/update`)
  } catch (error) {
      console.error('Error deleting row:', error);
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
    .optional()
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
    .custom(value => parseFloat(value) > 0)
    .withMessage('Avg Weekly Sold must be a positive number greater than zero.'),

  check('*.eoq')
    .isInt({ min: 1 })
    .withMessage('EOQ must be a positive integer greater than zero.'),

  check('*.override_store_count')
    .optional()
    .custom(value => {
      if (value === '') return true; // Skip validation if the field is empty
      return Number.isInteger(Number(value)) && Number(value) > 0;
    })
    .withMessage('Override Store Count must be a positive integer greater than zero.'),

  check('*.exclude_stores')
    .optional()
    .isIn(['', 'Yes', 'No'])
    .withMessage('Exclude Stores must be Yes or No.'),

  check('*.min_per_store')
    .optional()
    .custom((value, { req, path }) => {
      if (value === '') return true; // Skip validation if the field is empty
      const index = path.match(/\d+/)[0];
      const max_per_store = req.body[index].max_per_store;
      if (max_per_store && value > max_per_store) {
        throw new Error('Min Per Store must be less than Max Per Store.');
      }
      return Number.isInteger(Number(value)) && Number(value) > 0;
    })
    .withMessage('Min Per Store must be a positive integer greater than zero.'),

  check('*.max_per_store')
    .optional()
    .custom(value => {
      if (value === '') return true; // Skip validation if the field is empty
      return Number.isInteger(Number(value)) && Number(value) > 0;
    })
    .withMessage('Max Per Store must be a positive integer greater than zero.'),

  check('*.override_vend_id')
    .optional()
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
    .optional()
    .isIn(['', 'Yes', 'No'])
    .withMessage('Limit to Attached Vendor must be Yes or No.'),

  check('*.hard_qty_limit')
    .optional()
    .custom(value => {
      if (value === '') return true; // Skip validation if the field is empty
      return Number.isInteger(Number(value)) && Number(value) > 0;
    })
    .withMessage('Hard Qty Limit must be a positive integer greater than zero.'),

  check('*.discounted_cost')
    .optional()
    .customSanitizer(value => value.replace('$', ''))
    .custom(value => {
      if (value === '') return true; // Skip validation if the field is empty
      return parseFloat(value) > 0;
    })
    .withMessage('Allocation Cost must be a positive number greater than zero.')
];


