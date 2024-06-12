const asyncHandler = require("express-async-handler");
const db = require('../config/db');
const permissions = require('../controllers/permissionsController');
const { checkSchema, validationResult } = require('express-validator');

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

        console.log(req.session.errors)
        let errors = [];

        if (req.session.errors) {
          errors = req.session.errors;
          params = req.session.formData.data;
          console.log("Here is the form data that is being used: ", req.session.formData);
        }
          
        res.render("main_allocation_template", { 
          title: "Update Allocation",
          currentPage: "allocations",
          allocation: alloc,
          allocParams: params,
          allocLines: lines, 
          sums: sums,
          errors: errors,
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

  try {
    const errors = validationResult(req).formatWith(customErrorFormatter);
    req.session.errors = errors.array();
    req.session.formData = req.body;
    
    if (!errors.isEmpty()) {
      console.log('Discovered errors:', errors);
      res.redirect(`/petco/live-animal/allocations/${req.params.id}/update`)
      return;
    }
    // Process the valid data 
    const data = req.body.data;

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // Copy the data object to avoid modifying the original data
        const param = { ...data[key], alloc_id: req.params.id };
    
        // Remove the row_index field
        delete param.row_index;

        //check to resolve foreign key constraint errors
        if (!param.like_sku)
            param.like_sku = null;

        if (!param.override_vend_id)
            param.override_vend_id = null;

        //save to database
        if (param.alloc_param_id) {
    
            await db.alloc_params.update(
                param,
                {where: { alloc_param_id: param.alloc_param_id }}
            );
        } else {
            param.alloc_param_id = null;
            await db.alloc_params.create(param);
        }
      }
    }
  res.redirect(`/petco/live-animal/allocations/${req.params.id}/update`)
  } catch (error) {
      console.error('Error saving allocation parameters:', error);
      res.status(500).send('Internal Server Error');
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

// Middleware to normalize allocParams
exports.preprocessAllocParams = (req, res, next) => {
  if (req.body.allocParams) {
    req.body.data = normalizeAllocParams(req.body.allocParams);
  }
  next();
};

// Function to normalize allocParams
function normalizeAllocParams(allocParams) {
  const data = [];
  const rowCount = allocParams.row_index.length;
  for (let i = 0; i < rowCount; i++) {
    const item = {};
    for (const key in allocParams) {
      if (allocParams.hasOwnProperty(key)) {
        item[key] = allocParams[key][i];
      }
    }
    data.push(item);
  }
  return data;
}

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

exports.validateAllocParams = checkSchema({
  'data.*.sku_nbr': {
    in: ['body'],
    notEmpty: {
      errorMessage: 'sku is required.'
    },
    custom: {
      options: (value) => isSkuExists(value).then(exists => {
        if (!exists) {
          return Promise.reject('Sku Number is not found.');
        }
      })
    }
  },
  'data.*.like_sku': {
    in: ['body'],
    optional: true,
    custom: {
      options: (value) => {
        if (value) {
          return isSkuExists(value).then(exists => {
            if (!exists) {
              return Promise.reject('Like Sku is not found.');
            }
          });
        }
        return true;
      }
    }
  },
  'data.*.alloc_method': {
    in: ['body'],
    isIn: {
      options: [['Target WOS', 'Target Qty', 'Ignore QOH/Target Qty']],
      errorMessage: 'Allocation Method is not valid.'
    }
  },
  'data.*.target_value': {
    in: ['body'],
    custom: {
      options: (value, { req, path }) => {
        const index = path.match(/\d+/)[0];
        const alloc_method = req.body.data[index].alloc_method;
        const numValue = parseFloat(value);
        if (alloc_method === 'Target WOS') {
          return numValue > 0;
        } else {
          return Number.isInteger(numValue) && numValue > 0;
        }
      },
      errorMessage: '"Target WOS/Qty" must be greater than 0. Target Qty (if selected) must be an integer.'
    }
  },
  'data.*.main_sales_method': {
    in: ['body'],
    isIn: {
      options: [['CY Sold', 'LY Sold', 'Subclass Factor', 'Sku Factor']],
      errorMessage: 'Main Sales Method is not valid.'
    }
  },
  'data.*.avg_weekly_sold_per_store': {
    in: ['body'],  
    custom: {
      options: (value) => {
        return parseFloat(value) > 0;
      },
      errorMessage: 'Avg Weekly Sold must be a positive number greater than zero.'
    }
  },
  'data.*.eoq': {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'EOQ must be a positive integer greater than zero.'
    }
  },
  'data.*.override_store_count': {
    in: ['body'],
    optional: true,
    custom: {
      options: (value) => {
        if (value === '') return true; // Skip validation if the field is empty
        return Number.isInteger(Number(value)) && Number(value) > 0;
      },
      errorMessage: 'Override Store Count must be a positive integer greater than zero.'
    }
  },
  'data.*.exclude_stores': {
    in: ['body'],
    optional: true,
    isIn: {
      options: [['', 'Yes', 'No']],
      errorMessage: 'Exclude Stores must be Yes or No.'
    }
  },
  'data.*.min_per_store': {
    in: ['body'],
    optional: true,
    custom: {
      options: (value) => {
        if (value === '') return true; // Skip validation if the field is empty
        return Number.isInteger(Number(value)) && Number(value) > 0;
      },
      errorMessage: 'Min Per Store must be a positive integer greater than zero.'
    },
    custom: {
      options: (value, { req, path }) => {
        const index = path.match(/\d+/)[0];
        const max_per_store = req.body.data[index].max_per_store;
        if (max_per_store && value > max_per_store) {
          throw new Error('Min Per Store must be less than Max Per Store.');
        }
        return true;
      }
    }
  },
  'data.*.max_per_store': {
    in: ['body'],
    optional: true,
    custom: {
      options: (value) => {
        if (value === '') return true; // Skip validation if the field is empty
        return Number.isInteger(Number(value)) && Number(value) > 0;
      },
      errorMessage: 'Max Per Store must be a positive integer greater than zero.'
    }
  },
  'data.*.override_vend_id': {
    in: ['body'],
    optional: true,
    custom: {
      options: (value) => {
        if (value) {
          return isVendorExists(value).then(exists => {
            if (!exists) {
              return Promise.reject('Override Vendor ID is not found.');
            }
          });
        }
        return true;
      }
    }
  },
  'data.*.limit_to_attached_vendor': {
    in: ['body'],
    optional: true,
    isIn: {
      options: [['', 'Yes', 'No']],
      errorMessage: 'Limit to Attached Vendor must be Yes or No.'
    }
  },
  'data.*.hard_qty_limit': {
    in: ['body'],
    optional: true,
    custom: {
      options: (value) => {
        if (value === '') return true; // Skip validation if the field is empty
        return Number.isInteger(Number(value)) && Number(value) > 0;
      },
      errorMessage: 'Hard Qty Limit must be a positive integer greater than zero.'
    }
  },
  'data.*.discounted_cost': {
    in: ['body'],
    optional: true,
    customSanitizer: {
      options: (value) => value.replace('$', '')
    },
    custom: {
      options: (value) => {
        if (value === '') return true; // Skip validation if the field is empty
        return parseFloat(value) > 0;
      },
      errorMessage: 'Allocation Cost must be a positive number greater than zero.'
    }
  }
});

const customErrorFormatter = ({ msg, path, value, location }) => {

  console.log("Error Checking - value: ", value);
  console.log("Error Checking - msg: ", msg);
  console.log("Error Checking - path: ", path);
  console.log("Error Checking - location: ", location);

  const match = path.match(/\d+/);
  const index = match ? match[0] : null;

  console.log("Error Checking - index: ", index);

  return {
    type: 'field',
    value,
    msg,
    path,
    location,
    index: index // Include the index in the error object
  };
};


