/**
 * Handles common Gemini API errors with user-friendly messages.
 * Simple classification: Internal errors (401, 402, 403, 429, 500-504) vs General errors
 * 
 * @param {Error} error - The error object from the API.
 * @returns {Object} Error information with message, isInternal flag, and status code.
 */
export function handleGeminiError(error) {
  if (error?.status === 401 || error?.message?.toLowerCase()?.includes("api key")) {
    return { isInternal: true, message: error?.message }
  }

  if(error?.status === 403 || error?.message?.toLowerCase()?.includes("forbidden")){
    return { isInternal: true, message: error?.message }
  }

  if(error?.status === 404 || error?.message?.toLowerCase()?.includes("not found")){
    return { isInternal: true, message: error?.message }
  }

  if(error?.status === 429 || error?.message?.toLowerCase()?.includes("rate limit exceeded")){
    return { isInternal: true, message: error?.message }
  }

  if(error?.status >= 500){
    return { isInternal: true, message: error?.message }
  }

  return {
    isInternal: false,
    message: error?.message
  }
}

/**
 * Comprehensive safety settings for content filtering.
 * @returns {Array} Safety settings configuration.
 */
export function getSafetySettings() {
  return [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_LOW_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_LOW_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_LOW_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_LOW_AND_ABOVE"
    }
  ];
}