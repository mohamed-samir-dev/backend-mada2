require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const products = require('./data/office-chairs.json');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  await Product.create(products);
  console.log(`${products.length} office chairs seeded successfully`);
  process.exit(0);
};

seed().catch(err => { console.error(err.message); process.exit(1); });
