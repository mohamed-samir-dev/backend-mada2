require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Admin = require('./models/Admin');

const products = [
  // غرفة المعيشة
  {
    name: 'طقم كنب كلاسيكي 7 مقاعد',
    description: 'طقم كنب فاخر:\n- قماش مخملي عالي الجودة\n- هيكل خشب زان متين\n- مريح للجلوس الطويل\n- مناسب للمجالس الكبيرة',
    shortDescription: 'طقم كنب مخملي 7 مقاعد بتصميم كلاسيكي فاخر',
    price: 4200,
    oldPrice: 5500,
    category: 'living_room',
    brand: 'هوملي',
    stock: 8,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'أريكة زاوية L-Shape مودرن',
    description: 'أريكة زاوية عصرية:\n- جلد صناعي فاخر\n- قابلة للتحويل لسرير\n- ألوان متعددة\n- مقاس 280×160 سم',
    shortDescription: 'أريكة زاوية عصرية بجلد فاخر قابلة للتحويل',
    price: 3800,
    oldPrice: 4800,
    category: 'living_room',
    brand: 'موديرنا',
    stock: 5,
    images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800'],
    isFeatured: true,
    isBestSeller: false,
  },
  {
    name: 'طاولة قهوة زجاجية ذهبية',
    description: 'طاولة قهوة أنيقة:\n- زجاج مقوى 10 مم\n- قوائم معدن ذهبي\n- تصميم عصري\n- المقاس: 120×60×45 سم',
    shortDescription: 'طاولة قهوة زجاجية بقوائم ذهبية أنيقة',
    price: 950,
    oldPrice: 1200,
    category: 'living_room',
    brand: 'جولد لاين',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
    isFeatured: false,
    isBestSeller: true,
  },
  {
    name: 'وحدة تلفزيون خشب بلوط',
    description: 'وحدة تلفزيون عصرية:\n- خشب بلوط طبيعي\n- 4 أدراج تخزين\n- مناسبة لشاشات حتى 75 بوصة\n- المقاس: 180×40×55 سم',
    shortDescription: 'وحدة تلفزيون من خشب البلوط الطبيعي',
    price: 1850,
    category: 'living_room',
    brand: 'ناتشر وود',
    stock: 10,
    images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?w=800'],
    isFeatured: true,
    isBestSeller: false,
  },

  // غرفة النوم
  {
    name: 'سرير ملكي مع لوح رأس منجد',
    description: 'سرير فاخر:\n- لوح رأس منجد بالمخمل\n- هيكل خشب صلب\n- قاعدة صندوق تخزين\n- مقاس 200×180 سم (كينج)',
    shortDescription: 'سرير ملكي بلوح رأس منجد وقاعدة تخزين',
    price: 5500,
    oldPrice: 7000,
    category: 'bedroom',
    brand: 'رويال سليب',
    stock: 6,
    images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'مرتبة فوم طبي 5 طبقات',
    description: 'مرتبة طبية فاخرة:\n- 5 طبقات فوم طبي\n- تدعم العمود الفقري\n- غطاء قماش قابل للغسيل\n- مقاس 200×180 سم\n- ضمان 5 سنوات',
    shortDescription: 'مرتبة طبية 5 طبقات بضمان 5 سنوات',
    price: 2800,
    oldPrice: 3500,
    category: 'bedroom',
    brand: 'ميدي سليب',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
    isFeatured: false,
    isBestSeller: true,
  },
  {
    name: 'غرفة نوم كاملة 6 قطع',
    description: 'طقم غرفة نوم متكامل:\n- سرير كينج 200×180\n- دولاب 6 أبواب مع مرايا\n- تسريحة مع مرآة\n- كومودينو × 2\n- خشب MDF عالي الجودة',
    shortDescription: 'طقم غرفة نوم كامل 6 قطع بخشب MDF عالي الجودة',
    price: 9500,
    oldPrice: 13000,
    category: 'bedroom',
    brand: 'دريم هوم',
    stock: 4,
    images: ['https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'دولاب ملابس 4 أبواب مع مرايا',
    description: 'دولاب فاخر:\n- 4 أبواب مع مرايا كاملة\n- داخل منظم بأدراج وأقسام\n- لون أبيض مطفي\n- المقاس: 200×60×220 سم',
    shortDescription: 'دولاب 4 أبواب مع مرايا كاملة وتنظيم داخلي',
    price: 3200,
    category: 'bedroom',
    brand: 'كلوزيت برو',
    stock: 9,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    isFeatured: false,
    isBestSeller: false,
  },

  // غرفة الطعام
  {
    name: 'طاولة طعام خشب 8 أشخاص',
    description: 'طاولة طعام فاخرة:\n- خشب زان طبيعي\n- مقاس 200×100 سم\n- تحمل حتى 8 أشخاص\n- مناسبة للتجمعات العائلية',
    shortDescription: 'طاولة طعام خشب زان طبيعي لـ 8 أشخاص',
    price: 3400,
    oldPrice: 4200,
    category: 'dining',
    brand: 'وود ماستر',
    stock: 7,
    images: ['https://images.unsplash.com/photo-1617104678098-de229db51175?w=800'],
    isFeatured: true,
    isBestSeller: false,
  },
  {
    name: 'طقم كراسي طعام 6 قطع جلد',
    description: 'كراسي طعام فاخرة:\n- جلد صناعي عالي الجودة\n- هيكل معدني متين\n- سهلة التنظيف\n- ألوان متعددة',
    shortDescription: '6 كراسي طعام بجلد فاخر وهيكل معدني',
    price: 1800,
    oldPrice: 2400,
    category: 'dining',
    brand: 'شير لاين',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800'],
    isFeatured: false,
    isBestSeller: true,
  },
  {
    name: 'بوفيه غرفة طعام 4 أبواب',
    description: 'بوفيه أنيق:\n- 4 أبواب خشبية\n- رفوف زجاجية داخلية\n- خشب MDF\n- المقاس: 160×45×90 سم',
    shortDescription: 'بوفيه غرفة طعام 4 أبواب مع رفوف زجاجية',
    price: 2100,
    category: 'dining',
    brand: 'وود ماستر',
    stock: 8,
    images: ['https://images.unsplash.com/photo-1595514535215-9a8e0929e5cf?w=800'],
    isFeatured: false,
    isBestSeller: false,
  },

  // أثاث المكتب
  {
    name: 'مكتب عمل L-Shape خشبي',
    description: 'مكتب L-Shape احترافي:\n- خشب MDF مقاوم للخدش\n- فتحات لإدارة الكابلات\n- مساحة عمل واسعة\n- مناسب للعمل من المنزل',
    shortDescription: 'مكتب L-Shape خشبي واسع مع إدارة كابلات',
    price: 1650,
    oldPrice: 2100,
    category: 'office',
    brand: 'أوفيس برو',
    stock: 11,
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800'],
    isFeatured: true,
    isBestSeller: false,
  },
  {
    name: 'كرسي مكتبي Ergonomic',
    description: 'كرسي مكتبي طبي:\n- دعم قطني قابل للتعديل\n- مسند ذراع 4D\n- قاعدة ألومنيوم\n- حمل حتى 150 كغ\n- ضمان سنتين',
    shortDescription: 'كرسي مكتبي Ergonomic مع دعم قطني وضمان سنتين',
    price: 1900,
    oldPrice: 2500,
    category: 'office',
    brand: 'إيرجو شير',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'رف مكتبي 5 طوابق خشب',
    description: 'رف مكتبي عملي:\n- 5 طوابق تخزين\n- خشب صنوبر طبيعي\n- سهل التركيب\n- المقاس: 80×30×180 سم',
    shortDescription: 'رف مكتبي خشبي 5 طوابق سهل التركيب',
    price: 650,
    category: 'office',
    brand: 'شيلف كو',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800'],
    isFeatured: false,
    isBestSeller: false,
  },

  // أثاث خارجي
  {
    name: 'طقم جلسة حديقة راتان 5 قطع',
    description: 'طقم حديقة فاخر:\n- راتان صناعي مقاوم للعوامل الجوية\n- وسائد مقاومة للماء\n- طاولة زجاجية مضمنة\n- سهل التنظيف',
    shortDescription: 'طقم حديقة راتان 5 قطع مقاوم للعوامل الجوية',
    price: 3200,
    oldPrice: 4000,
    category: 'outdoor',
    brand: 'جاردين',
    stock: 6,
    images: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'أرجوحة معلقة مع حامل',
    description: 'أرجوحة فاخرة:\n- قماش قطني مريح\n- حامل حديد متين\n- تحمل حتى 200 كغ\n- مناسبة للداخل والخارج',
    shortDescription: 'أرجوحة معلقة مريحة مع حامل حديدي متين',
    price: 780,
    category: 'outdoor',
    brand: 'هانج إيزي',
    stock: 18,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    isFeatured: false,
    isBestSeller: false,
  },

  // ديكور وإكسسوارات
  {
    name: 'إطار صور جداري مجموعة 6 قطع',
    description: 'إطارات ديكورية:\n- 6 أحجام مختلفة\n- خشب طبيعي\n- زجاج مضاد للانعكاس\n- سهلة التركيب',
    shortDescription: '6 إطارات صور خشبية بأحجام مختلفة',
    price: 320,
    oldPrice: 420,
    category: 'decor',
    brand: 'فريم آرت',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800'],
    isFeatured: false,
    isBestSeller: true,
  },
  {
    name: 'سجادة فارسية 2×3 متر',
    description: 'سجادة فارسية فاخرة:\n- نقوش يدوية تقليدية\n- خيوط ألوان طبيعية\n- كثافة عالية\n- مقاس 200×300 سم',
    shortDescription: 'سجادة فارسية يدوية الصنع 2×3 متر',
    price: 2400,
    oldPrice: 3200,
    category: 'decor',
    brand: 'بيرشان',
    stock: 10,
    images: ['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'نبتة صناعية بأصيص فاخر',
    description: 'ديكور نباتي:\n- نبتة صناعية واقعية\n- أصيص سيراميك فاخر\n- لا تحتاج رعاية\n- ارتفاع 120 سم',
    shortDescription: 'نبتة صناعية واقعية في أصيص سيراميك فاخر',
    price: 280,
    category: 'decor',
    brand: 'جرين ديكور',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'],
    isFeatured: false,
    isBestSeller: false,
  },

  // بكجات وعروض خاصة
  {
    name: 'بكج غرفة معيشة كاملة',
    description: 'باقة غرفة معيشة متكاملة تشمل:\n- طقم كنب 7 مقاعد\n- طاولة قهوة زجاجية\n- وحدة تلفزيون خشبية\n- سجادة 2×3 م\n- توصيل وتركيب مجاني',
    shortDescription: 'باقة متكاملة لغرفة معيشة فاخرة مع تركيب مجاني',
    price: 8500,
    oldPrice: 12000,
    category: 'packages',
    brand: 'هوملي',
    stock: 5,
    images: ['https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'بكج غرفة نوم سوبر كينج',
    description: 'باقة نوم فاخرة تشمل:\n- سرير سوبر كينج 200×200\n- مرتبة طبية 5 طبقات\n- دولاب 6 أبواب\n- كومودينو × 2\n- توصيل وتركيب مجاني',
    shortDescription: 'باقة غرفة نوم سوبر كينج كاملة مع تركيب مجاني',
    price: 14500,
    oldPrice: 20000,
    category: 'packages',
    brand: 'هوملي',
    stock: 3,
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
    isFeatured: true,
    isBestSeller: false,
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared old products');

    // Ensure admin exists
    const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existing) {
      await Admin.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
      console.log(`👤 Admin created: ${process.env.ADMIN_EMAIL}`);
    }

    await Product.create(products);
    console.log(`✅ Inserted ${products.length} furniture products`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
