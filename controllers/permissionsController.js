// permissionsController.js

const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'permissions.json');

let permissionsData;

function loadPermissionsData() {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    permissionsData = JSON.parse(jsonData);
}

function getPermissionByName(userGroup, accessLevel) {
    // Ensure permissions data is loaded
    if (!permissionsData) {
        loadPermissionsData();
    }

    if (permissionsData.hasOwnProperty(userGroup)) {
        if (permissionsData[userGroup].permissions.hasOwnProperty(accessLevel)) {
            return permissionsData[userGroup].permissions[accessLevel];
        } else {
            throw new Error(`Access level '${accessLevel}' not found for user group '${userGroup}'`);
        }
    } else {
        throw new Error(`User group '${userGroup}' not found`);
    }
}

function getMenuOptions(userGroup) {
    // Ensure permissions data is loaded
    if (!permissionsData) {
        loadPermissionsData();
    }

    if (permissionsData.hasOwnProperty(userGroup) && permissionsData[userGroup].menu) {
        return permissionsData[userGroup].menu;
    } else {
        throw new Error(`Menu options not found for user group '${userGroup}'`);
    }
}

function getPermissions(userGroup) {
    // Ensure permissions data is loaded
    if (!permissionsData) {
        loadPermissionsData();
    }

    if (permissionsData.hasOwnProperty(userGroup) && permissionsData[userGroup].permissions) {
        return permissionsData[userGroup].permissions;
    } else {
        throw new Error(`Permission data not found for user group '${userGroup}'`);
    }
}

module.exports = {
    getPermissionByName,
    getPermissions,
    getMenuOptions
};
