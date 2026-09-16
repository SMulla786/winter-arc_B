import { Router } from 'express';
import { getExpenses, createExpense } from '../../controllers/expense.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', getExpenses);
router.post('/', createExpense);

export default router;
