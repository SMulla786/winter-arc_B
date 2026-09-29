import { Router } from 'express';
import { getProfile, updateProfile, getTargets } from '../../controllers/profile.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/targets', getTargets);

export default router;

