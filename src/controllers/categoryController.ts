import { Response } from 'express';
import { body } from 'express-validator';
import Category from '../models/Category';
import { AuthRequest } from '../types';

// Validation rules
export const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }),
  body('icon').notEmpty().withMessage('Icon is required'),
  body('color').matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Valid hex color is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
];

export const updateCategoryValidation = [
  body('name').optional().trim().isLength({ max: 50 }),
  body('icon').optional().notEmpty(),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  body('type').optional().isIn(['income', 'expense']),
];

// Get all categories (default + user's custom)
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const categories = await Category.find({
      $or: [{ isDefault: true }, { userId }],
    }).sort({ isDefault: -1, name: 1 }).lean();

    const formattedCategories = categories.map(c => ({
      id: c._id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
      isDefault: c.isDefault,
    }));

    res.json(formattedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single category
export const getCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const category = await Category.findOne({
      _id: id,
      $or: [{ isDefault: true }, { userId }],
    }).lean();

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({
      id: category._id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      isDefault: category.isDefault,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create category
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { name, icon, color, type } = req.body;

    const category = await Category.create({
      userId,
      name,
      icon,
      color,
      type,
      isDefault: false,
    });

    res.status(201).json({
      id: category._id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      isDefault: category.isDefault,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (only user's own categories)
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const updates = req.body;

    // Can't update default categories
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (existingCategory.isDefault) {
      res.status(403).json({ message: 'Cannot modify default categories' });
      return;
    }

    if (existingCategory.userId?.toString() !== userId?.toString()) {
      res.status(403).json({ message: 'Not authorized to modify this category' });
      return;
    }

    const category = await Category.findByIdAndUpdate(id, updates, { new: true }).lean();

    res.json({
      id: category!._id,
      name: category!.name,
      icon: category!.icon,
      color: category!.color,
      type: category!.type,
      isDefault: category!.isDefault,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (only user's own categories)
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (category.isDefault) {
      res.status(403).json({ message: 'Cannot delete default categories' });
      return;
    }

    if (category.userId?.toString() !== userId?.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this category' });
      return;
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
