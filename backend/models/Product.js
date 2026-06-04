import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [140, 'Product name cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (v) {
          // discountPrice, when set, must be below the regular price
          return v === 0 || v < this.price;
        },
        message: 'Discount price must be lower than the regular price',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: String,
      trim: true,
      default: 'Zyvora',
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one product image is required',
      },
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    featuredToHome: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index to support search across name / description / brand
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Virtual: effective selling price (discount when present, else price)
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice && this.discountPrice > 0
    ? this.discountPrice
    : this.price;
});

// Virtual: discount percentage (0 when no discount)
productSchema.virtual('discountPercent').get(function () {
  if (!this.discountPrice || this.discountPrice <= 0) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Generate a unique-ish slug from the name
productSchema.pre('validate', function (next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    const base = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    // Append a short suffix from the ObjectId to avoid collisions
    this.slug = `${base}-${this._id.toString().slice(-6)}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
