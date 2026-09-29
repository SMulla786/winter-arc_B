import { Request, Response } from 'express';
import fs from 'fs';
import prisma from '../client';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getUserIdFromReq } from '../utils/auth';
import {
  analyzeFoodImage,
  analyzeReceipt,
  parseNaturalLanguageLog,
  generateMealRecommendations,
  chatWithAiCoach,
} from '../services/ai.service';

export const scanFoodPhoto = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

  let imageBase64 = req.body.imageBase64;
  let mimeType = req.body.mimeType || 'image/jpeg';
  let imageUrl = '';
  let storagePath = '';

  if (req.file) {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    imageBase64 = fileBuffer.toString('base64');
    mimeType = req.file.mimetype;
    imageUrl = `/uploads/meals/${req.file.filename}`;
    storagePath = filePath;
  }

  if (!imageBase64) {
    throw new ApiError(400, 'An image file upload or imageBase64 parameter is required.');
  }

  const analysisResult = await analyzeFoodImage(imageBase64, mimeType);

  let foodImageRecord = null;
  if (imageUrl) {
    foodImageRecord = await prisma.foodImage.create({
      data: {
        userId,
        imageUrl,
        storagePath,
        mimeType,
      },
    });
  }

  const foodAnalysisRecord = await prisma.foodAnalysis.create({
    data: {
      userId,
      foodImageId: foodImageRecord ? foodImageRecord.id : null,
      detectedItemsJson: analysisResult.items || [],
      estimatedCalories: analysisResult.estimatedCalories || 0,
      estimatedProteinG: analysisResult.estimatedProteinG || 0,
      estimatedCarbsG: analysisResult.estimatedCarbsG || 0,
      estimatedFatG: analysisResult.estimatedFatG || 0,
      confidence: analysisResult.confidence || 0.85,
    },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        analysis: analysisResult,
        imageUrl: imageUrl || null,
        foodAnalysisId: foodAnalysisRecord.id,
      },
      'Food image scanned successfully'
    )
  );
});

export const scanReceiptPhoto = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

  let imageBase64 = req.body.imageBase64;
  let mimeType = req.body.mimeType || 'image/jpeg';
  let imageUrl = '';

  if (req.file) {
    const fileBuffer = fs.readFileSync(req.file.path);
    imageBase64 = fileBuffer.toString('base64');
    mimeType = req.file.mimetype;
    imageUrl = `/uploads/receipts/${req.file.filename}`;
  }

  if (!imageBase64) {
    throw new ApiError(400, 'An image file upload or imageBase64 is required.');
  }

  const receiptResult = await analyzeReceipt(imageBase64, mimeType);

  const receiptRecord = await prisma.receipt.create({
    data: {
      userId,
      imageUrl: imageUrl || '/uploads/receipts/demo_receipt.jpg',
      extractedDataJson: receiptResult.items || [],
      totalAmount: Number(receiptResult.totalAmount || 0),
      vendorName: receiptResult.vendorName || 'Restaurant',
    },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        receipt: receiptResult,
        imageUrl: imageUrl || null,
        receiptId: receiptRecord.id,
      },
      'Receipt scanned successfully'
    )
  );
});

export const parseNLLog = catchAsync(async (req: Request, res: Response) => {
  const { textInput } = req.body;
  if (!textInput) {
    throw new ApiError(400, 'textInput is required.');
  }

  const parsedResult = await parseNaturalLanguageLog(textInput);
  res.status(200).json(
    new ApiResponse(200, { parsed: parsedResult }, 'Natural language log parsed successfully')
  );
});

export const getMealRecommendations = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

  const profile = await prisma.userProfile.findUnique({ where: { userId } });

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

  res.status(200).json(
    new ApiResponse(200, { recommendations }, 'Meal recommendations generated successfully')
  );
});

export const chatWithAssistant = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, 'message is required.');
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const userSummary = `Goal: ${profile?.goal || 'Fitness'}, Diet: ${profile?.dietType || 'Standard'}, City: ${profile?.city || 'Local'}`;

  const reply = await chatWithAiCoach(message, userSummary);

  res.status(200).json(
    new ApiResponse(200, { reply }, 'AI Coach response generated successfully')
  );
});
