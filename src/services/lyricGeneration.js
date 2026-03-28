import genAI from './geminiClient';
import openai from './openaiClient';
import { handleGeminiError, getSafetySettings } from './geminiErrorHandler';
import { 
  APIConnectionError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
  InternalServerError
} from 'openai';

/**
 * Maps OpenAI API error types to user-friendly error messages.
 * @param {Error} error - The error object from OpenAI API.
 * @returns {Object} Error information with isInternal flag and message.
 */
export function getOpenAIErrorMessage(error) {
  if (error instanceof AuthenticationError) {
    return { isInternal: true, message: 'Invalid OpenAI API key or authentication failed.' };
  } else if (error instanceof PermissionDeniedError) {
    return { isInternal: true, message: 'OpenAI quota exceeded or authorization failed.' };
  } else if (error instanceof RateLimitError) {
    return { isInternal: true, message: 'OpenAI rate limit exceeded. Please wait a moment and try again.' };
  } else if (error instanceof InternalServerError) {
    return { isInternal: true, message: 'OpenAI service is currently unavailable. Please try again later.' };
  } else if (error instanceof APIConnectionError) {
    return { isInternal: true, message: 'Unable to connect to OpenAI service. Please check your internet connection.' };
  } else {
    return { isInternal: false, message: error?.message || 'An unexpected error occurred with OpenAI.' };
  }
}

/**
 * Generates lyrics using OpenAI GPT-5 as fallback.
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} Generated lyrics with metadata
 */
async function generateLyricsWithOpenAI({ genre, subject, tone, artistStyles, section = 'verse', bars = 16 }) {
  try {
    if (!openai) {
      console.error('[OpenAI Lyric Generation] OpenAI client not initialized');
      throw new Error('OpenAI service is not configured. Please check your API key settings.');
    }

    console.log('[OpenAI Lyric Generation] Starting generation with params:', { genre, subject, tone, artistStyles, section, bars });

    const systemPrompt = `You are a world-class lyricist and ghostwriter specializing in rap, hip-hop, and R&B. 
You write in the style of ${artistStyles}, combining their unique wordplay, flow patterns, and thematic elements.

Your lyrics must demonstrate:
- Complex multisyllabic rhyme schemes
- Internal rhymes and assonance
- Metaphors, similes, and double entendres
- Cultural references and street wisdom
- Natural flow and rhythm
- Authentic voice matching the requested artist styles

Genre: ${genre}
Subject/Theme: ${subject}
Tone/Mood: ${tone}
Section: ${section}
Bars: ${bars}

Write ${bars} bars of ${tone} ${genre} lyrics about ${subject} in the style of ${artistStyles}.
Format with clear bar structure, rhyme patterns, and flow annotations.`;

    console.log('[OpenAI Lyric Generation] Sending request to OpenAI API...');

    const response = await openai?.chat?.completions?.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a world-class lyricist and ghostwriter.' },
        { role: 'user', content: systemPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.9,
    });

    const lyrics = response?.choices?.[0]?.message?.content;

    if (!lyrics || lyrics?.trim()?.length === 0) {
      console.error('[OpenAI Lyric Generation] Empty lyrics returned');
      throw new Error('OpenAI returned empty lyrics. Please try different parameters.');
    }

    console.log('[OpenAI Lyric Generation] Successfully generated lyrics, length:', lyrics?.length);

    return {
      lyrics,
      metadata: {
        genre,
        subject,
        tone,
        artistStyles,
        section,
        bars,
        timestamp: new Date()?.toISOString(),
        provider: 'openai'
      }
    };
  } catch (error) {
    console.error('[OpenAI Lyric Generation] Error caught:', error);
    const errorInfo = getOpenAIErrorMessage(error);
    
    if (errorInfo?.isInternal) {
      console.log(errorInfo?.message);
    } else {
      console.error('[OpenAI Lyric Generation] Error:', error);
    }
    
    throw new Error(errorInfo.message || 'Failed to generate lyrics with OpenAI.');
  }
}

/**
 * Streams lyrics using OpenAI GPT-5 as fallback.
 * @param {Object} params - Generation parameters
 * @param {Function} onChunk - Callback to handle each streamed chunk
 */
async function streamLyricsWithOpenAI(params, onChunk) {
  try {
    const { genre, subject, tone, artistStyles, section = 'verse', bars = 16 } = params;

    if (!openai) {
      console.error('[OpenAI Stream Lyrics] OpenAI client not initialized');
      throw new Error('OpenAI service is not configured. Please check your API key settings.');
    }

    console.log('[OpenAI Stream Lyrics] Starting streaming generation with params:', params);

    const systemPrompt = `You are a world-class lyricist writing in the style of ${artistStyles}.
Write ${bars} bars of ${tone} ${genre} lyrics about ${subject}.
Focus on complex rhyme schemes, wordplay, and authentic voice.`;

    console.log('[OpenAI Stream Lyrics] Sending streaming request to OpenAI API...');

    const stream = await openai?.chat?.completions?.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a world-class lyricist.' },
        { role: 'user', content: systemPrompt },
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.9,
    });

    console.log('[OpenAI Stream Lyrics] Stream started successfully');
    let totalChunks = 0;

    for await (const chunk of stream) {
      const content = chunk?.choices?.[0]?.delta?.content || '';
      if (content) {
        totalChunks++;
        onChunk(content);
      }
    }

    console.log('[OpenAI Stream Lyrics] Streaming completed, total chunks:', totalChunks);

    if (totalChunks === 0) {
      throw new Error('No content received from OpenAI streaming.');
    }
  } catch (error) {
    console.error('[OpenAI Stream Lyrics] Error caught:', error);
    const errorInfo = getOpenAIErrorMessage(error);
    
    if (errorInfo?.isInternal) {
      console.log(errorInfo?.message);
    } else {
      console.error('[OpenAI Stream Lyrics] Error:', error);
    }
    
    throw new Error(errorInfo.message || 'Failed to stream lyrics with OpenAI.');
  }
}

/**
 * Analyzes lyrics using OpenAI GPT-5 as fallback.
 * @param {string} lyrics - The lyrics to analyze
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeLyricsWithOpenAI(lyrics) {
  try {
    if (!lyrics || lyrics?.trim()?.length === 0) {
      throw new Error('No lyrics provided for analysis.');
    }

    if (!openai) {
      console.error('[OpenAI Lyric Analysis] OpenAI client not initialized');
      throw new Error('OpenAI service is not configured. Please check your API key settings.');
    }

    console.log('[OpenAI Lyric Analysis] Starting analysis, lyrics length:', lyrics?.length);

    const prompt = `Analyze these lyrics for:
1. Rhyme scheme patterns (end rhymes, internal rhymes, multisyllabic)
2. Flow analysis (rhythm, cadence, syllable patterns)
3. Wordplay techniques (metaphors, similes, double entendres, cultural references)
4. Strengths and areas for improvement
5. Overall rating (1-10)

Lyrics:
${lyrics}

Provide detailed, constructive feedback as a professional lyricist.`;

    console.log('[OpenAI Lyric Analysis] Sending analysis request to OpenAI API...');

    const response = await openai?.chat?.completions?.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a professional lyricist and music critic.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
    });

    const analysisText = response?.choices?.[0]?.message?.content;

    if (!analysisText || analysisText?.trim()?.length === 0) {
      console.error('[OpenAI Lyric Analysis] Empty analysis returned');
      throw new Error('OpenAI returned empty analysis.');
    }

    console.log('[OpenAI Lyric Analysis] Successfully generated analysis, length:', analysisText?.length);

    return {
      analysis: analysisText,
      timestamp: new Date()?.toISOString(),
      provider: 'openai'
    };
  } catch (error) {
    console.error('[OpenAI Lyric Analysis] Error caught:', error);
    const errorInfo = getOpenAIErrorMessage(error);
    
    if (errorInfo?.isInternal) {
      console.log(errorInfo?.message);
    } else {
      console.error('[OpenAI Lyric Analysis] Error:', error);
    }
    
    throw new Error(errorInfo.message || 'Failed to analyze lyrics with OpenAI.');
  }
}

/**
 * Generates lyrics based on genre, subject, tone, and artist style mixing.
 * Tries Gemini first, falls back to OpenAI if Gemini fails.
 * @param {Object} params - Generation parameters
 * @param {string} params.genre - Music genre (rap, R&B, trap, drill, etc.)
 * @param {string} params.subject - Song subject/theme
 * @param {string} params.tone - Emotional tone (aggressive, introspective, hype, sad, romantic)
 * @param {string} params.artistStyles - Artist style combinations (e.g., "Kendrick Lamar mixed with Ludacris")
 * @param {string} params.section - Song section (verse, hook, bridge, full song)
 * @param {number} params.bars - Number of bars to generate (default: 16)
 * @returns {Promise<Object>} Generated lyrics with metadata
 */
export async function generateLyrics({ genre, subject, tone, artistStyles, section = 'verse', bars = 16 }) {
  try {
    // Validate Gemini client initialization
    if (!genAI) {
      console.error('[Lyric Generation] Gemini client not initialized');
      throw new Error('AI service is not configured. Please check your API key settings.');
    }

    console.log('[Lyric Generation] Starting generation with params:', { genre, subject, tone, artistStyles, section, bars });

    const model = genAI?.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      safetySettings: getSafetySettings()
    });

    if (!model) {
      console.error('[Lyric Generation] Failed to get generative model');
      throw new Error('Failed to initialize AI model. Please try again.');
    }

    const systemPrompt = `You are a world-class lyricist and ghostwriter specializing in rap, hip-hop, and R&B. 
You write in the style of ${artistStyles}, combining their unique wordplay, flow patterns, and thematic elements.

Your lyrics must demonstrate:
- Complex multisyllabic rhyme schemes
- Internal rhymes and assonance
- Metaphors, similes, and double entendres
- Cultural references and street wisdom
- Natural flow and rhythm
- Authentic voice matching the requested artist styles

Genre: ${genre}
Subject/Theme: ${subject}
Tone/Mood: ${tone}
Section: ${section}
Bars: ${bars}

Write ${bars} bars of ${tone} ${genre} lyrics about ${subject} in the style of ${artistStyles}.
Format with clear bar structure, rhyme patterns, and flow annotations.`;

    console.log('[Lyric Generation] Sending request to Gemini API...');
    
    const result = await model?.generateContent(systemPrompt);
    
    // Validate API response
    if (!result) {
      console.error('[Lyric Generation] No result returned from API');
      throw new Error('No response received from AI service. Please try again.');
    }

    console.log('[Lyric Generation] Received result from API');

    const response = result?.response;
    
    if (!response) {
      console.error('[Lyric Generation] No response object in result');
      throw new Error('Invalid response from AI service. Please try again.');
    }

    const lyrics = response?.text();
    
    // Validate lyrics content
    if (!lyrics || lyrics?.trim()?.length === 0) {
      console.error('[Lyric Generation] Empty lyrics returned');
      throw new Error('AI service returned empty lyrics. Please try different parameters.');
    }

    console.log('[Lyric Generation] Successfully generated lyrics, length:', lyrics?.length);

    return {
      lyrics,
      metadata: {
        genre,
        subject,
        tone,
        artistStyles,
        section,
        bars,
        timestamp: new Date()?.toISOString(),
        provider: 'gemini'
      }
    };
  } catch (error) {
    console.error('[Lyric Generation] Gemini error caught, attempting OpenAI fallback:', error?.message);
    
    // Attempt OpenAI fallback
    try {
      console.log('[Lyric Generation] Falling back to OpenAI...');
      return await generateLyricsWithOpenAI({ genre, subject, tone, artistStyles, section, bars });
    } catch (openaiError) {
      console.error('[Lyric Generation] OpenAI fallback also failed:', openaiError?.message);
      
      // Handle specific error types from Gemini
      if (error?.message && error?.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API configuration.');
      }
      
      if (error?.message && error?.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later or check your billing.');
      }
      
      if (error?.message && error?.message?.includes('safety')) {
        throw new Error('Content filtered by safety settings. Try different subject matter or tone.');
      }

      // Use Gemini error handler for known errors
      const errorInfo = handleGeminiError(error);
      
      if (errorInfo?.isInternal) {
        console.error('[Lyric Generation] Internal error:', errorInfo?.message, errorInfo?.details);
      }
      
      // Return user-friendly error message
      throw new Error('Both Gemini and OpenAI failed to generate lyrics. Please try again later.');
    }
  }
}

/**
 * Generates streaming lyrics for real-time display.
 * Tries Gemini first, falls back to OpenAI if Gemini fails.
 * @param {Object} params - Generation parameters
 * @param {Function} onChunk - Callback to handle each streamed chunk
 */
export async function streamLyrics(params, onChunk) {
  try {
    const { genre, subject, tone, artistStyles, section = 'verse', bars = 16 } = params;
    
    // Validate Gemini client
    if (!genAI) {
      console.error('[Stream Lyrics] Gemini client not initialized');
      throw new Error('AI service is not configured. Please check your API key settings.');
    }

    console.log('[Stream Lyrics] Starting streaming generation with params:', params);
    
    const model = genAI?.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings: getSafetySettings()
    });

    if (!model) {
      console.error('[Stream Lyrics] Failed to get generative model');
      throw new Error('Failed to initialize AI model. Please try again.');
    }

    const systemPrompt = `You are a world-class lyricist writing in the style of ${artistStyles}.
Write ${bars} bars of ${tone} ${genre} lyrics about ${subject}.
Focus on complex rhyme schemes, wordplay, and authentic voice.`;

    console.log('[Stream Lyrics] Sending streaming request to Gemini API...');

    const result = await model?.generateContentStream(systemPrompt);

    if (!result || !result?.stream) {
      console.error('[Stream Lyrics] No stream returned from API');
      throw new Error('Failed to start streaming. Please try again.');
    }

    console.log('[Stream Lyrics] Stream started successfully');
    let totalChunks = 0;

    for await (const chunk of result?.stream) {
      if (!chunk) {
        console.warn('[Stream Lyrics] Received null chunk');
        continue;
      }

      const text = chunk?.text();
      
      if (text) {
        totalChunks++;
        onChunk(text);
      }
    }

    console.log('[Stream Lyrics] Streaming completed, total chunks:', totalChunks);

    if (totalChunks === 0) {
      throw new Error('No content received from streaming. Please try again.');
    }
  } catch (error) {
    console.error('[Stream Lyrics] Gemini error caught, attempting OpenAI fallback:', error?.message);
    
    // Attempt OpenAI fallback
    try {
      console.log('[Stream Lyrics] Falling back to OpenAI...');
      return await streamLyricsWithOpenAI(params, onChunk);
    } catch (openaiError) {
      console.error('[Stream Lyrics] OpenAI fallback also failed:', openaiError?.message);
      
      // Handle specific error types
      if (error?.message && error?.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API configuration.');
      }
      
      if (error?.message && error?.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later or check your billing.');
      }

      // Use Gemini error handler
      const errorInfo = handleGeminiError(error);
      
      if (errorInfo?.isInternal) {
        console.error('[Stream Lyrics] Internal error:', errorInfo?.message, errorInfo?.details);
      }
      
      throw new Error('Both Gemini and OpenAI failed to stream lyrics. Please try again later.');
    }
  }
}

/**
 * Analyzes lyrics for flow, rhyme schemes, and provides feedback.
 * Tries Gemini first, falls back to OpenAI if Gemini fails.
 * @param {string} lyrics - The lyrics to analyze
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeLyrics(lyrics) {
  try {
    // Validate input
    if (!lyrics || lyrics?.trim()?.length === 0) {
      throw new Error('No lyrics provided for analysis.');
    }

    // Validate Gemini client
    if (!genAI) {
      console.error('[Lyric Analysis] Gemini client not initialized');
      throw new Error('AI service is not configured. Please check your API key settings.');
    }

    console.log('[Lyric Analysis] Starting analysis, lyrics length:', lyrics?.length);

    const model = genAI?.getGenerativeModel({ model: 'gemini-1.5-pro' });

    if (!model) {
      console.error('[Lyric Analysis] Failed to get generative model');
      throw new Error('Failed to initialize AI model. Please try again.');
    }

    const prompt = `Analyze these lyrics for:
1. Rhyme scheme patterns (end rhymes, internal rhymes, multisyllabic)
2. Flow analysis (rhythm, cadence, syllable patterns)
3. Wordplay techniques (metaphors, similes, double entendres, cultural references)
4. Strengths and areas for improvement
5. Overall rating (1-10)

Lyrics:
${lyrics}

Provide detailed, constructive feedback as a professional lyricist.`;

    console.log('[Lyric Analysis] Sending analysis request to Gemini API...');

    const result = await model?.generateContent(prompt);
    
    // Validate response
    if (!result) {
      console.error('[Lyric Analysis] No result returned from API');
      throw new Error('No response received from AI service. Please try again.');
    }

    const response = result?.response;
    
    if (!response) {
      console.error('[Lyric Analysis] No response object in result');
      throw new Error('Invalid response from AI service. Please try again.');
    }

    const analysisText = response?.text();
    
    if (!analysisText || analysisText?.trim()?.length === 0) {
      console.error('[Lyric Analysis] Empty analysis returned');
      throw new Error('AI service returned empty analysis. Please try again.');
    }

    console.log('[Lyric Analysis] Successfully generated analysis, length:', analysisText?.length);
    
    return {
      analysis: analysisText,
      timestamp: new Date()?.toISOString(),
      provider: 'gemini'
    };
  } catch (error) {
    console.error('[Lyric Analysis] Gemini error caught, attempting OpenAI fallback:', error?.message);
    
    // Attempt OpenAI fallback
    try {
      console.log('[Lyric Analysis] Falling back to OpenAI...');
      return await analyzeLyricsWithOpenAI(lyrics);
    } catch (openaiError) {
      console.error('[Lyric Analysis] OpenAI fallback also failed:', openaiError?.message);
      
      // Handle specific error types
      if (error?.message && error?.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API configuration.');
      }
      
      if (error?.message && error?.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later or check your billing.');
      }

      // Use Gemini error handler
      const errorInfo = handleGeminiError(error);
      
      if (errorInfo?.isInternal) {
        console.error('[Lyric Analysis] Internal error:', errorInfo?.message, errorInfo?.details);
      }
      
      throw new Error('Both Gemini and OpenAI failed to analyze lyrics. Please try again later.');
    }
  }
}