const db = require('../config/db');

exports.determine_alloc_qtys = asyncHandler(async (req, res, next) => {
    try {
        const allocID = req.params.id;
        const allocRecord = await db.allocations.findByPk(allocID);

        if (!allocRecord)
            throw new Error ('Allocation ID not found.');

        await updateSalesMethod(allocID);
        await setRankAndExclusions(allocID);
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

            console.log(`Rank: ${record.rank} - Store #: ${record.str_nbr} Exlcuded: ${record.is_excluded} - Filtered: ${record.is_filtered}`);
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