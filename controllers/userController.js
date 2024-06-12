 asyncHandler = require("express-async-handler");
 const db = require('../config/db');
 const permissions = require('../controllers/permissionsController');

// Display list of all users. 
exports.users_list_get = asyncHandler(async (req, res, next) => {
    
    try {
        const loggedInUser = req.session.user;
        const menuOptions = permissions.getMenuOptions(loggedInUser.user_type);
        const userPermissions = permissions.getPermissions(loggedInUser.user_type);
    
        // Retrieve all records from the "allocations" table
        const users = await db.users.findAll();
        
        res.render("user_list", { 
            title: "User List", 
            currentPage: "users", 
            users: users, 
            user: loggedInUser,
            menuOptions: menuOptions,
            permissions: userPermissions
        });
    } catch (error) {
        console.error("Error:", error.message);
    }    
});




// new user GET.
exports.new_user_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: new user get");
});

// new user POST.
exports.new_user_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: new user post");
});

// update user GET.
exports.update_user_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: update user get");
});

// update user POST.
exports.update_user_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: update user post");
});

