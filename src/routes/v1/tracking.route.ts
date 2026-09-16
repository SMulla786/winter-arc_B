import { Router } from 'express';
import { logWater, getDailyWater, logWeight, getWeightHistory } from '../../controllers/tracking.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

router.post('/water', logWater);
router.get('/water/daily', getDailyWater);
router.post('/weight', logWeight);
router.get('/weight/history', getWeightHistory);

export default router;
