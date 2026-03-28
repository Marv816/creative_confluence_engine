import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initializes the Gemini client with the API key from environment variables.
 * @returns {GoogleGenerativeAI} Configured Gemini client instance.
 */
let genAI = null;

try {
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[Gemini Client] VITE_GEMINI_API_KEY is not set in environment variables');
    throw new Error('Gemini API key is missing. Please configure VITE_GEMINI_API_KEY in your .env file.');
  }

  if (apiKey === 'your-gemini-api-key-here' || apiKey?.includes('your-')) {
    console.error('[Gemini Client] VITE_GEMINI_API_KEY is set to placeholder value');
    throw new Error('Gemini API key is not configured. Please add your actual API key to the .env file.');
  }

  console.log('[Gemini Client] Initializing with API key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  
  genAI = new GoogleGenerativeAI(apiKey);
  
  console.log('[Gemini Client] Successfully initialized');
} catch (error) {
  console.error('[Gemini Client] Initialization failed:', error?.message);
  // Don't throw here, let the service functions handle it
}

export default genAI;