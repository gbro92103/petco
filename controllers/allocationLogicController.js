const db = require('../config/db');

exports.determine_alloc_qtys = asyncHandler(async (req, res, next) => {

});

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