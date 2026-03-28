import genAI from './geminiClient';
import { handleGeminiError } from './geminiErrorHandler';

/**
 * Generates chord progressions with voicings, tempo, groove, and reharmonization suggestions
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} Chord progression data
 */
export async function generateChordProgression(params) {
  try {
    const { key, mood, complexity, instrument } = params;

    if (!key?.trim()) {
      throw new Error('Please provide a key (e.g., Am, C, G#m).');
    }

    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const systemPrompt = `You are a professional music theory expert and composer.

Generate a chord progression for:
KEY: ${key}
MOOD: ${mood}
COMPLEXITY: ${complexity}
INSTRUMENT: ${instrument}

Provide:
1. Progression: 4-8 chords with Roman numeral analysis
2. Voicings: Specific voicings for guitar, piano, and synth
3. Tempo: Suggested BPM
4. Groove: Style description
5. Suggested Scale: Best scale for improvisation
6. Substitutions: Reharmonization ideas

Format as JSON with this structure:
{
  "progression": ["Am7", "Fmaj7", "C", "G"],
  "roman_numerals": ["i7", "VI7", "III", "VII"],
  "voicings": {
    "guitar": [{"chord": "Am7", "voicing": "x02010"}],
    "piano": [{"chord": "Am7", "voicing": "A C E G"}],
    "synth": [{"chord": "Am7", "voicing": "A3 C4 E4 G4"}]
  },
  "tempo": 90,
  "groove": "Laid-back swung eighths",
  "suggested_scale": "A natural minor",
  "substitutions": ["Try Dm7 instead of Fmaj7 for darker feel"]
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
      console.log('Error in chord generation:', errorInfo?.message);
    } else {
      console.error('Error in chord generation:', error);
    }
    throw new Error(errorInfo.message);
  }
}

/**
 * Generates creative remixes of quotes in different styles
 * @param {string} quote - Original quote to remix
 * @returns {Promise<Object>} Remixed versions
 */
export async function generateRemixes(quote) {
  try {
    if (!quote?.trim()) {
      throw new Error('Please provide a quote to remix.');
    }

    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `Remix this quote into 5 distinct styles (e.g., Shakespearean, Street Slang, Corporate, Poetic, Sci-Fi).

Quote: "${quote}"

Format as JSON:
{
  "remixes": [
    {"style": "Shakespearean", "interpretation": "..."}
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
    throw new Error(errorInfo.message);
  }
}

/**
 * Generates mood and vibe kits with stage names, song titles, colors, and imagery
 * @param {string} mood - Mood description
 * @returns {Promise<Object>} Mood kit data
 */
export async function generateMoodKit(mood) {
  try {
    if (!mood?.trim()) {
      throw new Error('Please describe a mood or theme.');
    }

    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `Generate a creative mood kit for: "${mood}"

Include:
1. Stage Names: 5 creative artist names
2. Song Titles: 5 song title ideas
3. Color Palette: 5 colors with hex codes
4. Imagery: 5 visual/sensory descriptions

Format as JSON:
{
  "stage_names": ["..."],
  "song_titles": ["..."],
  "color_palette": [{"name": "Midnight Blue", "hex": "#191970"}],
  "imagery": ["..."]
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
    throw new Error(errorInfo.message);
  }
}

/**
 * Generates lyrical writing prompts
 * @param {string} theme - Theme for prompts
 * @returns {Promise<Object>} Writing prompts
 */
export async function generateLyricalPrompts(theme) {
  try {
    if (!theme?.trim()) {
      throw new Error('Please provide a theme.');
    }

    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `Generate 5 creative writing prompts for rap, poetry, or songwriting about: "${theme}"

Format as JSON:
{
  "prompts": ["..."]
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
    throw new Error(errorInfo.message);
  }
}

/**
 * Generates wordplay training challenges
 * @param {string} skill - Skill to practice (metaphor, simile, rhyming_couplet)
 * @param {string} subject - Subject for the challenge
 * @returns {Promise<string>} Challenge description
 */
export async function generateTrainingChallenge(skill, subject) {
  try {
    if (!subject?.trim()) {
      throw new Error('Please provide a subject.');
    }

    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `Create an engaging writing challenge for practicing ${skill} about "${subject}".

Provide:
1. Clear instructions
2. Example to inspire
3. Tips for success

Make it fun and educational.`;

    const result = await model?.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt }]
      }]
    });

    const response = await result?.response;
    return response?.text();
  } catch (error) {
    const errorInfo = handleGeminiError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Provides AI feedback on training challenge responses
 * @param {string} challenge - Original challenge
 * @param {string} userResponse - User's response
 * @param {string} skill - Skill being practiced
 * @returns {Promise<string>} Feedback
 */
export async function getTrainingFeedback(challenge, userResponse, skill) {
  try {
    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `Provide concise, constructive feedback on this writing challenge response.

CHALLENGE: ${challenge}

RESPONSE: ${userResponse}

Evaluate their use of ${skill}. Be encouraging but specific about improvements.`;

    const result = await model?.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt }]
      }]
    });

    const response = await result?.response;
    return response?.text();
  } catch (error) {
    const errorInfo = handleGeminiError(error);
    throw new Error(errorInfo.message);
  }
}
