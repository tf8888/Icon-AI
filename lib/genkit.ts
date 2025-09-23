import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API,
  })],
  model: googleAI.model('gemini-2.5-flash', {
    temperature: 0.7,
  }),
});

// Export latest 2025 stable models for direct use if needed
export const gemini25Pro = googleAI.model('gemini-2.5-pro');
export const gemini25Flash = googleAI.model('gemini-2.5-flash');
export const gemini25FlashLite = googleAI.model('gemini-2.5-flash-lite');

// Legacy stable models (still available)
export const gemini15Pro = googleAI.model('gemini-1.5-pro');
export const gemini15Flash = googleAI.model('gemini-1.5-flash');
export const gemini15Flash8B = googleAI.model('gemini-1.5-flash-8b');
