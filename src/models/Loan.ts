import mongoose, { Schema } from 'mongoose';
import { ILoan, ILoanPayment } from '../types';

const loanPaymentSchema = new Schema<ILoanPayment>(
  {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
  },
  { _id: true }
);

const loanSchema = new Schema<ILoan>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: [true, 'Loan type is required'],
      enum: ['given', 'received'],
    },
    personName: {
      type: String,
      required: [true, 'Person/Entity name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    principalAmount: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    interestRate: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'paid', 'overdue'],
      default: 'active',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    payments: [loanPaymentSchema],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ userId: 1, type: 1 });
loanSchema.index({ userId: 1, dueDate: 1 });

export default mongoose.model<ILoan>('Loan', loanSchema);
