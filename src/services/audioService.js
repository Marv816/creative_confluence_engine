import * as Tone from 'tone';
import Midgen from 'jsmidgen';

let sampler = null;
let samplerLoading = null;

/**
 * Initialize Tone.js sampler with professional piano samples
 * Does NOT auto-connect to destination so callers can route through volume nodes
 */
export async function initializeSampler() {
  if (sampler && sampler?.loaded) return sampler;
  if (samplerLoading) return samplerLoading;

  samplerLoading = new Promise((resolve, reject) => {
    const s = new Tone.Sampler({
      urls: {
        'A0': 'A0.mp3', 'C1': 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', 'A1': 'A1.mp3',
        'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', 'A2': 'A2.mp3',
        'C3': 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'A3': 'A3.mp3',
        'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', 'A4': 'A4.mp3',
        'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 'A5': 'A5.mp3',
        'C6': 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', 'A6': 'A6.mp3',
        'C7': 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3', 'A7': 'A7.mp3',
        'C8': 'C8.mp3'
      },
      baseUrl: 'https://nbrosowsky.github.io/tonejs-instruments/samples/piano/',
      onload: () => {
        sampler = s;
        samplerLoading = null; // Clear so it can reinitialize if needed
        resolve(s);
      },
      onerror: (e) => {
        sampler = null;
        samplerLoading = null;
        reject(e);
      }
    });
    // Do NOT call .toDestination() here — callers route through their own volume nodes
  });

  return samplerLoading;
}

/**
 * Dispose the sampler singleton so it can be reinitialized
 */
export function disposeSampler() {
  if (sampler) {
    try { sampler?.disconnect(); } catch (_) {}
    try { sampler?.dispose(); } catch (_) {}
    sampler = null;
  }
  samplerLoading = null;
}

/**
 * Convert note name to MIDI number
 */
export function noteNameToMidi(note) {
  const match = note?.match(/^([A-Ga-g])([#b]?)(\d?)$/);
  if (!match) return null;

  const [, letter, accidental, octStr] = match;
  const letterUpper = letter?.toUpperCase();
  const base = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }?.[letterUpper];
  let sem = base + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0);
  let octave = octStr ? parseInt(octStr, 10) : 4;
  return 12 * (octave + 1) + (sem % 12 + 12) % 12;
}

/**
 * Convert MIDI number to note name
 */
export function midiToNoteName(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames?.[midi % 12];
  return note + octave;
}

/**
 * Parse chord string to get root and quality
 */
export function parseChordString(chord) {
  const m = chord?.trim()?.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!m) return null;

  const root = m?.[1]?.toUpperCase() + (m?.[2] || '');
  const q = (m?.[3] || '')?.toLowerCase();
  const quality = q?.includes('maj7') ? 'maj7'
    : q?.includes('m7') ? 'm7'
    : q?.startsWith('m') ? 'm'
    : q?.includes('7') ? '7'
    : q?.startsWith('sus2') ? 'sus2'
    : q?.startsWith('sus4') ? 'sus4'
    : q?.includes('6') ? '6'
    : 'maj';

  return { root, quality };
}

/**
 * Chord quality intervals
 */
const QUALITY_INTERVALS = {
  'maj': [0, 4, 7],
  'm': [0, 3, 7],
  '7': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'm7': [0, 3, 7, 10],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  '6': [0, 4, 7, 9]
};

/**
 * Convert chord name to MIDI notes
 */
export function chordToMidiNotes(chordName, rootOctave = 4) {
  const parsed = parseChordString(chordName);
  if (!parsed) return [];

  const rootNote = parsed?.root + (rootOctave || 4);
  const rootMidi = noteNameToMidi(rootNote);
  if (rootMidi === null) return [];

  const ints = QUALITY_INTERVALS?.[parsed?.quality] || QUALITY_INTERVALS?.['maj'];
  return ints?.map(i => rootMidi + i);
}

// Standalone volume node for playNotes / playProgression (not ChordPlaybackPanel)
let standaloneVolNode = null;

/**
 * Play notes with Tone.js — standalone routing (not via ChordPlaybackPanel)
 */
export async function playNotes(midiNotes, duration = 0.9) {
  try {
    await Tone?.start();
    const samp = await initializeSampler();

    // Always disconnect sampler from any previous routing before standalone play
    try { samp?.disconnect(); } catch (_) {}

    // Dispose previous standalone vol node
    if (standaloneVolNode) {
      try { standaloneVolNode?.dispose(); } catch (_) {}
      standaloneVolNode = null;
    }

    // Create fresh standalone volume node
    standaloneVolNode = new Tone.Volume(0);
    standaloneVolNode?.toDestination();
    samp?.connect(standaloneVolNode);

    const noteNames = midiNotes?.map(midiToNoteName);
    samp?.triggerAttackRelease(noteNames, duration);
  } catch (error) {
    console.error('Audio playback error:', error);
  }
}

/**
 * Arpeggiate notes
 */
export function arpeggiateNotes(midiNotes, mode) {
  let result = [...midiNotes];
  if (mode === 'up') result?.sort((a, b) => a - b);
  else if (mode === 'down') result?.sort((a, b) => b - a);
  else if (mode === 'alternate') {
    const up = [...midiNotes]?.sort((a, b) => a - b);
    const down = [...up]?.reverse();
    result = [...up, ...down?.slice(1)];
  }
  return result;
}

/**
 * Play arpeggiated chord
 */
export async function playArpeggiatedChord(midiNotes, duration, mode, swingPercent, tempo) {
  if (mode === 'none') {
    await playNotes(midiNotes, duration);
    return;
  }

  const arpNotes = arpeggiateNotes(midiNotes, mode);
  const noteDuration = duration / arpNotes?.length * 0.7;
  const delayBase = (60 / tempo) * 0.25;

  for (let i = 0; i < arpNotes?.length; i++) {
    const swing = i % 2 === 1 ? (delayBase * swingPercent / 100) : 0;
    await new Promise(r => setTimeout(r, delayBase * 1000 + swing * 1000));
    await playNotes([arpNotes?.[i]], noteDuration);
  }
}

/**
 * Play chord progression
 */
export async function playProgression(progression, tempo = 90, arpMode = 'none', swing = 0) {
  const durationPer = Math.max(0.6, (60 / tempo) * 2);

  for (let i = 0; i < progression?.length; i++) {
    const chordName = progression?.[i];
    const notes = chordToMidiNotes(chordName);
    if (notes?.length === 0) continue;

    await playArpeggiatedChord(notes, durationPer, arpMode, swing, tempo);
  }
}

/**
 * Export preset to MIDI file
 */
export function exportPresetToMidi(preset) {
  try {
    const file = new Midgen.File();
    const track = new Midgen.Track();
    file?.addTrack(track);

    const tempo = preset?.tempo || 90;
    track?.setTempo(tempo);

    preset?.progression?.forEach(chordName => {
      const notes = chordToMidiNotes(chordName);
      notes?.forEach(midiNote => {
        track?.addNote(0, midiNote, 128, 0, 100);
      });
      track?.addNote(0, notes?.[0], 128, 128);
    });

    const blob = new Blob([file.toBytes()], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(preset?.name || 'progression')?.replace(/[^a-z0-9]/gi, '_')}.mid`;
    document.body?.appendChild(a);
    a?.click();
    a?.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('MIDI export error:', error);
    throw new Error('Failed to export MIDI file');
  }
}
