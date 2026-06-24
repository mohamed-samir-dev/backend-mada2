require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

jconst product = {
  name: 'مكتب بتصميم عصري عملي مع مساحة تخزين إضافية - 160 سم',
  sku: 'MBA37-5916#',
  customCode: 'MBA37-5916#',
  
  price: 1575,
  oldPrice: 2094,
  discount: 25,
  currency: 'SAR',

  category: 'أثاث مكتبي',
  stock: 50,

  isFeatured: true,
  isBestSeller: false,

  shortDescription: 'مكتب عصري عملي مع درج مدمج ومساحات تخزين إضافية يساعدك على تنظيم مكان العمل أو الدراسة بسهولة ✨',

  description: `مكتب عملي بتصميم عصري أنيق يوفر لك مساحة عمل مريحة ومنظمة سواء في المنزل أو المكتب 🏡

يأتي مزودًا بدرج مدمج لتخزين الأدوات المكتبية مثل الأقلام والأوراق والملفات، مما يساعدك على تقليل الفوضى والحفاظ على تنظيم المكان 📁

تصميمه يجمع بين العملية والأناقة ليضيف لمسة عصرية لأي مساحة عمل أو دراسة 📚

مثالي للاستخدام اليومي سواء للعمل أو الدراسة أو تنظيم الأجهزة والملفات بكل سهولة 💼`,

  specs: {
    desk: {
      front: '160 × 80 سم',
      side: '120 × 40 سم',
      height: '75 سم'
    }
  },

  features: [
    'درج مدمج لتخزين الأدوات المكتبية',
    'تصميم عصري مناسب للمكاتب المنزلية والتقليدية',
    'يوفر مساحة واسعة للعمل والدراسة',
    'خامات متينة وعمر استخدام طويل',
    'يساعد على تنظيم المكان وتقليل الفوضى'
  ],

  reviews: {
    rating: 0,
    count: 0
  },

  images: [
    'IMAGE_URL_1',
    'IMAGE_URL_2',
    'IMAGE_URL_3'
  ]
};
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteOne({ sku: product.sku });
    await Product.create(product);
    console.log('✅ Added:', product.name);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

run();
