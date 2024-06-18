const db = require('../config/db');

exports.recalc_allocation_post = asyncHandler(async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const allocID = req.params.id;
        const allocRecord = await db.allocations.findByPk(allocID);

        if (!allocRecord)
            throw error ('Allocation ID not found.')

        await insertInvLocRecords(allocID, transaction);
        await updateWithSkuInfo(allocID, transaction);
        await updateWithStoreInfo(allocID, transaction);
        await updateWithVendorInfo(allocID, transaction);
        //await updateRcacReviewTable(allocID, transaction);
        await transaction.commit();
        res.status(200).json({error: 'false', errorMsg: '', message: 'Data saved correctly.'})
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ error: 'true', errorMsg: 'An error occurred while recalcing the allocation.' });
    }
});

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
    SET desc = s.desc,
        dept = s.dept,
        subclass = s.subclass
    FROM alloc_lines l
    INNER JOIN skus s ON s.sku_nbr = l.sku_nbr
    INNER JOIN allocations a ON a.alloc_id = l.alloc_id
    WHERE a.alloc_id = :alloc_id
    AND l.sku_nbr = s.sku_nbr;
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
    SET str_name = s.str_name,
        zone_id = s.zone_id,
        zone_name = z.zone_name,
        rdac_id = z.rdac_id,
        rdac_name = rdac.full_name,
        dist_id = s.dist_id,
        rcac_id = s.rcac_id,
        rcac_name = rcac.full_name,
        dt_opened = s.dt_opened,
        dt_closed = s.dt_closed,
        str_active = s.active
    FROM alloc_lines l
    INNER JOIN stores s ON s.str_nbr = l.str_nbr
    INNER JOIN allocations a ON a.alloc_id = l.alloc_id
    INNER JOIN zones z ON z.zone_id = s.zone_id
    LEFT JOIN users rdac ON rdac.user_id = z.rdac_id
    LEFT JOIN users rcac ON rcac.user_id = s.rcac_id
    WHERE a.alloc_id = :alloc_id
    AND l.str_nbr = s.str_nbr;
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
    SET attached_vend_name = att.vend_name,
        override_vend_name = ovr.vend_name
    FROM alloc_lines l
    INNER JOIN allocations a ON a.alloc_id = l.alloc_id
    LEFT JOIN vendors att on att.vend_id = l.attached_vend_id
    LEFT JOIN vendors ovr on ovr.vend_id = l.override_vend_id
    WHERE a.alloc_id = :alloc_id
    AND att.vend_id = l.attached_vend_id
    AND ovr.vend_id = l.override_vend_id
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