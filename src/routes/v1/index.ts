import { Router } from 'express';
import authRoute from './auth.route';
import profileRoute from './profile.route';
import mealRoute from './meal.route';
import expenseRoute from './expense.route';
import activityRoute from './activity.route';
import trackingRoute from './tracking.route';
import aiRoute from './ai.route';
import adminRoute from './admin.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/profile', profileRoute);
router.use('/meals', mealRoute);
router.use('/expenses', expenseRoute);
router.use('/activity', activityRoute);
router.use('/tracking', trackingRoute);
router.use('/ai', aiRoute);
router.use('/admin', adminRoute);

export default router;
