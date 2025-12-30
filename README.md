# Savvy Wallet Backend API

Express.js + MongoDB + TypeScript backend for the MoneyFlow personal finance application.

## Tech Stack
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication (Access + Refresh Tokens)
- bcrypt for password hashing

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/moneyflow
   JWT_ACCESS_SECRET=your-access-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```
4. Run development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Transactions
- `GET /api/v1/transactions` - Get all transactions (with filters & pagination)
- `GET /api/v1/transactions/:id` - Get single transaction
- `POST /api/v1/transactions` - Create transaction
- `PUT /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get single category
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Loans
- `GET /api/v1/loans` - Get all loans (with filters & pagination)
- `GET /api/v1/loans/:id` - Get single loan
- `POST /api/v1/loans` - Create loan
- `PUT /api/v1/loans/:id` - Update loan
- `DELETE /api/v1/loans/:id` - Delete loan
- `POST /api/v1/loans/:id/payments` - Add loan payment
- `DELETE /api/v1/loans/:id/payments/:paymentId` - Delete loan payment

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## Project Structure
```
src/
├── config/
│   └── db.ts
├── controllers/
│   ├── authController.ts
│   ├── transactionController.ts
│   ├── categoryController.ts
│   └── loanController.ts
├── middlewares/
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validate.ts
├── models/
│   ├── User.ts
│   ├── Transaction.ts
│   ├── Category.ts
│   └── Loan.ts
├── routes/
│   ├── authRoutes.ts
│   ├── transactionRoutes.ts
│   ├── categoryRoutes.ts
│   └── loanRoutes.ts
├── utils/
│   ├── jwt.ts
│   └── seedCategories.ts
├── types/
│   └── index.ts
└── server.ts
```
