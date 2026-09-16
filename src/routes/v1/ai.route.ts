import { Router } from 'express';
import {
  scanFoodPhoto,
  scanReceiptPhoto,
  parseNLLog,
  getMealRecommendations,
  chatWithAssistant,
} from '../../controllers/ai.controller';
import { authenticate } from '../../middlewares/auth';
import { checkQuota } from '../../middlewares/quota';

const router = Router();
router.use(authenticate);

router.post('/scan-food', checkQuota('food_scan'), scanFoodPhoto);
router.post('/scan-receipt', scanReceiptPhoto);
router.post('/parse-log', parseNLLog);
router.get('/recommendations/meals', checkQuota('meal_recommendation'), getMealRecommendations);
router.post('/chat', checkQuota('ai_chat'), chatWithAssistant);

export default router;
