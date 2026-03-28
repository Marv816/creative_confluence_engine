import React, { useState, useEffect } from 'react';
import { playNotes, noteNameToMidi } from '../../../services/audioService';

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = {
  'C#': 20, 'D#': 60, 'F#': 140, 'G#': 180, 'A#': 220
};

export default function PianoKeyboard({ highlightedNotes = [] }) {
  const [activeKeys, setActiveKeys] = useState(new Set());

  const handleKeyPress = async (noteName) => {
    const midi = noteNameToMidi(noteName);
    if (midi === null) return;

    setActiveKeys(prev => new Set(prev)?.add(noteName));
    await playNotes([midi], 0.5);

    setTimeout(() => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next?.delete(noteName);
        return next;
      });
    }, 500);
  };

  // Normalize highlighted note names for matching (e.g. "C4", "A#3")
  const normalizeNote = (n) => n?.replace('b', '#')?.trim();
  const highlightSet = new Set(highlightedNotes?.map(normalizeNote));

  const isHighlighted = (noteName) => {
    const norm = normalizeNote(noteName);
    // Also check without octave for broad matching
    const noOctave = norm?.replace(/\d+$/, '');
    return highlightSet?.has(norm) || [...highlightSet]?.some(h => h?.replace(/\d+$/, '') === noOctave);
  };

  const renderWhiteKeys = () => {
    const keys = [];
    for (let octave = 3; octave <= 4; octave++) {
      WHITE_KEYS?.forEach(note => {
        const noteName = `${note}${octave}`;
        const isActive = activeKeys?.has(noteName);
        const isHl = isHighlighted(noteName);

        keys?.push(
          <button
            key={noteName}
            onClick={() => handleKeyPress(noteName)}
            className={`relative w-10 h-32 border border-gray-700 rounded-b transition-all ${
              isActive
                ? 'bg-gradient-to-b from-purple-500 to-purple-700 transform translate-y-0.5'
                : isHl
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 transform translate-y-0.5 shadow-lg shadow-emerald-500/40'
                : 'bg-gradient-to-b from-gray-100 to-gray-300 hover:from-gray-200 hover:to-gray-400'
            }`}
          >
            <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-semibold">
              {note}
            </span>
          </button>
        );
      });
    }
    return keys;
  };

  const renderBlackKeys = () => {
    const keys = [];
    const whiteKeyWidth = 40;

    Object.entries(BLACK_KEYS)?.forEach(([note, baseOffset]) => {
      for (let octave = 3; octave <= 4; octave++) {
        const noteName = `${note}${octave}`;
        const isActive = activeKeys?.has(noteName);
        const isHl = isHighlighted(noteName);
        const whiteIndex = (octave - 3) * 7 + Math.floor(baseOffset / 40);
        const leftPosition = whiteIndex * whiteKeyWidth + (baseOffset % 40);

        keys?.push(
          <button
            key={noteName}
            onClick={(e) => {
              e?.stopPropagation();
              handleKeyPress(noteName);
            }}
            className={`absolute w-7 h-20 rounded-b z-10 transition-all ${
              isActive
                ? 'bg-gradient-to-b from-purple-600 to-purple-900 transform translate-y-0.5'
                : isHl
                ? 'bg-gradient-to-b from-emerald-500 to-emerald-800 transform translate-y-0.5 shadow-lg shadow-emerald-500/40'
                : 'bg-gradient-to-b from-gray-800 to-black hover:from-gray-700 hover:to-gray-900'
            }`}
            style={{ left: `${leftPosition}px` }}
          >
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-semibold">
              {note?.replace('#', '♯')}
            </span>
          </button>
        );
      }
    });

    return keys;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-center text-indigo-300">🎹 Virtual Piano</h3>
        {highlightedNotes?.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-300">Chord: {highlightedNotes?.map(n => n?.replace(/\d+$/, ''))?.join(' ')}</span>
          </div>
        )}
      </div>
      <div className="flex justify-center p-5 bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg">
        <div className="relative flex h-32">
          {renderWhiteKeys()}
          {renderBlackKeys()}
        </div>
      </div>
    </div>
  );
}
