const mongoose = require('mongoose');
const slugify = require('slugify');

const ALLOWED_CATEGORIES = ['living_room', 'bedroom', 'dining', 'office', 'outdoor', 'decor', 'packages'];

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'اسم المنتج مطلوب'], trim: true },
  slug: { type: String, unique: true },
  description: { type: String, trim: true },
  price: { type: Number, required: [true, 'السعر مطلوب'], min: 0 },
  oldPrice: { type: Number, min: 0 },
  category: {
    type: String,
    required: [true, 'التصنيف مطلوب'],
    enum: { values: ALLOWED_CATEGORIES, message: 'تصنيف غير مسموح' }
  },
  brand: { type: String, trim: true },
  sku: { type: String, trim: true },
  discount: { type: Number, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  images: [String],
  badges: [String],
  delivery: { type: String, trim: true },
  deliveryTime: { type: String, trim: true },
  availability: { type: String, trim: true },
  warranty: { type: String, trim: true },
  customCode: { type: String, trim: true },
  currency: { type: String, trim: true },
  viewsToday: { type: Number, default: 0 },
  color: { type: String, trim: true },
  image: { type: String, trim: true },
  quantity: { type: Number, min: 0 },
  shortDescription: { type: String, trim: true },
  overview: { type: String, trim: true },
  features: [String],
  specs: { type: mongoose.Schema.Types.Mixed },
  careInstructions: [String],
  reviews: {
    rating: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const base = slugify(this.name, { lower: true, strict: true }) || Date.now().toString();
    this.slug = base + '-' + Date.now();
  }
  next();
});



// Indexes for performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
