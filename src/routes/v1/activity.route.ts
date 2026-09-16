import { Router } from 'express';
import { getActivities, logActivity, getExerciseLibrary } from '../../controllers/activity.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', getActivities);
router.post('/', logActivity);
router.get('/exercises', getExerciseLibrary);

export default router;
