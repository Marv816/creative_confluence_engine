const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get Roman numeral degree
 */
function getRomanNumeralDegree(numeral) {
  const map = {
    'i': 0, 'I': 0, 'ii': 2, 'II': 2, 'iii': 4, 'III': 4,
    'iv': 5, 'IV': 5, 'v': 7, 'V': 7, 'vi': 9, 'VI': 9,
    'vii': 11, 'VII': 11
  };
  return map?.[numeral] !== undefined ? map?.[numeral] : null;
}

/**
 * Convert Roman numerals to chord names
 */
function convertRomanToNotes(romanStr, rootNote, isMinor) {
  const numerals = romanStr?.trim()?.split(/\s+/);
  const rootSemitone = NOTE_NAMES?.indexOf(rootNote?.replace(/[#b]/g, ''));
  if (rootSemitone === -1) return [];

  return numerals?.map(num => {
    const degree = getRomanNumeralDegree(num);
    if (degree === null) return null;

    let chordSemitone = (rootSemitone + degree) % 12;
    let chordName = NOTE_NAMES?.[chordSemitone];

    const isScaleMinor = !isMinor ? [2, 5]?.includes(degree) : [0, 2, 3, 5]?.includes(degree);
    if (isScaleMinor && num === num?.toLowerCase()) chordName += 'm';

    return chordName;
  })?.filter(c => c !== null);
}

/**
 * Create learning presets with music theory examples
 */
export function createLearningPresets() {
  let presets = [];

  const majorProgs = [
    { name: "Classic I-IV-V", progression: "I IV V", mood: "happy", complexity: "simple", tag: "Classic" },
    { name: "Modern I-V-vi-IV", progression: "I V vi IV", mood: "uplifting", complexity: "simple", tag: "Pop" },
    { name: "Emotional I-vi-IV-V", progression: "I vi IV V", mood: "emotional", complexity: "intermediate", tag: "Ballad" },
    { name: "Melancholic vi-IV-I-V", progression: "vi IV I V", mood: "melancholic", complexity: "intermediate", tag: "Sad Pop" },
    { name: "Energetic I-IV-I-V", progression: "I IV I V", mood: "energetic", complexity: "simple", tag: "Rock" },
    { name: "Blues IV-I-V", progression: "IV I V", mood: "bluesy", complexity: "simple", tag: "Blues" },
    { name: "Jazz ii-V-I", progression: "ii V I", mood: "smooth", complexity: "advanced", tag: "Jazz" },
  ];

  majorProgs?.forEach(prog => {
    const chords = convertRomanToNotes(prog?.progression, 'C', false);
    presets?.push({
      name: `[C Major] ${prog?.name}`,
      key: 'C',
      progression: chords,
      roman_numerals: prog?.progression?.split(/\s+/),
      mood: prog?.mood,
      complexity: prog?.complexity,
      instrument: 'piano',
      tempo: 90,
      groove: prog?.tag,
      suggested_scale: 'C Major',
      voicings: {},
      substitutions: [],
      learning: `${prog?.tag} progression. Roman: ${prog?.progression}`
    });
  });

  const minorProgs = [
    { name: "Classic i-VI-III-VII", progression: "i VI III VII", mood: "dark", complexity: "simple", tag: "Minor Rock" },
    { name: "Dramatic i-iv-V", progression: "i iv V", mood: "dramatic", complexity: "intermediate", tag: "Classical" },
    { name: "Gothic i-VII-VI-VII", progression: "i VII VI VII", mood: "gothic", complexity: "intermediate", tag: "Dark Pop" },
    { name: "Haunting i-VI-V", progression: "i VI V", mood: "haunting", complexity: "simple", tag: "Minor Blues" },
    { name: "Cinematic i-v-VI-VII", progression: "i v VI VII", mood: "cinematic", complexity: "advanced", tag: "Film Score" },
  ];

  minorProgs?.forEach(prog => {
    const chords = convertRomanToNotes(prog?.progression, 'A', true);
    presets?.push({
      name: `[A Minor] ${prog?.name}`,
      key: 'Am',
      progression: chords,
      roman_numerals: prog?.progression?.split(/\s+/),
      mood: prog?.mood,
      complexity: prog?.complexity,
      instrument: 'piano',
      tempo: 80,
      groove: prog?.tag,
      suggested_scale: 'A Natural Minor',
      voicings: {},
      substitutions: [],
      learning: `${prog?.tag} progression. Roman: ${prog?.progression}`
    });
  });

  return presets;
}

/**
 * Parse preset file (JSON, CSV, or text)
 */
export function parsePresetFile(text) {
  try {
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (je) { }

    let presets = [];
    if (parsed) {
      if (Array.isArray(parsed)) presets = parsed;
      else if (parsed?.presets && Array.isArray(parsed?.presets)) presets = parsed?.presets;
    } else {
      const lines = text?.split(/\r?\n/)?.map(l => l?.trim())?.filter(l => l?.length);
      const headers = lines?.[0]?.split(',')?.map(h => h?.trim()?.toLowerCase());
      for (let i = 1; i < lines?.length; i++) {
        const cols = lines?.[i]?.split(',');
        const obj = {};
        for (let j = 0; j < headers?.length; j++) {
          obj[headers[j]] = (cols?.[j] || '')?.trim();
        }
        if (obj?.progression) {
          obj.progression = obj?.progression?.split(/\||;/)?.map(s => s?.trim())?.filter(Boolean);
        }
        presets?.push(obj);
      }
    }

    const normalized = presets?.map(p => ({
      name: p?.name || p?.title || (p?.key ? `${p?.key} preset` : 'Preset'),
      key: p?.key || p?.tone || '',
      progression: p?.progression || (typeof p?.progression === 'string' ? p?.progression?.split(/\||;/)?.map(s => s?.trim()) : []),
      roman_numerals: p?.roman_numerals || [],
      tempo: p?.tempo || p?.bpm || null,
      groove: p?.groove || p?.style || '',
      voicings: p?.voicings || {},
      substitutions: p?.substitutions || [],
      mood: p?.mood || p?.vibe || '',
      complexity: p?.complexity || 'simple',
      instrument: p?.instrument || 'all',
      learning: p?.learning || ''
    }));

    return normalized;
  } catch (error) {
    console.error('Preset parsing error:', error);
    throw new Error('Could not parse preset file');
  }
}

/**
 * Export preset to JSON
 */
export function exportPresetToJson(preset) {
  const name = (preset?.name || 'preset')?.replace(/[^a-z0-9\-_]/gi, '_');
  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.json`;
  document.body?.appendChild(a);
  a?.click();
  a?.remove();
  URL.revokeObjectURL(url);
}
