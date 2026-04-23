require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN = {
  name: 'Admin',
  email: 'admin@loanapp.com',
  password: 'Admin@123',
  role: 'admin',
};

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`Admin user already exists: ${ADMIN.email}`);
    await mongoose.disconnect();
    return;
  }

  await User.create(ADMIN);
  console.log('✓ Admin user created successfully');
  console.log(`  Email   : ${ADMIN.email}`);
  console.log(`  Password: ${ADMIN.password}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
