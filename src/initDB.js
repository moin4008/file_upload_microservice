const sequelize = require('../sequelize.config');
const User = require('./models/User');
const File = require('./models/File');

async function init() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });  // use alter:true for dev; in prod use migrations
    console.log('Models synced');
    process.exit(0);
  } catch (err) {
    console.error('DB error:', err);
    process.exit(1);
  }
}

init();
