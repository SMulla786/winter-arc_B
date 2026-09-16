import { Router } from 'express';
import { getDailyMeals, createMeal, deleteMeal } from '../../controllers/meal.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/daily', getDailyMeals);
router.post('/', createMeal);
router.delete('/:id', deleteMeal);

export default router;
