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
import { uploadFoodPhoto, uploadReceiptPhoto } from '../../middlewares/upload';

const router = Router();
router.use(authenticate);

router.post('/scan-food', checkQuota('food_scan'), uploadFoodPhoto.single('image'), scanFoodPhoto);
router.post('/scan-receipt', uploadReceiptPhoto.single('image'), scanReceiptPhoto);
router.post('/parse-log', parseNLLog);
router.get('/recommendations/meals', checkQuota('meal_recommendation'), getMealRecommendations);
router.post('/chat', checkQuota('ai_chat'), chatWithAssistant);

export default router;
