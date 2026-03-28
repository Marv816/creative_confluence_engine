import genAI from './geminiClient';
import { handleGeminiError } from './geminiErrorHandler';

/**
 * Generates mood board elements (song titles, stage names, imagery, color palette).
 * @param {string} mood - The desired mood or vibe
 * @returns {Promise<Object>} Mood board data
 */
export async function generateMoodBoard(mood) {
  try {
    if (!mood?.trim()) {
      throw new Error('Please describe the mood or vibe.');
    }

    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const systemPrompt = `You are a creative director and brand strategist for music artists.

Generate a comprehensive mood board for the vibe: "${mood}"

Include:
1. Song Titles: 8-10 creative, evocative song titles
2. Stage Names: 5-7 artist/producer names that match the vibe
3. Imagery: 5-7 vivid visual descriptions and scenes
4. Color Palette: 5-6 colors with names and hex codes that match the mood

Format as JSON:
{
  "song_titles": ["array of strings"],
  "stage_names": ["array of strings"],
  "imagery": ["array of descriptive strings"],
  "color_palette": [
    {"name": "color name", "hex": "#hexcode"},
    ...
  ]
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
      console.log('Error in mood board generation:', errorInfo?.message);
    } else {
      console.error('Error in mood board generation:', error);
    }
    throw new Error(errorInfo.message);
  }
}