const db = require('../config/db');
const { body, validationResult } = require('express-validator');

exports.recalc_allocation_post = asyncHandler(async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const allocID = req.params.id;
        const allocRecord = await db.allocations.findByPk(allocID);

        if (!allocRecord)
            throw error ('Allocation ID not found.')

        await clearRCACNotesTable(allocID, transaction);
        await clearRCACReviewTable(allocID, transaction);
        await saveExistingRCACNotes(allocID, transaction);
        await deleteAllocLinesRecords(allocID, transaction);
        await insertInvLocRecords(allocID, transaction);
        await updateWithLikeSkuSalesInfo(allocID, transaction);
        await updateWithStoreInfo(allocID, transaction);
        await reinsertRCACNotes(allocID, transaction);
        await clearRCACNotesTable(allocID, transaction);
        await insertRCACReviewRecords(allocID, transaction);
        
        await transaction.commit();
        next();
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ error: 'true', errorMsg: 'An error occurred while recalcing the allocation.' });
    }
});

async function clearRCACNotesTable(alloc_id, transaction) {
    try {
        await db.save_rcac_notes.destroy({
            where: {
                alloc_id: alloc_id
            }, transaction
        });
    } catch (error) {
        console.error('Error deleting rows:', error);
        throw error
    }
}

async function clearRCACReviewTable(alloc_id, transaction) {
    try {
        await db.rcac_reviews.destroy({
            where: {
                alloc_id: alloc_id
            }, transaction
        });
    } catch (error) {
        console.error('Error deleting rows:', error);
        throw error
    }
}

async function saveExistingRCACNotes(alloc_id, transaction) {
    const query = `
    INSERT INTO save_rcac_notes (alloc_id, alloc_param_id, sku_nbr, str_nbr, revised_alloc_qty, notes, changed_by_id, changed_by_date)
    SELECT alloc_id, alloc_param_id, sku_nbr, str_nbr, revised_alloc_qty, notes, changed_by_id, changed_by_date
    FROM alloc_lines
    WHERE alloc_lines.alloc_id = :alloc_id;
    `;

    await db.sequelize.query(query, {
        replacements: { alloc_id },
        type: db.sequelize.QueryTypes.INSERT,
        transaction
    }).then(() => {
        console.log('Data inserted successfully');
    }).catch(error => {
        console.error('Error inserting data:', error);
        throw error;
    });
}

async function deleteAllocLinesRecords(alloc_id, transaction) {
    try {
        await db.alloc_lines.destroy({
            where: {
                alloc_id: alloc_id
            }, transaction
        });
    } catch (error) {
        console.error('Error deleting rows:', error);
        throw error
    }
}

async function insertInvLocRecords(alloc_id, transaction) {
    const query = `
    INSERT INTO alloc_lines (
        sku_nbr, str_nbr, ly_sld, cy_sld, sc_factor, sku_factor, qoh, qoo, ar, attached_vend_id, 
        alloc_param_id, alloc_id, override_vend_id, calc_alloc_qty
    )
    SELECT i.sku_nbr, i.str_nbr, i.ly_sld, i.cy_sld, i.sc_factor, i.sku_factor, i.qoh, i.qoo, i.ar, i.vend_id, 
        p.alloc_param_id, p.alloc_id, p.override_vend_id, 0
    FROM invloc i
    INNER JOIN alloc_params p ON p.sku_nbr = i.sku_nbr
    WHERE p.alloc_id = :alloc_id
    `;

    await db.sequelize.query(query, {
        replacements: { alloc_id },
        type: db.sequelize.QueryTypes.INSERT,
        transaction
    }).then(() => {
        console.log('Data inserted successfully');
    }).catch(error => {
        console.error('Error inserting data:', error);
        throw error;
    });
}

async function updateWithLikeSkuSalesInfo(alloc_id, transaction) {
    
    const updates = await db.sequelize.query(`
    SELECT 
      l.alloc_line_id,
      i.cy_sld,
      i.ly_sld,
      i.sc_factor,
      i.sku_factor
    FROM alloc_lines l
    INNER JOIN alloc_params p ON p.alloc_param_id = l.alloc_param_id
    INNER JOIN invloc i ON i.sku_nbr = p.like_sku AND i.str_nbr = l.str_nbr
    WHERE l.alloc_id = :alloc_id AND p.like_sku IS NOT NULL
  `, {
    replacements: { alloc_id: alloc_id },
    type: db.sequelize.QueryTypes.SELECT
  });

  // Step 2: Update alloc_lines table with fetched data
  const updatePromises = updates.map(update => {
    return db.alloc_lines.update(
      {
        like_sku_cy_sld: update.cy_sld,
        like_sku_ly_sld: update.ly_sld,
        like_sku_sc_factor: update.sc_factor,
        like_sku_sku_factor: update.sku_factor
      },
      {
        where: { id: update.alloc_line_id }
      },
      transaction
    );
  });

  await Promise.all(updatePromises);
}

async function updateWithStoreInfo(alloc_id, transaction) {
    const query = `
    UPDATE alloc_lines
    SET
        zone_id = (SELECT s.zone_id
                   FROM stores s
                   WHERE s.str_nbr = alloc_lines.str_nbr),
        rdac_id = (SELECT z.rdac_id
                   FROM stores s
                   INNER JOIN zones z ON z.zone_id = s.zone_id
                   WHERE s.str_nbr = alloc_lines.str_nbr),
        dist_id = (SELECT s.dist_id
                   FROM stores s
                   WHERE s.str_nbr = alloc_lines.str_nbr),
        rcac_id = (SELECT s.rcac_id
                   FROM stores s
                   WHERE s.str_nbr = alloc_lines.str_nbr)
    WHERE alloc_id = :alloc_id;
    `;

    await db.sequelize.query(query, {
        replacements: { alloc_id },
        type: db.sequelize.QueryTypes.UPDATE,
        transaction
    }).then(() => {
        console.log('Data updated successfully');
    }).catch(error => {
        console.error('Error updating data:', error);
        throw error;
    });
}

async function reinsertRCACNotes(alloc_id, transaction) {
    try {
        // Fetch the relevant records from save_rcac_notes
        const notesToUpdate = await db.save_rcac_notes.findAll({
            where: {
                alloc_id: alloc_id
            },
        });

        // Loop through each record and update alloc_lines
        for (const note of notesToUpdate) {
            await db.alloc_lines.update({
                revised_alloc_qty: note.revised_alloc_qty,
                notes: note.notes,
                changed_by_id: note.changed_by_id,
                changed_by_date: note.changed_by_date
            }, {
                where: {
                    alloc_id: note.alloc_id,
                    alloc_param_id: note.alloc_param_id,
                    sku_nbr: note.sku_nbr,
                    str_nbr: note.str_nbr
                },
                transaction
            });
        }
    } catch (error) {
        console.error('Error updating data:', error);
        throw error
    }
}

async function insertRCACReviewRecords(alloc_id, transaction) {
    try {
       // Fetch distinct records from alloc_lines
       const distinctRecords = await db.alloc_lines.findAll({
            attributes: [
                [db.sequelize.fn('DISTINCT', db.sequelize.col('alloc_id')), 'alloc_id'],
                'rcac_id'
            ],
            where: {
                alloc_id: alloc_id
            }
        });

        // Prepare the records for insertion
        const recordsToInsert = distinctRecords.map(record => ({
            alloc_id: record.alloc_id,
            rcac_id: record.rcac_id,
            reviewed: false // Set the default value for 'reviewed' as false
        }));

        // Bulk insert into rcac_review
        await db.rcac_reviews.bulkCreate(recordsToInsert, { transaction });
    } catch (error) {
        console.error('Error updating data:', error);
        throw error  
    }
}

exports.save_alloc_line_post = asyncHandler(async (req, res, next) => {
   // Handle validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
        console.log(errors);
       return res.status(400).json({ errors: errors.array() });
   }

   try {
       const { alloc_line_id, field, value } = req.body;

       // Create an object to hold the update data
       const updateData = {};
       updateData[field] = value;

       // Perform the update
       const result = await db.alloc_lines.update(updateData, {
           where: {
               alloc_line_id: alloc_line_id
           }
       });

        if (result[0] === 0) {
            return res.status(404).json({ message: 'Allocation line not found or no changes made' });
        }

        await updateActAllocQty(alloc_line_id);

        const allocId = await getAllocIdFromAllocLineId(alloc_line_id); // Function to fetch alloc_id from alloc_line_id
        req.params.id = allocId; // Set alloc_id in params for use in subsequent middleware
        next();
    } catch (error) {
        console.error('Error updating allocation line:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


async function updateActAllocQty(lineId) {
    try {
        // Fetch calc_alloc_qty and revised_alloc_qty from alloc_lines
        const allocLine = await db.alloc_lines.findByPk(lineId, {
            attributes: ['calc_alloc_qty', 'revised_alloc_qty']
        });

        if (!allocLine) {
            throw new Error('Allocation Line not found.');
        }

        // Determine the value for act_alloc_qty based on the rules
        let actAllocQty = 0; // Default to 0 if both calc_alloc_qty and revised_alloc_qty are null or 0

        if (allocLine.revised_alloc_qty !== null) {
            actAllocQty = allocLine.revised_alloc_qty;
        } else {
            actAllocQty = allocLine.calc_alloc_qty || 0; // If calc_alloc_qty is null, default to 0
        }

        // Update act_alloc_qty in alloc_lines table
        const updateResult = await db.alloc_lines.update({
            act_alloc_qty: actAllocQty
        }, {
            where: {
                alloc_line_id: lineId
            }
        });

        if (updateResult[0] === 0) {
            throw new Error('Failed to update act_alloc_qty.');
        }

        console.log(`act_alloc_qty updated successfully for alloc_line_id: ${lineId}`);

        return true; // Return true on successful update
    } catch (error) {
        console.error('Error updating act_alloc_qty:', error);
        throw error; // Propagate the error to the caller
    }
};

async function getAllocIdFromAllocLineId(alloc_line_id) {
    try {
        const allocLine = await db.alloc_lines.findOne({
            include: [{
                model: db.alloc_params,
                as: 'alloc_params',
                include: {
                    model: db.allocations,
                    as: 'alloc',
                    attributes: ['alloc_id']
                }
            }],
            where: {
                alloc_line_id: alloc_line_id
            }
        });

        if (!allocLine || !allocLine.alloc_params || !allocLine.alloc_params.alloc) {
            throw new Error('Allocation ID not found for the given alloc_line_id.');
        }

        return allocLine.alloc_params.alloc.alloc_id;
    } catch (error) {
        console.error('Error fetching alloc_id from alloc_line_id:', error);
        throw error; // Propagate the error to the caller
    }
};

exports.validateAllocLine = [
    body('alloc_line_id').isInt().withMessage('alloc_line_id must be an integer'),
    body('field').isString().withMessage('field must be a string'),
    body('value').custom(async (value, { req }) => {
        const { field, alloc_line_id } = req.body;
        
        let fieldName = '';
        if (field === 'calc_alloc_qty')
            fieldName = "Calculated Allocation Qty";
        else if (field === 'revised_alloc_qty')
            fieldName = "Revised Allocation Qty";
        else if (field === 'notes')
            fieldName = "Notes";

        if (field === 'calc_alloc_qty' || field === 'revised_alloc_qty') {
            const numValue = parseInt(value, 10);
            if (!Number.isInteger(numValue) || numValue <= 0) {
                throw new Error(`${field} must be a positive integer greater than 0`);
            }

            // Fetch EOQ and max_per_store from the alloc_params table via alloc_lines
            const allocLine = await db.alloc_lines.findOne({
                where: { alloc_line_id },
                include: [{
                    model: db.alloc_params,
                    as: 'alloc_params'
                }]
            });

            if (!allocLine || !allocLine.alloc_params) {
                throw new Error(`Invalid alloc_line_id: ${alloc_line_id}`);
            }

            const { eoq, max_per_store } = allocLine.alloc_params;
            if (numValue % eoq !== 0) {
                throw new Error(`${fieldName} must be a multiple of the EOQ (${eoq})`);
            }
            if (max_per_store && numValue > max_per_store) {
                throw new Error(`${fieldName} must be equal to or less than Max Per Store (${max_per_store})`);
            }
        }
        return true;
    }),
    body('calc_alloc_qty').optional().isInt({ gt: 0 }).withMessage(`Calculated Allocation Qty must be a positive integer greater than 0.`),
    body('revised_alloc_qty').optional().isInt({ gt: 0 }).withMessage(`Revised Allocation Qty must be a positive integer greater than 0.`),
    body('notes').optional().isString().withMessage(`Notes must be a string.`)
];