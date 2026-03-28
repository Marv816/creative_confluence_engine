import * as Tone from 'tone';
import Midgen from 'jsmidgen';
import { supabase } from '../lib/supabase';

// Synthesized drum kit — no external audio files needed
let drumKit = null;

/**
 * Create synthesized drum sounds using Tone.js built-in synths
 */
function createDrumKit() {
  if (drumKit) return drumKit;

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
  })?.toDestination();

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 }
  })?.toDestination();
  const snareBody = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 }
  })?.toDestination();

  const hihatClosed = new Tone.MetalSynth({
    frequency: 400,
    envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  })?.toDestination();

  const hihatOpen = new Tone.MetalSynth({
    frequency: 400,
    envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  })?.toDestination();

  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 }
  })?.toDestination();

  const tomLow = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 }
  })?.toDestination();

  const tomMid = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.08 }
  })?.toDestination();

  const tomHigh = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.06 }
  })?.toDestination();

  const crash = new Tone.MetalSynth({
    frequency: 300,
    envelope: { attack: 0.001, decay: 1.0, release: 0.5 },
    harmonicity: 5.1,
    modulationIndex: 64,
    resonance: 4000,
    octaves: 1.5
  })?.toDestination();

  const ride = new Tone.MetalSynth({
    frequency: 350,
    envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
    harmonicity: 5.1,
    modulationIndex: 48,
    resonance: 4000,
    octaves: 1.5
  })?.toDestination();

  drumKit = { kick, snare, snareBody, hihatClosed, hihatOpen, clap, tomLow, tomMid, tomHigh, crash, ride };
  return drumKit;
}

/**
 * Trigger a synthesized drum hit by track name
 */
export function triggerDrumHit(trackName, time) {
  const kit = createDrumKit();
  const now = time || Tone?.now();

  switch (trackName) {
    case 'kick': kit?.kick?.triggerAttackRelease('C1', '8n', now);
      break;
    case 'snare': kit?.snare?.triggerAttackRelease('16n', now);
      kit?.snareBody?.triggerAttackRelease('D2', '16n', now);
      break;
    case 'hihat': kit?.hihatClosed?.triggerAttackRelease('32n', now);
      break;
    case 'openhat': kit?.hihatOpen?.triggerAttackRelease('16n', now);
      break;
    case 'clap': kit?.clap?.triggerAttackRelease('16n', now);
      break;
    case 'tom1': case'tom-low': kit?.tomLow?.triggerAttackRelease('G1', '8n', now);
      break;
    case 'tom2': case'tom-mid': kit?.tomMid?.triggerAttackRelease('B1', '8n', now);
      break;
    case 'tom3': case'tom-high': kit?.tomHigh?.triggerAttackRelease('D2', '8n', now);
      break;
    case 'crash': kit?.crash?.triggerAttackRelease('16n', now);
      break;
    case 'ride': kit?.ride?.triggerAttackRelease('16n', now);
      break;
    default:
      kit?.kick?.triggerAttackRelease('C1', '8n', now);
  }
}

// Keep legacy exports for compatibility
export async function initializeDrumSampler() {
  createDrumKit();
  return { loaded: true, triggerAttackRelease: () => {} };
}

/**
 * Drum track MIDI note mapping
 */
export const DRUM_NOTES = {
  kick: 'C1',
  snare: 'D1',
  hihat: 'F#1',
  openhat: 'A#1',
  clap: 'E1',
  tom1: 'G1',
  tom2: 'B1',
  tom3: 'D2',
  crash: 'C#2',
  ride: 'G#1'
};

/**
 * Convert drum note name to MIDI number
 */
export function drumNoteToMidi(noteName) {
  const midiMap = {
    'C1': 36,
    'D1': 38,
    'E1': 40,
    'F#1': 42,
    'G1': 43,
    'G#1': 44,
    'A#1': 46,
    'B1': 47,
    'C#2': 49,
    'D2': 50
  };
  return midiMap?.[noteName] || 36;
}

/**
 * Play single drum hit
 */
export async function playDrumHit(track) {
  try {
    await Tone?.start();
    triggerDrumHit(track);
  } catch (error) {
    console.error('Drum hit playback error:', error);
  }
}

/**
 * Play drum pattern
 */
export async function playDrumPattern(pattern, bpm = 120, swing = 0, loop = false) {
  try {
    await Tone?.start();
    createDrumKit();

    Tone.Transport.bpm.value = bpm;
    Tone.Transport.swing = swing / 100;

    const tracks = Object.keys(pattern);
    const steps = pattern?.[tracks?.[0]]?.length || 16;

    const part = new Tone.Part((time, step) => {
      tracks?.forEach(track => {
        if (pattern?.[track]?.[step]) {
          triggerDrumHit(track, time);
        }
      });
    }, Array.from({ length: steps }, (_, i) => [i * (60 / bpm / 4), i]));

    part.loop = loop;
    part.loopEnd = steps * (60 / bpm / 4);
    part?.start(0);

    Tone?.Transport?.start();

    return () => {
      part?.stop();
      part?.dispose();
      Tone?.Transport?.stop();
    };
  } catch (error) {
    console.error('Pattern playback error:', error);
    throw error;
  }
}

/**
 * Stop all drum playback
 */
export function stopDrumPlayback() {
  Tone?.Transport?.stop();
  Tone?.Transport?.cancel();
}

/**
 * Export drum pattern to MIDI file
 */
export function exportPatternToMidi(pattern, name = 'drum_pattern', bpm = 120) {
  try {
    const file = new Midgen.File();
    const track = new Midgen.Track();
    file?.addTrack(track);

    track?.setTempo(bpm);

    const tracks = Object.keys(pattern);
    const steps = pattern?.[tracks?.[0]]?.length || 16;
    const ticksPerStep = 128;

    tracks?.forEach(trackName => {
      pattern?.[trackName]?.forEach((hit, stepIndex) => {
        if (hit) {
          const note = DRUM_NOTES?.[trackName];
          const midiNote = drumNoteToMidi(note);
          const startTime = stepIndex * ticksPerStep;

          track?.addNote(0, midiNote, ticksPerStep / 2, startTime, 100);
        }
      });
    });

    const blob = new Blob([file.toBytes()], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name?.replace(/[^a-z0-9]/gi, '_')}.mid`;
    document.body?.appendChild(a);
    a?.click();
    a?.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('MIDI export error:', error);
    throw new Error('Failed to export MIDI file');
  }
}

/**
 * Create genre preset patterns
 */
export function createGenrePresets() {
  return [
    {
      name: 'Trap Basic',
      genre: 'trap',
      bpm: 140,
      steps: 16,
      pattern: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        openhat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]
      }
    },
    {
      name: 'Boom Bap Classic',
      genre: 'boom_bap',
      bpm: 90,
      steps: 16,
      pattern: {
        kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
      }
    },
    {
      name: 'House Four-on-Floor',
      genre: 'house',
      bpm: 128,
      steps: 16,
      pattern: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        openhat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]
      }
    },
    {
      name: 'Lo-Fi Chill',
      genre: 'lofi',
      bpm: 85,
      steps: 16,
      pattern: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
      }
    },
    {
      name: 'DnB Breakbeat',
      genre: 'dnb',
      bpm: 174,
      steps: 16,
      pattern: {
        kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
    },
    {
      name: 'Techno Minimal',
      genre: 'techno',
      bpm: 135,
      steps: 16,
      pattern: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        openhat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
      }
    }
  ];
}

/**
 * Create empty pattern
 */
export function createEmptyPattern(steps = 16) {
  return {
    kick: Array(steps)?.fill(0),
    snare: Array(steps)?.fill(0),
    hihat: Array(steps)?.fill(0),
    openhat: Array(steps)?.fill(0)
  };
}

/**
 * Save pattern to Supabase
 */
export async function savePattern(pattern, name, bpm, swing, genre, userId) {
  try {
    const { data, error } = await supabase
      ?.from('drum_patterns')
      ?.insert({
        user_id: userId,
        name,
        pattern_data: pattern,
        bpm,
        swing,
        genre
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Save pattern error:', error);
    throw new Error('Failed to save pattern');
  }
}

/**
 * Load user patterns from Supabase
 */
export async function loadUserPatterns(userId) {
  try {
    const { data, error } = await supabase
      ?.from('drum_patterns')
      ?.select('*')
      ?.eq('user_id', userId)
      ?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Load patterns error:', error);
    throw new Error('Failed to load patterns');
  }
}

/**
 * Delete pattern from Supabase
 */
export async function deletePattern(patternId) {
  try {
    const { error } = await supabase
      ?.from('drum_patterns')
      ?.delete()
      ?.eq('id', patternId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Delete pattern error:', error);
    throw new Error('Failed to delete pattern');
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(patternId, isFavorite) {
  try {
    const { error } = await supabase
      ?.from('drum_patterns')
      ?.update({ is_favorite: isFavorite })
      ?.eq('id', patternId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Toggle favorite error:', error);
    throw new Error('Failed to update favorite status');
  }
}