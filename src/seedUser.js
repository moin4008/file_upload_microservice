const bcrypt = require('bcryptjs');
const User = require('./models/User');
const sequelize = require('../sequelize.config');

async function seed() {
  await sequelize.authenticate();
  const hashed = await bcrypt.hash('password123', 10);
  const [user, created] = await User.findOrCreate({
    where: { email: 'test@example.com' },
    defaults: { password: hashed }
  });
  console.log(`User created: ${user.email}`);
  process.exit(0);
}

seed();
