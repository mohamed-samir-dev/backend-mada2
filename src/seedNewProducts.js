require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'خزانة إلكترونية بمفتاح رقمي 59كج',
    sku: 'MBA15-H6-420',
    price: 821,
    oldPrice: 1084,
    discount: 25,
    category: 'decor',
    brand: 'Last Home',
    stock: 10,
    color: 'أبيض',
    description: `حافظ على الأشياء الثمينة الخاصة بك في خزنة المجوهرات الآمنة هذه.

مصنوعة من الفولاذ المقاوم للصدأ عالي الجودة، هذه الخزنة المستطيلة ضرورية للغاية، هي اختيار مثالي للمنزل أو المكتب.

تأتي مع مفتاحين يعملان على تشغيلها يدويًا ويسمحان بفتحها بسرعة عند الحاجة.

مزودة ببساط أرضي واقٍ لتحافظ على ما بداخلها في مكانه بشكل آمن.

تجعل الفتحات المثقوبة مسبقًا عملية تثبيت الخزنة أمرًا سهلاً وسريعًا.

الخامة الرئيسية: معدن - ستانليس ستيل
اللون: أبيض
الضمان: ضد عيوب الشحن والتصنيع
تعليمات العناية: تنظيف بالمسح
يحتاج تركيب: لا`,
    images: ['https://res.cloudinary.com/dv6fig2ci/image/upload/v1782264324/Screenshot_2026-06-24_042329_p8jody.png'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'دولاب ملابس 4 باب 54-150-200 سم',
    sku: 'MBA30-DF1',
    price: 851,
    oldPrice: 1132,
    discount: 25,
    category: 'bedroom',
    brand: 'Last Home',
    stock: 0,
    color: 'أبيض',
    description: `جدّدي مظهر غرفة نومك باختيار هذه الخزانة الفاخرة للملابس.

دولاب ملابس أبيض مودرن، يتميز بتصميم عصري وأنيق يناسب أي غرفة نوم، مع تقسيمات داخلية ذكية تجعل تنظيم الملابس أكثر سهولة وراحة.

المواصفات:
الارتفاع: 200 سم | العرض: 150 سم | العمق: 54 سم
الخامة: خشب
عدد الأبواب: 4 أبواب
الضمان: ضد عيوب الشحن والتوصيل
تعليمات العناية: التنظيف بالمسح
يحتاج إلى تركيب: نعم`,
    images: ['https://res.cloudinary.com/dv6fig2ci/image/upload/v1782264313/Screenshot_2026-06-24_042343_ja7un9.png'],
    isFeatured: false,
    isBestSeller: false,
  },
  {
    name: 'دولاب ملابس أبيض 4 باب 200-54-160 سم',
    sku: 'MBA30-Y112 WHITE',
    price: 949,
    oldPrice: 1253,
    discount: 25,
    category: 'bedroom',
    brand: 'Last Home',
    stock: 0,
    color: 'أبيض',
    description: `حقّقي الاستفادة القصوى من مساحة تخزينك.

تسوق دولاب ابيض من متجر لاست هوم للأثاث بأفضل سعر في السعودية! مصنوع من خشب MDF عالي الجودة مع مرايا عاكسة وأدراج واسعة.

المواصفات:
الارتفاع: 200 سم | العرض: 160 سم | العمق: 54 سم
الخامة: خشب MDF عالي الجودة
نوع الزجاج: زجاج عاكس
التشطيبات: تشطيب لامع
عدد الأبواب: 4 أبواب
الضمان: ضد عيوب الشحن والتوصيل
مدة التوصيل: 3-5 أيام عمل
يحتاج إلى تركيب: نعم`,
    images: ['https://res.cloudinary.com/dv6fig2ci/image/upload/v1782264307/Screenshot_2026-06-24_042337_pri6uf.png'],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'دفاية كهربائية ديكور بلوتوث 150 سم',
    sku: 'MBA32-1002',
    price: 1618,
    oldPrice: 2152,
    discount: 25,
    category: 'decor',
    brand: 'Last Home',
    stock: 10,
    description: `ستضيف هذه المدفأة شيئًا من الأناقة إلى منزلك. مثالي لغرفة العائلة أو غرفة النوم أو أي مكان تحتاج فيه إلى حرارة وأجواء إضافية.

المواصفات:
المقاس: 150 سم
تحكم بلوتوث
عدد القطع: 1
يتطلب عملية تركيب: نعم
تعليمات العناية: تنظيف بالمسح
الضمان: ضد عيوب الشحن والتوصيل`,
    images: ['https://res.cloudinary.com/dv6fig2ci/image/upload/v1782264310/Screenshot_2026-06-24_042350_chvfl0.png'],
    isFeatured: true,
    isBestSeller: false,
  },
  {
    name: 'فواحة بخار ديكور 105×24 سم – إضاءة ملونة وبخار ناعم',
    sku: 'MBA25-BR-EF10N',
    price: 2172,
    oldPrice: 2888,
    discount: 25,
    category: 'decor',
    brand: 'Last Home',
    stock: 10,
    description: `أضف الدفء والفخامة لغرفتك مع هذه المدفأة العصرية.

فواحة بخار ديكور تجمع بين التصميم الجمالي والوظيفة العملية. تعمل بتقنية بخار ناعم لتعطير المكان باستخدام الزيوت العطرية المفضلة لديك، مع إضاءة LED متعددة الألوان.

المقاسات: الطول 105 سم × العرض 24 سم × الارتفاع 20 سم

المميزات:
- تصميم عصري وأنيق مع إضاءة LED متعددة الألوان
- بخار ناعم لتعطير المكان بلطف
- هادئة أثناء التشغيل وموفرة للطاقة
- خفيفة الوزن وسهلة النقل
- مناسبة لغرف النوم والمكاتب وغرف المعيشة`,
    images: ['https://res.cloudinary.com/dv6fig2ci/image/upload/v1782264312/Screenshot_2026-06-24_042356_ry9eeg.png'],
    isFeatured: true,
    isBestSeller: true,
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const product of products) {
      await Product.deleteOne({ sku: product.sku });
      await Product.create(product);
      console.log('✅ Added:', product.name);
    }

    console.log(`\nDone! Added ${products.length} products.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

run();
