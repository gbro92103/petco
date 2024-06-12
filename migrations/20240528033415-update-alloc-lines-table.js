'use strict';

/** @type {import('sequelize-cli').Migration} */
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('alloc_lines', 'act_alloc_qty', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
  
      await queryInterface.addColumn('alloc_lines', 'act_vend_id', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('alloc_lines', 'act_alloc_qty');
      await queryInterface.removeColumn('alloc_lines', 'act_vend_id');
    }
  };
