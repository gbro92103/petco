const asyncHandler = require("express-async-handler");
const db = require('../config/db');
const permissions = require('../controllers/permissionsController');


//Display list of active rcac review records.
exports.review_list_get = asyncHandler(async (req, res, next) => {

    try {
        const loggedInUser = req.session.user;
        const menuOptions = permissions.getMenuOptions(loggedInUser.user_type);
        
        const reviews = await db.rcac_review.findAll({
            include: [
                {
                    model: db.allocations,
                    as: 'alloc',
                    attributes: ['alloc_name', 'alloc_review_due_date'],
                },
                {
                    model: db.users,
                    as: 'rcac',
                    attributes: ['full_name'],
                },
            ],
            attributes: ['reviewed', 'review_date'],
        });
    
        //render page
        res.render("active_reviews", { 
            title: "Active RCAC Reviews", 
            currentPage: "rcac-reviews", 
            reviews: reviews, 
            user: loggedInUser,
            menuOptions: menuOptions
        });
        
    } catch (error) {
        console.error("Error:", error.message);
    }    
});

//display list of all rcac notes (within past 30 days?) GET
exports.notes_list_get = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: notes list get");
});

//writes whether a notes record has been resolved POST
exports.notes_list_post = asyncHandler(async (req, res, next) => {
    res.send("NOT IMPLEMENTED: notes list post");
});