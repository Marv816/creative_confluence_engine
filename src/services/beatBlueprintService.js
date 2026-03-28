import genAI from './geminiClient';
import { handleGeminiError } from './geminiErrorHandler';

/**
 * Generates a comprehensive beat blueprint using Keylow Keyz music production knowledge.
 * @param {string} vibe - The desired vibe or genre for the beat
 * @returns {Promise<Object>} Beat blueprint with technical specs, theory, rhythm guide, and AI prompt
 */
export async function generateBeatBlueprint(vibe) {
  try {
    if (!vibe?.trim()) {
      throw new Error('Please describe the vibe or genre for the beat.');
    }

    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const systemPrompt = `You are "Keylow Keyz" (aka DJ Freek-Quincy), an expert Music Producer and Theory Instructor. 

Your goal is to provide a "Beat Blueprint" based on the user's request, utilizing the following specific knowledge base:

1. THEORY KNOWLEDGE:
   - For Trap/Dark: Use Minor keys (e.g., C Minor, F# Minor). Use progressions like i-vi-v (Cm-Ab-Gm) or i-bVI-bVII (F#m-D-E). Mention "Diminished chords" for tension.
   - For G-Funk: Use Major keys with 7th chords. Progressions like G-Em-Am-D or Fm-Db-Eb-C.
   - For Neo-Soul: Use 7th, 9th, and 11th extensions (e.g., Fm7-Bb7-Ebmaj7).

2. RHYTHM KNOWLEDGE:
   - The Snare is the anchor (must land on Beats 2 and 4).
   - Hi-Hats: Use 1/16th and 1/32nd note rolls with triplet bursts for bounce.
   - Kick: Must leave space for the snare.

3. AI PROMPT ENGINEERING (For Suno/Udio):
   - You must write a prompt optimized for AI generators. 
   - Use keywords like: "Atmospheric," "Analog Synth (Juno/Prophet)," "Gated Reverb," "Sub-bass 808," "Vinyl Crackle," "Arpeggiated melody."
   - Structure the prompt with [Genre] [Instruments] [Vibe] [Technical Details].

FORMAT THE OUTPUT AS A JSON OBJECT with these 4 fields:
- technical_specs: (BPM, Key Signature, Time Signature)
- theory_insight: (The chord progression and WHY it works emotionally)
- rhythmic_guide: (Specific drum programming instructions, e.g., "Kick on 1, Snare on 2/4")
- suno_prompt: (A highly detailed, copy-pasteable prompt for Suno/Udio based on the Music Prompt Guide)
`;

    const userQuery = `Create a beat blueprint for: "${vibe}"`;

    const result = await model?.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userQuery}` }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            technical_specs: { type: "STRING", description: "BPM, Key, Time Sig" },
            theory_insight: { type: "STRING", description: "Chord progression and explanation" },
            rhythmic_guide: { type: "STRING", description: "Drum pattern description" },
            suno_prompt: { type: "STRING", description: "Optimized prompt for AI music generators" }
          }
        }
      }
    });

    const response = await result?.response;
    const text = response?.text();
    
    return JSON.parse(text);
  } catch (error) {
    const errorInfo = handleGeminiError(error);
    if (errorInfo?.isInternal) {
      console.log('Error in beat blueprint generation:', errorInfo?.message);
    } else {
      console.error('Error in beat blueprint generation:', error);
    }
    throw new Error(errorInfo.message);
  }
}