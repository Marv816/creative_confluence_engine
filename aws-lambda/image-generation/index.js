/**
 * AWS Lambda Function for Image Generation
 * Supports OpenAI and Gemini providers
 * Uses @rocketnew/llm-sdk for multi-provider support
 */

const { imageGeneration } = require('@rocketnew/llm-sdk');

function formatErrorResponse(error, provider) {
  const statusCode = error?.statusCode || 500;
  const providerName = error?.llmProvider || provider || 'Unknown';

  return {
    error: `${providerName?.toUpperCase()} API error: ${statusCode}`,
    details: error?.message || error?.body || String(error),
  };
}

exports.handler = async (event) => {
  // Set response headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // Only allow POST requests
  if (event?.requestContext?.http?.method !== 'POST' && event?.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'Method not allowed: Use POST',
        details: 'This endpoint only accepts POST requests',
      }),
    };
  }

  // Parse request body
  let body = {};
  try {
    if (event?.body) {
      body = typeof event?.body === 'string' ? JSON.parse(event?.body) : event?.body;
    }
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Invalid request: JSON parsing failed',
        details: 'The request body must be valid JSON',
      }),
    };
  }

  // Extract variables from body
  const { prompt, model, provider } = body;

  try {
    // Validate provider first (routing decision)
    const supportedProviders = ['OPEN_AI', 'GEMINI'];

    if (!provider || !supportedProviders?.includes(provider)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Unsupported provider: ${provider || 'none'}`,
          details: `Supported providers are: ${supportedProviders?.join(', ')}`,
        }),
      };
    }

    // Get API key from environment variable based on provider
    let apiKey;
    if (provider === 'OPEN_AI') {
      apiKey = process.env.OPENAI_API_KEY;
    } else if (provider === 'GEMINI') {
      apiKey = process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `${provider} API key is not configured`,
          details: 'The API key for this provider is missing in environment variables',
        }),
      };
    }

    // Validate model
    if (!model) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request: Model is required',
          details: 'The request must include a model name for image generation',
        }),
      };
    }

    // Validate prompt
    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request: Prompt is required',
          details: 'The request must include a prompt describing the image to generate',
        }),
      };
    }

    // All optional parameters are passed through body.parameters
    const response = await imageGeneration({
      ...(body?.parameters || {}),
      prompt,
      model,
      api_key: apiKey,
    });

    // Return JSON response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    // Return error response
    const errorResponse = formatErrorResponse(error, provider);
    return {
      statusCode: error?.statusCode || 500,
      headers,
      body: JSON.stringify(errorResponse),
    };
  }
};