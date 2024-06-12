const { Sequelize } = require('sequelize');
const initModels = require('../models/init-models'); 

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '/home/gbro92103/db/alloc.db'
});

const db = {};

// Initialize models and associations
const models = initModels(sequelize);

// Add models to the db object
Object.keys(models).forEach((modelName) => {
  db[modelName] = models[modelName];
});

// Add sequelize instance to the db object
db.sequelize = sequelize;

db.Sequelize = Sequelize;
db.Op = Sequelize.Op;

module.exports = db;