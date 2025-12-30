import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  addPayment,
  deletePayment,
  createLoanValidation,
  addPaymentValidation,
} from '../controllers/loanController';

const router = Router();

router.use(protect);

router.get('/', getLoans);
router.get('/:id', getLoan);
router.post('/', validate(createLoanValidation), createLoan);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

// Payment routes
router.post('/:id/payments', validate(addPaymentValidation), addPayment);
router.delete('/:id/payments/:paymentId', deletePayment);

export default router;
