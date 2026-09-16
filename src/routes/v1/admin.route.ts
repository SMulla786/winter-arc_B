import { Router } from 'express';
import { getAdminStats, getUsersList, toggleUserStatus } from '../../controllers/admin.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsersList);
router.patch('/users/:userId/toggle-status', toggleUserStatus);

export default router;
