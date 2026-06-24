require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
{
  name: 'مرتبة غرفة نوم سيلفر',
  sku: 'BRM-Silver',
  price: 9002,
  currency: 'EGP',
  discount: 0,
  category: 'pillows_bedding',
  brand: 'Silver',
  stock: 15,

  description: `تُعرف مرتبة سيلفر ذات السوست المنفصلة بأنها مناسبة للأشخاص الذين يعانون من آلام الظهر أو الرقبة أو المفاصل.

الميزات:
- سوست منفصلة لدعم أفضل للجسم
- تقلل الضغط على العمود الفقري والمفاصل
- توفر راحة أثناء النوم لفترات طويلة
- تصميم مريح ومناسب لغرف النوم الحديثة
- مقاس: 120 × 195 سم

الاستايل: مودرن
`,

  images: 'https://res.cloudinary.com/dv6fig2ci/image/upload/v1782155087/google_drive_1skBgG_a4rm2u.jpg',

  isFeatured: true,
  isBestSeller: true,
  isNew: true
}

];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const product of products) {
      await Product.deleteOne({ name: product.name });
      await Product.create(product);
      console.log('✅ Added:', product.name);
    }

    console.log(`\nDone! Added ${products.length} home furniture products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

run();
