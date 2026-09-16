import { Request, Response } from 'express';
import prisma from '../client';
import {
  analyzeFoodImage,
  analyzeReceipt,
  parseNaturalLanguageLog,
  generateMealRecommendations,
  chatWithAiCoach,
} from '../services/ai.service';

export const scanFoodPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 parameter is required.' });
      return;
    }

    const analysisResult = await analyzeFoodImage(imageBase64, mimeType);

    // Save to FoodAnalysis table
    await prisma.foodAnalysis.create({
      data: {
        userId,
        detectedItemsJson: analysisResult.items || [],
        estimatedCalories: analysisResult.estimatedCalories || 0,
        estimatedProteinG: analysisResult.estimatedProteinG || 0,
        estimatedCarbsG: analysisResult.estimatedCarbsG || 0,
        estimatedFatG: analysisResult.estimatedFatG || 0,
        confidence: analysisResult.confidence || 0.85,
      },
    });

    res.status(200).json({ analysis: analysisResult });
  } catch (error: any) {
    console.error('scanFoodPhoto controller error:', error);
    res.status(500).json({ error: error.message || 'Food scan failed.' });
  }
};

export const scanReceiptPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 is required.' });
      return;
    }

    const receiptResult = await analyzeReceipt(imageBase64, mimeType);

    res.status(200).json({ receipt: receiptResult });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Receipt scan failed.' });
  }
};

export const parseNLLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { textInput } = req.body;
    if (!textInput) {
      res.status(400).json({ error: 'textInput is required.' });
      return;
    }

    const parsedResult = await parseNaturalLanguageLog(textInput);
    res.status(200).json({ parsed: parsedResult });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to parse natural language input.' });
  }
};

export const getMealRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    // Fetch today's current totals
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const mealsToday = await prisma.meal.findMany({
      where: { userId, loggedAt: { gte: startOfDay } },
    });

    const caloriesConsumed = mealsToday.reduce((sum, m) => sum + m.totalCalories, 0);
    const proteinConsumed = mealsToday.reduce((sum, m) => sum + m.totalProteinG, 0);

    const targetCalories = 2000;
    const targetProtein = 80;

    const recommendations = await generateMealRecommendations({
      goal: profile?.goal || 'WEIGHT_LOSS',
      dietType: profile?.dietType || 'NON_VEGETARIAN',
      city: profile?.city || 'Mumbai',
      dailyBudget: profile?.dailyBudget || 300,
      remainingCalories: Math.max(0, targetCalories - caloriesConsumed),
      remainingProtein: Math.max(0, targetProtein - proteinConsumed),
    });

    res.status(200).json({ recommendations });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate meal recommendations.' });
  }
};

export const chatWithAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'message is required.' });
      return;
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const userSummary = `Goal: ${profile?.goal || 'Fitness'}, Diet: ${profile?.dietType || 'Standard'}, City: ${profile?.city || 'Local'}`;

    const reply = await chatWithAiCoach(message, userSummary);

    res.status(200).json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to complete AI chat request.' });
  }
};
