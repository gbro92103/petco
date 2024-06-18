const db = require('../config/db');

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
        await updateWithSkuInfo(allocID, transaction);
        await updateWithStoreInfo(allocID, transaction);
        await updateWithVendorInfo(allocID, transaction);
        await reinsertRCACNotes(allocID, transaction);
        await clearRCACNotesTable(allocID, transaction);
        await insertRCACReviewRecords(allocID, transaction);
        await transaction.commit();
        res.status(200).json({error: 'false', errorMsg: '', message: 'Data saved correctly.'})
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
        await db.rcac_review.destroy({
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
        alloc_param_id, alloc_id, like_sku, avg_weekly_sold_per_store, alloc_method, target_value, 
        min_per_store, max_per_store, eoq, override_store_count, main_sales_method, override_vend_id, 
        limit_to_attached_vendor, hard_qty_limit, exclude_stores, discounted_cost
    )
    SELECT i.sku_nbr, i.str_nbr, i.ly_sld, i.cy_sld, i.sc_factor, i.sku_factor, i.qoh, i.qoo, i.ar, i.vend_id, 
        p.alloc_param_id, p.alloc_id, p.like_sku, p.avg_weekly_sold_per_store, p.alloc_method, p.target_value, 
        p.min_per_store, p.max_per_store, p.eoq, p.override_store_count, p.main_sales_method, p.override_vend_id, 
        p.limit_to_attached_vendor, p.hard_qty_limit, p.exclude_stores, p.discounted_cost
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

async function updateWithSkuInfo(alloc_id, transaction) {
    const query = `
    UPDATE alloc_lines
    SET
        desc = (SELECT s.desc
                FROM skus s
                WHERE s.sku_nbr = alloc_lines.sku_nbr),
        dept = (SELECT s.dept
                FROM skus s
                WHERE s.sku_nbr = alloc_lines.sku_nbr),
        subclass = (SELECT s.subclass
                    FROM skus s
                    WHERE s.sku_nbr = alloc_lines.sku_nbr)
    WHERE alloc_id = :alloc_id
    AND EXISTS (SELECT 1
                FROM skus s
                WHERE s.sku_nbr = alloc_lines.sku_nbr);
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

async function updateWithStoreInfo(alloc_id, transaction) {
    const query = `
    UPDATE alloc_lines
    SET
        str_name = (SELECT s.str_name
                    FROM stores s
                    WHERE s.str_nbr = alloc_lines.str_nbr),
        zone_id = (SELECT s.zone_id
                   FROM stores s
                   WHERE s.str_nbr = alloc_lines.str_nbr),
        zone_name = (SELECT z.zone_name
                     FROM stores s
                     INNER JOIN zones z ON z.zone_id = s.zone_id
                     WHERE s.str_nbr = alloc_lines.str_nbr),
        rdac_id = (SELECT z.rdac_id
                   FROM stores s
                   INNER JOIN zones z ON z.zone_id = s.zone_id
                   WHERE s.str_nbr = alloc_lines.str_nbr),
        rdac_name = (SELECT rdac.full_name
                     FROM stores s
                     INNER JOIN zones z ON z.zone_id = s.zone_id
                     LEFT JOIN users rdac ON rdac.user_id = z.rdac_id
                     WHERE s.str_nbr = alloc_lines.str_nbr),
        dist_id = (SELECT s.dist_id
                   FROM stores s
                   WHERE s.str_nbr = alloc_lines.str_nbr),
        rcac_id = (SELECT s.rcac_id
                   FROM stores s
                   WHERE s.str_nbr = alloc_lines.str_nbr),
        rcac_name = (SELECT rcac.full_name
                     FROM stores s
                     LEFT JOIN users rcac ON rcac.user_id = s.rcac_id
                     WHERE s.str_nbr = alloc_lines.str_nbr),
        dt_opened = (SELECT s.dt_opened
                     FROM stores s
                     WHERE s.str_nbr = alloc_lines.str_nbr),
        dt_closed = (SELECT s.dt_closed
                     FROM stores s
                     WHERE s.str_nbr = alloc_lines.str_nbr),
        str_active = (SELECT s.active
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

async function updateWithVendorInfo(alloc_id, transaction) {
    const query = `
    UPDATE alloc_lines
    SET
        attached_vend_name = (SELECT att.vend_name
                              FROM vendors att
                              WHERE att.vend_id = alloc_lines.attached_vend_id),
        override_vend_name = (SELECT ovr.vend_name
                              FROM vendors ovr
                              WHERE ovr.vend_id = alloc_lines.override_vend_id)
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
      const notesToUpdate = await SaveRcacNotes.findAll({
        where: {
            alloc_id: alloc_id
        },
        transaction
        });

        // Loop through each record and update alloc_lines
        for (const note of notesToUpdate) {
            await AllocLines.update({
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
        },
        transaction
        });

        // Prepare the records for insertion
        const recordsToInsert = distinctRecords.map(record => ({
            alloc_id: record.alloc_id,
            rcac_id: record.rcac_id,
            reviewed: false // Set the default value for 'reviewed' as false
        }));

        // Bulk insert into rcac_review
        await db.rcac_review.bulkCreate(recordsToInsert, { transaction });
    } catch (error) {
        console.error('Error updating data:', error);
        throw error  
    }
}
