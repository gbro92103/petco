'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    // Rename param_id to alloc_param_id
    await queryInterface.renameColumn('alloc_params', 'param_id', 'alloc_param_id');

    await queryInterface.addColumn('alloc_params', 'avg_weekly_sold_per_store', {
      type: Sequelize.REAL,
      allowNull: false
    });

    // Delete the field est_weekly_sales
    await queryInterface.removeColumn('alloc_params', 'est_weekly_sales');

    // Delete the field est_store_count
    await queryInterface.removeColumn('alloc_params', 'est_store_count');

    // Add the field alloc_method with specific allowed values and NOT NULL
    await queryInterface.addColumn('alloc_params', 'alloc_method', {
      type: Sequelize.ENUM('Target WOS', 'Target Qty', 'Ignore QOH/Target Qty'),
      allowNull: false
    });

    // Add specific allowed values to the field main_sales_method with NOT NULL
    await queryInterface.changeColumn('alloc_params', 'main_sales_method', {
      type: Sequelize.ENUM('LY Sold', 'CY Sold', 'SC Factor', 'Sku Factor'),
      allowNull: false
    });

    // Rename alloc_vend_id to override_vend_id
    await queryInterface.renameColumn('alloc_params', 'alloc_vend_id', 'override_vend_id');

    // Change constraints to NOT NULL for specified fields
    await queryInterface.changeColumn('alloc_params', 'alloc_param_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    });
    await queryInterface.changeColumn('alloc_params', 'alloc_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.changeColumn('alloc_params', 'sku_nbr', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.changeColumn('alloc_params', 'eoq', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },
  
  async down (queryInterface, Sequelize) {
    // Reverse the changes

    // Rename alloc_param_id back to param_id
    await queryInterface.renameColumn('alloc_params', 'alloc_param_id', 'param_id');

    // Remove avg_weekly_sales_per_store
    await queryInterface.removeColumn('alloc_params', 'avg_weekly_sales_per_store');

    // Add est_weekly_sales back with type INTEGER
    await queryInterface.addColumn('alloc_params', 'est_weekly_sales', {
      type: Sequelize.INTEGER
    });

    // Add the field est_store_count
    await queryInterface.addColumn('alloc_params', 'est_store_count', {
      type: Sequelize.INTEGER
    });

    // Remove the field alloc_method
    await queryInterface.removeColumn('alloc_params', 'alloc_method');

    // Change main_sales_method back to TEXT
    await queryInterface.changeColumn('alloc_params', 'main_sales_method', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    // Rename override_vend_id back to alloc_vend_id
    await queryInterface.renameColumn('alloc_params', 'override_vend_id', 'alloc_vend_id');

    // Remove NOT NULL constraints for specified fields
    await queryInterface.changeColumn('alloc_params', 'param_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      autoIncrement: true,
      primaryKey: true
    });
    await queryInterface.changeColumn('alloc_params', 'alloc_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.changeColumn('alloc_params', 'sku_nbr', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.changeColumn('alloc_params', 'eoq', {
      type: Sequelize.INTEGER,
      allowNull: true  
    });
  } 
};

