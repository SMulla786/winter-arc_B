import { Router } from 'express';
import { getActivities, logActivity, logWorkoutSession, getExerciseLibrary } from '../../controllers/activity.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', getActivities);
router.post('/', logActivity);
router.post('/workout-session', logWorkoutSession);
router.get('/exercises', getExerciseLibrary);

export default router;
