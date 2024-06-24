const db = require('../config/db');

exports.determine_alloc_qtys = asyncHandler(async (req, res, next) => {
    try {
        const allocID = req.params.id;
        const allocRecord = await db.allocations.findByPk(allocID);

        if (!allocRecord)
            throw new Error ('Allocation ID not found.');

        await updateSalesMethod(allocID);
        await setRankAndExclusions(allocID);
        await setAllocQtys(allocID);

        res.status(200).json({error: 'false', errorMsg: '', message: 'Data saved correctly.'});
        
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'true', errorMsg: 'An error occurred while recalcing the allocation.' });
    }
});

async function updateSalesMethod(alloc_id) {
    const transaction = await db.sequelize.transaction();
    try {
        const allocationLines = await db.alloc_lines.findAll({
            where: { alloc_id },
            include: [
            { model: db.alloc_params, as: 'alloc_params' },
            { model: db.stores, as: 'str_meth' }
            ]
        });

        for (const record of allocationLines) {
            let newSalesMethod = record.alloc_params.main_sales_method;

            if (record.alloc_params.main_sales_method === 'CY Sold' 
                && record.str_meth.cy_weeks_open <= 12) {
                    newSalesMethod = 'SC Factor';
            } else if (record.alloc_params.main_sales_method === 'LY Sold' 
                && record.str_meth.ly_weeks_open <= 26) {
                    newSalesMethod = 'SC Factor';
            }

            await record.update({ sales_method: newSalesMethod }, 
                transaction);
        }

        await transaction.commit();

    } catch (error) {
        await transaction.rollback();
        console.error('Error sales method:', error);
        throw error
    }
}

async function setRankAndExclusions(alloc_id) {
    const allocationLines = await db.alloc_lines.findAll({
        where: { alloc_id },
        include: [
            { model: db.alloc_params, as: 'alloc_params' },
        ]
    });
    
    // Group by alloc_param_id
    const groupedByAllocParamId = allocationLines.reduce((acc, record) => {
        const allocParamId = record.alloc_param_id;
        if (!acc[allocParamId]) {
            acc[allocParamId] = [];
        }
        acc[allocParamId].push(record);
        return acc;
    }, {});
    
    // Sort and rank within each group
    Object.values(groupedByAllocParamId).forEach(group => {
        group.sort((a, b) => b.qty_sld_per_week - a.qty_sld_per_week);

        group.forEach((record, index) => {
            record.rank = index + 1;
            record.calc_alloc_qty = 0;
            record.is_excluded = false;
            record.is_filtered = false;

            const overrideStoreCount = record.alloc_params.override_store_count;
            const overrideVendId = record.alloc_params.override_vend_id;
            const limitToAttachedVendor = record.alloc_params.limit_to_attached_vendor;

            if (overrideStoreCount && 
                record.rank > overrideStoreCount) {
                    record.is_excluded = true;
                    if (record.exclude_stores)
                        record.is_filtered = true;
            } 
   
            if (overrideVendId 
                && limitToAttachedVendor 
                && record.attached_vend_id !== overrideVendId) {
                record.is_excluded = true;
                record.is_filtered = true;
            }
        });
    });
    
    // Update store rank in the database
    const transaction = await db.sequelize.transaction();
    
    try {
        for (const group of Object.values(groupedByAllocParamId)) {
            for (const record of group) {
                await record.update(
                    { rank: record.rank,
                      is_excluded: record.is_excluded,
                      is_filtered: record.is_filtered
                 }, { transaction });
            }
        }
    
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function setAllocQtys(alloc_id) {

    const allocationLines = await db.alloc_lines.findAll({
        where: { alloc_id },
        include: [
            { model: db.alloc_params, as: 'alloc_params' },
        ]
    });
    
    // Group by alloc_param_id
    const groupedByAllocParamId = allocationLines.reduce((acc, record) => {
        const allocParamId = record.alloc_param_id;
        if (!acc[allocParamId]) {
            acc[allocParamId] = { alloc_params: record.alloc_params, records: [] };
        }
        if (!record.is_excluded) {
            acc[allocParamId].records.push(record);
        }
        return acc;
    }, {});

    let updatedRecords = [];
    
    // Sort and rank within each group
    Object.values(groupedByAllocParamId).forEach(group => {

        const allocMethod = group.alloc_params.alloc_method;

        if (allocMethod === 'Target WOS') {
            updatedRecords = byTargetWOS(group.alloc_params, group.records);
        } else if (allocMethod === 'Target Qty') {
            updatedRecords = byTargetQty(group.alloc_params, group.records);
        } else if (allocMethod === 'Ignore QOH/Target Qty') {
            updatedRecords = byTargetQtyIgnoreQOH(group.alloc_params, group.records);
        }
    });

    const transaction = await db.sequelize.transaction();

    try {
        for (const record of updatedRecords) {
            await record.update(
                { calc_alloc_qty: record.calc_alloc_qty
                }, { transaction });
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

function byTargetWOS(params, records) {
    const minPerStore = params.min_per_store;
    const maxPerStore = params.max_per_store;
    const eoq = params.eoq;
    const targetWos = params.target_value;

    records.forEach(record => {
        let allocQty = (record.qty_sld_per_week * targetWos) -
            record.qoh_plus_qoo;

        allocQty = roundToNearestEOQ(allocQty, eoq);

        if (minPerStore && allocQty < minPerStore)
            allocQty = minPerStore;

        else if (maxPerStore && allocQty > maxPerStore)
            allocQty = maxPerStore;

        record.calc_alloc_qty = allocQty;
    });

    return records;
}

function byTargetQty(params, records) {
    let qtyAllocated = 0;

    //add min per store
    if (params.min_per_store && params.min_per_store > 0) {
        records.forEach((record) => {
            let min = params.min_per_store;
            if (min < params.eoq)
                min = params.eoq;

            record.calc_alloc_qty = min;
            qtyAllocated += min;
        });
    }

    // Find total qty remaining to allocate
    let totQtyRemaining = params.target_value - qtyAllocated;
    let loopComplete = false;

    //loop thry and allocate qty
    while (totQtyRemaining > 0 && !loopComplete) {
        // Find stores to allocate to
        let allocStores = records.filter((record) => !record.is_excluded);

        // filter out stores above max
        if (params.max_per_store) {
            allocStores = allocStores.filter((record) => {
                return record.calc_alloc_qty + params.eoq <= params.max_per_store
            });
        }

        // Set test WOS
        allocStores.forEach((record) => {
            record.testWOS = (record.qoh_plus_qoo + (record.calc_alloc_qty || 0) + params.eoq) /
                record.qty_sld_per_week;
        });

        // Sort by test WOS
        allocStores.sort((a, b) => a.testWOS - b.testWOS);

        // Push eoq to first store in need
        if (allocStores.length > 0) {
            allocStores[0].calc_alloc_qty += params.eoq;
            qtyAllocated += params.eoq;
            totQtyRemaining -= params.eoq;
        } else {
            loopComplete = true;
        }
    }

    return records;
}


function byTargetQtyIgnoreQOH(params, records) {
    let qtyAllocated = 0;

    //add min per store
    if (params.min_per_store && params.min_per_store > 0) {
        records.forEach((record) => {
            let min = params.min_per_store;
            if (min < params.eoq)
                min = params.eoq;

            record.calc_alloc_qty = min;
            qtyAllocated += min;
        });
    }

    // Find total qty remaining to allocate
    let totQtyRemaining = params.target_value - qtyAllocated;
    let loopComplete = false;

    let totCompanySldPerWk = records.reduce((prev, cur) => {
        return prev + cur.qty_sld_per_week;
    }, 0);

    //loop thry and allocate qty
    while (totQtyRemaining > 0 && !loopComplete) {
        // Find stores to allocate to
        let allocStores = records.filter((record) => !record.is_excluded);

        // filter out stores above max
        if (params.max_per_store) {
            allocStores = allocStores.filter((record) => {
                return record.calc_alloc_qty + params.eoq <= params.max_per_store
            });
        }

        //set allocation qty need
        allocStores.forEach((line) => {
            line.allocQtyNeed = (line.qty_sld_per_week / totCompanySldPerWk)
                * params.target_value - line.calc_alloc_qty;
        });

        // Sort by test WOS
        allocStores.sort((a, b) => b.allocQtyNeed - a.allocQtyNeed);

        // Push eoq to first store in need
        if (allocStores.length > 0) {
            allocStores[0].calc_alloc_qty += params.eoq;
            qtyAllocated += params.eoq;
            totQtyRemaining -= params.eoq;
        } else {
            loopComplete = true;
        }
    }

    return records;
}

function roundToNearestEOQ(qty, eoq) {

    const halfEOQ = eoq / 2;

    if (qty <= 0)
        return 0;

    const mult = Math.floor(qty / eoq);
    let val = eoq * mult;
    const dif = qty - val;

    if (dif >= halfEOQ)
        val += eoq;

    return val;
} 