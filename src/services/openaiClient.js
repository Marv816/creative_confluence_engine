import OpenAI from 'openai';

/**
 * Initializes the OpenAI client with the API key from environment variables.
 * @returns {OpenAI} Configured OpenAI client instance.
 */
let openai = null;

try {
  const apiKey = import.meta.env?.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('[OpenAI Client] VITE_OPENAI_API_KEY is not set in environment variables');
    throw new Error('OpenAI API key is missing. Please configure VITE_OPENAI_API_KEY in your .env file.');
  }

  if (apiKey === 'your-openai-api-key-here' || apiKey?.includes('your-')) {
    console.error('[OpenAI Client] VITE_OPENAI_API_KEY is set to placeholder value');
    throw new Error('OpenAI API key is not configured. Please add your actual API key to the .env file.');
  }

  console.log('[OpenAI Client] Initializing with API key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  
  openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage in React
  });
  
  console.log('[OpenAI Client] Successfully initialized');
} catch (error) {
  console.error('[OpenAI Client] Initialization failed:', error?.message);
  // Don't throw here, let the service functions handle it
}

export default openai;