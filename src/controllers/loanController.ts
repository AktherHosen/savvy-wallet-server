import { Response } from 'express';
import { body } from 'express-validator';
import Loan from '../models/Loan';
import { AuthRequest, ILoan } from '../types';

// Validation rules
export const createLoanValidation = [
  body('type').isIn(['given', 'received']).withMessage('Type must be given or received'),
  body('personName').trim().notEmpty().withMessage('Person/Entity name is required').isLength({ max: 100 }),
  body('principalAmount').isFloat({ min: 0.01 }).withMessage('Principal amount must be greater than 0'),
  body('interestRate').isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('description').optional().trim().isLength({ max: 500 }),
];

export const addPaymentValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
  body('date').isISO8601().withMessage('Valid date is required'),
];

// Helper to calculate balance
const calculateBalance = (loan: ILoan): number => {
  const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
  const monthsElapsed = Math.max(0,
    (new Date().getFullYear() - new Date(loan.startDate).getFullYear()) * 12 +
    (new Date().getMonth() - new Date(loan.startDate).getMonth())
  );
  const interest = (loan.principalAmount * loan.interestRate * monthsElapsed) / (12 * 100);
  return loan.principalAmount + interest - totalPaid;
};

// Get all loans
export const getLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { type, status, page = 1, limit = 20 } = req.query;

    const filter: Record<string, unknown> = { userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [loans, total] = await Promise.all([
      Loan.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Loan.countDocuments(filter),
    ]);

    const formattedLoans = loans.map(loan => ({
      id: loan._id,
      ...loan,
      payments: loan.payments.map(p => ({ id: p._id, ...p })),
    }));

    res.json({
      data: formattedLoans,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single loan
export const getLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const loan = await Loan.findOne({ _id: id, userId }).lean();

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    res.json({
      id: loan._id,
      ...loan,
      payments: loan.payments.map(p => ({ id: p._id, ...p })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create loan
export const createLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { type, personName, principalAmount, interestRate, startDate, dueDate, description } = req.body;

    const now = new Date();
    const dueDateObj = new Date(dueDate);
    const status = dueDateObj < now ? 'overdue' : 'active';

    const loan = await Loan.create({
      userId,
      type,
      personName,
      principalAmount,
      interestRate,
      startDate: new Date(startDate),
      dueDate: dueDateObj,
      status,
      description,
      payments: [],
    });

    res.status(201).json({
      id: loan._id,
      ...loan.toObject(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update loan
export const updateLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const updates = req.body;

    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

    const loan = await Loan.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    ).lean();

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    res.json({
      id: loan._id,
      ...loan,
      payments: loan.payments.map(p => ({ id: p._id, ...p })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete loan
export const deleteLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const loan = await Loan.findOneAndDelete({ _id: id, userId });

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add payment
export const addPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { amount, date } = req.body;

    const loan = await Loan.findOne({ _id: id, userId });

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    loan.payments.push({ amount, date: new Date(date) } as any);

    // Update status based on payments
    const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid >= loan.principalAmount) {
      loan.status = 'paid';
    } else if (new Date(loan.dueDate) < new Date()) {
      loan.status = 'overdue';
    } else {
      loan.status = 'active';
    }

    await loan.save();

    res.json({
      id: loan._id,
      ...loan.toObject(),
      payments: loan.payments.map(p => ({ id: p._id, ...p })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete payment
export const deletePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id, paymentId } = req.params;

    const loan = await Loan.findOne({ _id: id, userId });

    if (!loan) {
      res.status(404).json({ message: 'Loan not found' });
      return;
    }

    loan.payments = loan.payments.filter(p => p._id.toString() !== paymentId);

    // Update status
    const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid >= loan.principalAmount) {
      loan.status = 'paid';
    } else if (new Date(loan.dueDate) < new Date()) {
      loan.status = 'overdue';
    } else {
      loan.status = 'active';
    }

    await loan.save();

    res.json({
      id: loan._id,
      ...loan.toObject(),
      payments: loan.payments.map(p => ({ id: p._id, ...p })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
