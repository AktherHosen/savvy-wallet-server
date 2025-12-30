import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  createCategoryValidation,
  updateCategoryValidation,
} from '../controllers/categoryController';

const router = Router();

router.use(protect);

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', validate(createCategoryValidation), createCategory);
router.put('/:id', validate(updateCategoryValidation), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
