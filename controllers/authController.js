asyncHandler = require("express-async-handler");
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Render the login page GET
exports.login_page_get = asyncHandler(async (req, res, next) => {
    res.render("login");
});
  
// Handle login POST request
exports.login_page_post = asyncHandler(async (req, res, next) => {
 
    const errors = [];
  
    try {
      // Check if the user exists in the database
      const user = await db.users.findOne({ where: { user_name: req.body.username.toString().toLowerCase()} });
      if (!user) {
        errors.push('User not found or password is incorrect.');
        throw new Error('User not found');
      }
  
      // Check if the user is blocked
      if (user.status === 'blocked') {
        errors.push('User is blocked. Please contact system admin to reset password.');
        throw new Error('User is blocked');
      }
  
      // Check if the user is inactive
      if (user.status === 'inactive') {
        errors.push('User is inactive. Please contact system admin if you believe this is in error.');
        throw new Error('User is inactive');
      }
      
      // Check if the user status is temporary
      if (user.status === 'temporary') {
        // Check if the provided password matches the temporary password
        const isMatch = req.body.password === user.temp_password;
        if (!isMatch) {
          errors.push('User not found or password is incorrect.');
          throw new Error(`Incorrect temporary password`);
        }
        // If password matches, set session and redirect to change password page

        req.session.user = user;

        return res.redirect("/petco/live-animal/accounts/update/")
        
      }
  
      // For active users, compare provided password with hashed password
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        errors.push('User not found or password is incorrect.');
        throw new Error(`Incorrect password.`);
      }
  
      // If password matches, set session and redirect
      req.session.user = user;
  
      // Redirect to allocation page for active users
      return res.redirect('/petco/live-animal/allocations'); // Assuming allocation page exists
    } catch (error) {
      // Log the error
      console.error('Error:', error.message);
      // Pass errors to the template or handle them as needed
      // For now, let's just render a basic error page with the errors array
      res.render('login', { errors });
    }
});

exports.log_out_get = asyncHandler(async (req, res, next) => {
    req.session.destroy();
    res.redirect("/petco/live-animal/login");

});

  // Render the change password page GET
exports.change_password_get = asyncHandler(async (req, res, next) => {
    const user = req.session.user;

    if (user.status === "temporary") {
        permissions = {changePassword: true};
    }

    res.render("change_password", { 
        title: "Petco Live Animal Website", 
        currentPage: "change-password", 
        user: user,
        menuOptions: permissions
    });
});

// Handle change password POST request
exports.change_password_post = asyncHandler(async (req, res, next) => {
    const { old_password, new_password, confirm_password } = req.body;
    const user = req.session.user;

    try {
        if (user.status === 'active') {
            // Check if old password matches the password in the database
            const isMatch = await bcrypt.compare(old_password, user.password);
            if (!isMatch) {
                throw new Error('Password is incorrect');
            }
        } 
            
        if (new_password !== confirm_password) {
            throw new Error('New password and confirm password do not match');
        }

        if (!(user.status === 'active' || user.status === 'temporary')) {
            throw new Error('Invalid user status');
        }
       
        // Encrypt the new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update user information in the database
        const updatedUser = await db.users.update(
            {
                status: 'active',
                password: hashedPassword,
                login_attempts: 0,
                blocked: false,
                change_date: new Date().toISOString()
            },
            {
                where: { user_id: user.user_id },
                returning: true, // Ensure Sequelize returns the updated user
                plain: true // Ensure Sequelize returns plain object instead of an array
            }
        );

        if (updatedUser) {
            // Redirect to some page indicating successful password change   
            const userChange = await db.users.findOne({where: {user_id: req.session.user.user_id}});

            req.session.user = userChange;

            res.redirect('/petco/live-animal/allocations/');
        } else {
            throw new Error('Failed to update user information');
        }
    } catch (error) {
        console.error('Error:', error.message);
        // Handle errors appropriately, such as rendering the change password page with error messages
        if (user.status === "temporary") {
            permissions = {changePassword: true};
        }
    }
});

exports.reset_password_get = asyncHandler(async (req, res, next) => {

    try {
        await db.users.update(
            { status: 'temporary',
              blocked: false,
              login_attempts: 0,
              change_date: new Date().toISOString()
            },
            { where: { user_id: req.params.id } }
        );

        res.redirect('/petco/live-animal/users/')
    } catch (error) {
        // Handle errors
        console.error('Error resetting password:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

