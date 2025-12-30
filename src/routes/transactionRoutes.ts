import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createTransactionValidation,
  updateTransactionValidation,
} from '../controllers/transactionController';

const router = Router();

router.use(protect);

router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', validate(createTransactionValidation), createTransaction);
router.put('/:id', validate(updateTransactionValidation), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
