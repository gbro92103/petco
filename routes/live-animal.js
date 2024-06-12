const express = require('express');
const router = express.Router();

// Require controller modules.
const user_controller = require("../controllers/userController");
const auth_controller = require("../controllers/authController");
const { requireLogin, requirePermission, requireTempLogin} = require("../routes/middleware");

router.get('/', function(req, res, next) {
    res.redirect('/petco/live-animal/login');
});

/*User Routes*/
router.get("/users/", requireLogin, requirePermission("canViewUsers"), user_controller.users_list_get);
router.get("/users/create/", requireLogin, requirePermission("canAddUsers"), user_controller.new_user_get);
router.post("/users/create/", requireLogin, requirePermission("canAddUsers"), user_controller.new_user_post);
router.get("/users/:id/update/", requireLogin, requirePermission("canUpdateUsers"), user_controller.update_user_get);
router.post("/users/:id/update/", requireLogin, requirePermission("canUpdateUsers"), user_controller.update_user_post);

/*auth routes*/
router.get('/login/', auth_controller.login_page_get);
router.post('/login/', auth_controller.login_page_post);
router.get('/logout/', auth_controller.log_out_get);
router.get('/accounts/update/', requireTempLogin, auth_controller.change_password_get);
router.post('/accounts/update/', requireTempLogin, auth_controller.change_password_post);
router.get('/users/:id/reset/', requireLogin, requirePermission("canResetUserPasswords"), auth_controller.reset_password_get);

module.exports = router;