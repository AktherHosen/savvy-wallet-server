import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';

dotenv.config();

const defaultCategories = [
  // Expense categories
  { name: 'Food & Dining', icon: 'Utensils', color: '#FF6B6B', type: 'expense', isDefault: true },
  { name: 'Transportation', icon: 'Car', color: '#4ECDC4', type: 'expense', isDefault: true },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#45B7D1', type: 'expense', isDefault: true },
  { name: 'Entertainment', icon: 'Film', color: '#96CEB4', type: 'expense', isDefault: true },
  { name: 'Bills & Utilities', icon: 'FileText', color: '#FFEAA7', type: 'expense', isDefault: true },
  { name: 'Healthcare', icon: 'Heart', color: '#DDA0DD', type: 'expense', isDefault: true },
  { name: 'Education', icon: 'BookOpen', color: '#98D8C8', type: 'expense', isDefault: true },
  { name: 'Rent', icon: 'Home', color: '#F7DC6F', type: 'expense', isDefault: true },
  { name: 'Insurance', icon: 'Shield', color: '#BB8FCE', type: 'expense', isDefault: true },
  { name: 'Personal Care', icon: 'Smile', color: '#F8B500', type: 'expense', isDefault: true },
  { name: 'Loan Given', icon: 'HandCoins', color: '#5DADE2', type: 'expense', isDefault: true },
  
  // Income categories
  { name: 'Salary', icon: 'Briefcase', color: '#2ECC71', type: 'income', isDefault: true },
  { name: 'Freelance', icon: 'Laptop', color: '#3498DB', type: 'income', isDefault: true },
  { name: 'Investments', icon: 'TrendingUp', color: '#9B59B6', type: 'income', isDefault: true },
  { name: 'Business', icon: 'Building', color: '#1ABC9C', type: 'income', isDefault: true },
  { name: 'Rental Income', icon: 'Key', color: '#E74C3C', type: 'income', isDefault: true },
  { name: 'Loan Received', icon: 'Landmark', color: '#F39C12', type: 'income', isDefault: true },
  { name: 'Other Income', icon: 'Plus', color: '#95A5A6', type: 'income', isDefault: true },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Check if default categories exist
    const existingCount = await Category.countDocuments({ isDefault: true });
    
    if (existingCount > 0) {
      console.log('Default categories already exist. Skipping seed.');
      process.exit(0);
    }

    // Insert default categories
    await Category.insertMany(defaultCategories);
    console.log('Default categories seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
