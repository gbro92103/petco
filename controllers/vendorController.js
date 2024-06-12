const asyncHandler = require("express-async-handler");
const db = require('../config/db');
const permissions = require('../controllers/permissionsController');

//vendor qty breakouts GET 
exports.vendor_qty_breakout_get = asyncHandler(async (req, res, next) => {
    try {
        const loggedInUser = req.session.user;
        const menuOptions = permissions.getMenuOptions(loggedInUser.user_type);
        const userPermissions = permissions.getPermissions(loggedInUser.user_type);

        // Retrieve all/sum records from the "alloc_lines" table by vendor
        
        const vendQtys = await db.sequelize.query(`
          SELECT 
              SUM(act_alloc_qty) AS tot_vend_qty,
              act_vend_id,
              vendors.vend_name AS vend_name,
              skus.sku_nbr AS sku_nbr,
              skus.desc AS sku_desc,
              allocations.alloc_id AS alloc_id,
              allocations.alloc_name AS alloc_name,
              allocations.alloc_review_due_date AS alloc_review_due_date
          FROM 
              alloc_lines
          INNER JOIN 
              vendors ON alloc_lines.act_vend_id = vendors.vend_id
          INNER JOIN 
              skus ON alloc_lines.sku_nbr = skus.sku_nbr
          INNER JOIN 
              allocations ON alloc_lines.alloc_id = allocations.alloc_id
          WHERE 
              allocations.alloc_status NOT IN ('Complete', 'Cancelled')
          GROUP BY 
              act_vend_id, 
              vendors.vend_name, 
              skus.sku_nbr, 
              skus.desc, 
              allocations.alloc_id, 
              allocations.alloc_name, 
              allocations.alloc_date
      `, {
          type: db.sequelize.QueryTypes.SELECT,
          raw: true,
      });


      console.log(vendQtys);

      res.render("vendor_qtys", { 
          title: "Breakout Vendor Qtys", 
          currentPage: "vendor-breakouts", 
          vendorQtys: vendQtys, 
          user: loggedInUser,
          menuOptions: menuOptions,
          permissions: userPermissions
      });


        /*
        const vendQtys = await db.alloc_lines.findAll({
            attributes: [
              [db.sequelize.fn('SUM', db.sequelize.col('act_alloc_qty')), 'tot_vend_qty'],
              'act_vend_id'
            ],
            include: [
              {
                model: db.vendors,
                as: 'act_vendor',
                attributes: ['vend_name']
              },
              {
                model: db.skus,
                as: 'sku_nbr_sku',
                attributes: ['sku_nbr', 'desc']
              },
              {
                model: db.allocations,
                as: 'alloc',
                attributes: ['alloc_id', 'alloc_name', 'alloc_date'],
                where: {
                  alloc_status: { [db.Op.notIn]: ['Complete', 'Cancelled'] }
                }
              }
            ],
            group: ['act_vend_id', 'act_vendor.vend_name', 'sku_nbr_sku.sku_nbr', 'sku_nbr_sku.desc', 'alloc.alloc_id', 'alloc.alloc_name', 'alloc.alloc_date']
          });
          */

            
          /*
          vendQtys.forEach(item => {
            console.log('Vendor ID:', item.act_vend_id);
            console.log('Vendor Name:', item.vendors.vend_name);
            console.log('Total Quantity:', item.tot_vend_qty); // Access the summed quantity using the alias 'tot_vend_qty'
        });
        */
    } catch (error) {
        console.error("Error:", error.message);
    } 
   
});