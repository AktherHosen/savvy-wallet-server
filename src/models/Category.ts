import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>(
  {
    userId: {
      type: String,
      ref: 'User',
      default: null, // null for default categories
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Icon is required'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'],
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: ['income', 'expense'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user categories
categorySchema.index({ userId: 1, type: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
