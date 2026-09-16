import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config';

// Initialize Gemini client lazily
let genAI: GoogleGenerativeAI | null = null;

const getGenAI = (): GoogleGenerativeAI | null => {
  if (!genAI && config.geminiApiKey) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
};

// -----------------------------------------------------------------------------
// 1. Food Photo Recognition & Macro Estimation
// -----------------------------------------------------------------------------
export const analyzeFoodImage = async (imageBase64: string, mimeType: string = 'image/jpeg') => {
  const ai = getGenAI();
  
  if (!ai) {
    return {
      items: [
        { name: 'Grilled Chicken & Rice', quantity: '1 plate', calories: 450, proteinG: 35, carbsG: 45, fatG: 10 }
      ],
      estimatedCalories: 450,
      estimatedProteinG: 35,
      estimatedCarbsG: 45,
      estimatedFatG: 10,
      confidence: 0.85,
      note: 'Demo mode: Add GEMINI_API_KEY in backend/.env for live AI image vision.'
    };
  }

  const prompt = `Analyze this food image and return structured JSON containing estimated nutrition breakdown.
Return ONLY valid JSON matching this schema:
{
  "items": [
    { "name": "Item Name", "quantity": "estimated portion", "calories": number, "proteinG": number, "carbsG": number, "fatG": number }
  ],
  "estimatedCalories": number,
  "estimatedProteinG": number,
  "estimatedCarbsG": number,
  "estimatedFatG": number,
  "confidence": number
}`;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const text = result.response.text();
    return JSON.parse(text);
  } catch (err: any) {
    console.error('Gemini analyzeFoodImage error:', err);
    throw new Error(`AI Food Image Analysis failed: ${err.message}`);
  }
};

// -----------------------------------------------------------------------------
// 2. Receipt / Bill OCR Extraction
// -----------------------------------------------------------------------------
export const analyzeReceipt = async (imageBase64: string, mimeType: string = 'image/jpeg') => {
  const ai = getGenAI();
  
  if (!ai) {
    return {
      category: 'RESTAURANT',
      vendorName: 'Sample Restaurant',
      items: [
        { name: 'Chicken Thali', price: 180 },
        { name: 'Fresh Lime Water', price: 40 }
      ],
      totalAmount: 220,
      note: 'Demo mode: Add GEMINI_API_KEY for live receipt OCR.'
    };
  }

  const prompt = `Extract food receipt/bill details from this photo.
Return ONLY valid JSON with this format:
{
  "category": "RESTAURANT" | "GROCERY" | "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
  "vendorName": "Restaurant or shop name",
  "items": [
    { "name": "item description", "price": number }
  ],
  "totalAmount": number
}`;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    return JSON.parse(result.response.text());
  } catch (err: any) {
    console.error('Gemini analyzeReceipt error:', err);
    throw new Error(`Receipt OCR analysis failed: ${err.message}`);
  }
};

// -----------------------------------------------------------------------------
// 3. Natural Language Voice/Text Log Parser
// -----------------------------------------------------------------------------
export const parseNaturalLanguageLog = async (userInput: string) => {
  const ai = getGenAI();
  
  if (!ai) {
    return {
      logType: 'MEAL',
      mealName: userInput,
      estimatedCalories: 300,
      estimatedProteinG: 15,
      estimatedCarbsG: 35,
      estimatedFatG: 8,
      expenseAmount: null
    };
  }

  const prompt = `Convert the following user input ("${userInput}") into structured log details.
Categorize as "MEAL", "EXPENSE", or "ACTIVITY".
Return ONLY valid JSON matching:
{
  "logType": "MEAL" | "EXPENSE" | "ACTIVITY",
  "mealName": "parsed meal description",
  "mealType": "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
  "estimatedCalories": number,
  "estimatedProteinG": number,
  "estimatedCarbsG": number,
  "estimatedFatG": number,
  "expenseAmount": number or null,
  "expenseCategory": "BREAKFAST" | "LUNCH" | "DINNER" | "RESTAURANT" | "GROCERY" | "OTHER" or null,
  "activityType": "WALKING" | "RUNNING" | "CYCLING" | "WORKOUT" or null,
  "durationMinutes": number or null
}`;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (err: any) {
    console.error('Gemini parseNaturalLanguageLog error:', err);
    throw new Error(`NL parser failed: ${err.message}`);
  }
};

// -----------------------------------------------------------------------------
// 4. Budget & Location Aware Meal Recommendations
// -----------------------------------------------------------------------------
export const generateMealRecommendations = async (context: {
  goal: string;
  dietType: string;
  city: string;
  dailyBudget: number;
  remainingCalories: number;
  remainingProtein: number;
}) => {
  const ai = getGenAI();
  
  if (!ai) {
    return [
      { name: 'Egg Bhurji + 2 Roti', estimatedCost: 70, proteinG: 18, calories: 320, description: 'High protein, budget friendly local choice.' },
      { name: 'Chicken Thali', estimatedCost: 160, proteinG: 35, calories: 550, description: 'Balanced meal with high protein.' },
      { name: 'Dal Rice + Salad', estimatedCost: 80, proteinG: 12, calories: 400, description: 'Comforting, healthy & low cost.' }
    ];
  }

  const prompt = `Target User Context:
Goal: ${context.goal}
Diet Preference: ${context.dietType}
Location/City: ${context.city || 'India'}
Daily Budget Limit: ₹${context.dailyBudget}
Remaining Calories Needed Today: ${context.remainingCalories} kcal
Remaining Protein Needed Today: ${context.remainingProtein}g

Generate 3 practical meal options that fit this user's budget and local availability in ${context.city || 'India'}.
Return ONLY valid JSON array matching:
[
  { "name": "Meal Name", "estimatedCost": number, "proteinG": number, "calories": number, "description": "Why this fits budget & nutrition" }
]`;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (err: any) {
    console.error('Gemini generateMealRecommendations error:', err);
    return [];
  }
};

// -----------------------------------------------------------------------------
// 5. AI Coach Chat
// -----------------------------------------------------------------------------
export const chatWithAiCoach = async (userPrompt: string, userContextSummary: string) => {
  const ai = getGenAI();
  
  if (!ai) {
    return `I am your AI Lifestyle Coach (Dev Mode). Based on your stats (${userContextSummary}), keep staying hydrated, focus on your protein targets, and keep up your daily activity!`;
  }

  const prompt = `System Instructions: You are a friendly, encouraging personal lifestyle, nutrition, and fitness AI assistant.
Keep answers clear, concise, actionable, and non-judgmental. Do NOT give medical advice.

User Context Summary:
${userContextSummary}

User Question: "${userPrompt}"`;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: any) {
    console.error('Gemini chatWithAiCoach error:', err);
    return 'I encountered an issue processing your query. Please try again shortly!';
  }
};
