import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ITransaction extends Document {
  _id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  _id: string;
  userId?: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanPayment {
  _id: string;
  amount: number;
  date: Date;
}

export interface ILoan extends Document {
  _id: string;
  userId: string;
  type: 'given' | 'received';
  personName: string;
  principalAmount: number;
  interestRate: number;
  startDate: Date;
  dueDate: Date;
  status: 'active' | 'paid' | 'overdue';
  description?: string;
  payments: ILoanPayment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface TokenPayload {
  userId: string;
  email: string;
}
