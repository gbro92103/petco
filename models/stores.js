const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stores', {
    str_nbr: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    str_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    zone_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dist_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dt_opened: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dt_closed: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    rcac_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'rcac_id'
      }
    },
    cy_weeks_open: {
      type: DataTypes.VIRTUAL,
      get() {
        const dtOpened = this.getDataValue('dt_opened');
        if (!dtOpened) return 0; // Store not opened yet
        const dtOpenedDate = new Date(dtOpened); // Convert to JavaScript Date
        const dtClosed = this.getDataValue('dt_closed');
        const dtClosedDate = dtClosed ? new Date(dtClosed) : new Date(); // Convert to JavaScript Date or use current date if not closed
        const currentYear = new Date().getFullYear();
  
        const startOfYear = new Date(currentYear, 0, 1); // January 1 of the current year
        const endOfYear = new Date(currentYear, 11, 31); // December 31 of the current year
  
        let weeksOpen = 0;
  
        if (dtOpenedDate <= endOfYear) {
          const actualStart = dtOpenedDate > startOfYear ? dtOpenedDate : startOfYear;
          const actualEnd = dtClosedDate < endOfYear ? dtClosedDate : endOfYear;
  
          const diffInMillis = actualEnd - actualStart;
          weeksOpen = Math.floor(diffInMillis / (7 * 24 * 60 * 60 * 1000));
        }
  
        return weeksOpen;
      }
    },
    ly_weeks_open: {
      type: DataTypes.VIRTUAL,
      get() {
        const dtOpened = this.getDataValue('dt_opened');
        if (!dtOpened) return 0; // Store not opened yet
        const dtOpenedDate = new Date(dtOpened); // Convert to JavaScript Date
        const dtClosed = this.getDataValue('dt_closed');
        const dtClosedDate = dtClosed ? new Date(dtClosed) : new Date(); // Convert to JavaScript Date or use current date if not closed
        const lastYear = new Date().getFullYear() - 1;
  
        const startOfLastYear = new Date(lastYear, 0, 1); // January 1 of last year
        const endOfLastYear = new Date(lastYear, 11, 31); // December 31 of last year
  
        let weeksOpen = 0;
  
        if (dtOpenedDate <= endOfLastYear) {
          const actualStart = dtOpenedDate > startOfLastYear ? dtOpenedDate : startOfLastYear;
          const actualEnd = dtClosedDate < endOfLastYear ? dtClosedDate : endOfLastYear;
  
          const diffInMillis = actualEnd - actualStart;
          weeksOpen = Math.floor(diffInMillis / (7 * 24 * 60 * 60 * 1000));
        }
  
        return weeksOpen;
      }
    }  
  }, {
    sequelize,
    tableName: 'stores',
    timestamps: false
  });
};
