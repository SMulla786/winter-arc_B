import { Router } from 'express';
import { getExpenses, createExpense, deleteExpense } from '../../controllers/expense.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

export default router;
