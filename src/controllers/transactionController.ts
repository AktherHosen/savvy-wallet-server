import { Response } from 'express';
import { body, query } from 'express-validator';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import { AuthRequest } from '../types';

// Validation rules
export const createTransactionValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 }),
  body('date').isISO8601().withMessage('Valid date is required'),
];

export const updateTransactionValidation = [
  body('amount').optional().isFloat({ min: 0.01 }),
  body('type').optional().isIn(['income', 'expense']),
  body('categoryId').optional().notEmpty(),
  body('description').optional().trim().isLength({ max: 500 }),
  body('date').optional().isISO8601(),
];

// Get all transactions with filtering and pagination
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter: Record<string, unknown> = { userId };

    if (type) filter.type = type;
    if (category) filter.categoryId = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) (filter.date as Record<string, Date>).$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    // Populate category information
    const categoryIds = [...new Set(transactions.map(t => t.categoryId))];
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const categoryMap = new Map(categories.map(c => [c._id.toString(), c]));

    const transactionsWithCategory = transactions.map(t => ({
      id: t._id,
      ...t,
      category: categoryMap.get(t.categoryId),
    }));

    res.json({
      data: transactionsWithCategory,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single transaction
export const getTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId }).lean();

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    const category = await Category.findById(transaction.categoryId).lean();

    res.json({
      id: transaction._id,
      ...transaction,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create transaction
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { amount, type, categoryId, description, date } = req.body;

    const transaction = await Transaction.create({
      userId,
      amount,
      type,
      categoryId,
      description,
      date: new Date(date),
    });

    const category = await Category.findById(categoryId).lean();

    res.status(201).json({
      id: transaction._id,
      ...transaction.toObject(),
      category,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update transaction
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const updates = req.body;

    if (updates.date) updates.date = new Date(updates.date);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    ).lean();

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    const category = await Category.findById(transaction.categoryId).lean();

    res.json({
      id: transaction._id,
      ...transaction,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete transaction
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
