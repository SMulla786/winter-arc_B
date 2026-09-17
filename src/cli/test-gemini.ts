import { chatWithAiCoach, parseNaturalLanguageLog } from '../services/ai.service';
import config from '../config/config';

async function testGeminiCLI() {
  console.log('🤖 Testing Gemini AI API Integration...');
  console.log(`API Key Configured: ${config.geminiApiKey ? 'YES (Key Present)' : 'NO (Dev Fallback Mode)'}`);

  console.log('\n--- 1. Testing Natural Language Log Parser ---');
  const inputPrompt = 'I ate 2 eggs and 2 rotis for breakfast and spent 80 rupees';
  console.log(`Input Prompt: "${inputPrompt}"`);
  
  const parsedResult = await parseNaturalLanguageLog(inputPrompt);
  console.log('Parsed JSON Result:', JSON.stringify(parsedResult, null, 2));

  console.log('\n--- 2. Testing AI Lifestyle Coach Chat ---');
  const userQuery = 'What should I eat for dinner with ₹120 in Mumbai?';
  const contextSummary = 'Goal: Weight Loss, Diet: Non-Veg, Budget: ₹300/day, Remaining Budget: ₹120';
  console.log(`User Query: "${userQuery}"`);

  const reply = await chatWithAiCoach(userQuery, contextSummary);
  console.log('AI Coach Reply:\n', reply);

  console.log('\n✅ Gemini AI CLI Test Completed!');
}

testGeminiCLI().catch((e) => {
  console.error('❌ Error testing Gemini AI:', e);
  process.exit(1);
});
