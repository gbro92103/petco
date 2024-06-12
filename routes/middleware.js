const permissions_controller = require("../controllers/permissionsController");

// Middleware function to check if user has permission
function requirePermission(permissionName) {
    return function(req, res, next) {
        const userType = req.session.user.user_type; // Assuming user permissions are stored in req.session.user.user_type
        if (permissions_controller.getPermissionByName(userType, permissionName)) {
            next(); // User has permission, proceed to the next middleware or route handler
        } else {
            res.status(403).send("Access denied"); // User does not have permission, send 403 Forbidden status
        }
    };
}

// Middleware function to check if user is logged in
function requireLogin(req, res, next) {
    if (req.session && req.session.user && req.session.user.status === 'active') { // Assuming user object is stored in req.user
        next();
    } else {
        res.redirect('/petco/live-animal/login'); // Continue to the next middleware or route handler
    }
}

// Middleware function to check if user is logged in
function requireTempLogin(req, res, next) {
    if (req.session && req.session.user && (req.session.user.status === 'temporary' || req.session.user.status === 'active')) { // Assuming user object is stored in req.user
        next();
    } else {
        res.redirect('/petco/live-animal/login'); // Continue to the next middleware or route handler
    }
}

function requireAllocStatus(req, res, next) {
    const alloc_status = req.body.alloc_status;
    if (alloc_status && alloc_status === 'Setup') {
        next();
    } else {
        res.status(403).send("Access denied");
    }
}

module.exports = {
    requireLogin, requireTempLogin, requirePermission, requireAllocStatus
};