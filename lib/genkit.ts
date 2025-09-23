import { configureGenkit, generate } from '@genkit-ai/core';
import { googleAI, gemini15Flash, gemini15Pro } from '@genkit-ai/googleai';

// Configure Genkit
configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Export what we need
export { generate, gemini15Flash, gemini15Pro };
