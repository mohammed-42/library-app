const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/userModel');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Delete existing admin
  await User.deleteOne({ email: 'admin@library.com' });
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@library.com',
    password: hashedPassword,
    role: 'admin'
  });

  console.log('✅ Admin created!');
  console.log('Email: admin@library.com');
  console.log('Password: admin123');
  process.exit();
};

createAdmin();