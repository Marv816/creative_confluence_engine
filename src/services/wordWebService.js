import genAI from './geminiClient';
import { handleGeminiError } from './geminiErrorHandler';

/**
 * Generates a comprehensive word web with rhymes, metaphors, associations, and creative prompts.
 * @param {string} seedWord - The central word to explore
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Word web data
 */
export async function generateWordWeb(seedWord, options = {}) {
  try {
    if (!seedWord?.trim()) {
      throw new Error('Please provide a word to explore.');
    }

    const {
      includeSlang = true,
      genre = 'hip-hop',
      depth = 'comprehensive'
    } = options;

    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const systemPrompt = `You are a creative wordsmith and linguistic expert specializing in ${genre} lyric writing.

Generate a comprehensive word web for the word "${seedWord}" that includes:

1. WORDPLAY:
   - Metaphors and Similes: Creative comparisons and figurative language
   - ${includeSlang ? 'Slang & Vernacular: Regional slang and street language' : ''}
   
2. RHYMES:
   - End Rhymes: Perfect rhymes for the word
   - Multisyllabic Rhymes: Complex multi-word rhyme patterns
   - Assonance: Vowel sound rhymes and near-rhymes

3. INSPIRATION:
   - Imagery Associations: Visual and sensory descriptions
   - Quotes & Parables: Related sayings and wisdom
   - Creative Prompts: Writing exercises and challenges

Format as JSON with the structure:
{
  "wordplay": {
    "metaphors_and_similes": ["array of strings"],
    "slang_and_vernacular": ["array of strings"]
  },
  "rhymes": {
    "end_rhymes": ["array of strings"],
    "multisyllabic_rhymes": ["array of strings"],
    "assonance": ["array of strings"]
  },
  "inspiration": {
    "imagery_associations": ["array of strings"],
    "quotes_and_parables": ["array of strings"],
    "creative_prompts": ["array of strings"]
  }
}`;

    const result = await model?.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await result?.response;
    const text = response?.text();
    
    return JSON.parse(text);
  } catch (error) {
    const errorInfo = handleGeminiError(error);
    if (errorInfo?.isInternal) {
      console.log('Error in word web generation:', errorInfo?.message);
    } else {
      console.error('Error in word web generation:', error);
    }
    throw new Error(errorInfo.message);
  }
}

/**
 * Generates creative writing prompts based on theme and style.
 * @param {string} theme - The theme for prompts
 * @param {string} style - Writing style preference
 * @returns {Promise<Array>} Array of creative prompts
 */
export async function generateWritingPrompts(theme, style = 'rap') {
  try {
    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Generate 10 creative writing prompts for ${style} lyrics about ${theme}.
Each prompt should be specific, inspiring, and push creative boundaries.
Format as a JSON array of strings.`;

    const result = await model?.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await result?.response;
    const text = response?.text();
    
    const data = JSON.parse(text);
    return data?.prompts || data;
  } catch (error) {
    const errorInfo = handleGeminiError(error);
    if (errorInfo?.isInternal) {
      console.log('Error in prompt generation:', errorInfo?.message);
    } else {
      console.error('Error in prompt generation:', error);
    }
    throw new Error(errorInfo.message);
  }
}