import React, { useState, useEffect } from 'react';
import { Guitar, Play, Download, Upload, Save } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import PianoKeyboard from './PianoKeyboard';
import ChordPlaybackPanel from './ChordPlaybackPanel';
import { generateChordProgression } from '../../../services/musicTheoryService';
import { playProgression, exportPresetToMidi } from '../../../services/audioService';
import { createLearningPresets, parsePresetFile, exportPresetToJson } from '../../../services/presetService';

const MOOD_OPTIONS = [
  { value: 'chill', label: 'Chill' },
  { value: 'upbeat', label: 'Upbeat' },
  { value: 'dark', label: 'Dark' },
  { value: 'jazzy', label: 'Jazzy' },
  { value: 'soulful', label: 'Soulful' }
];

const COMPLEXITY_OPTIONS = [
  { value: 'simple', label: 'Simple (triads)' },
  { value: 'intermediate', label: 'Intermediate (7ths)' },
  { value: 'advanced', label: 'Advanced (extensions)' }
];

const INSTRUMENT_OPTIONS = [
  { value: 'all', label: 'All Instruments' },
  { value: 'guitar', label: 'Guitar' },
  { value: 'piano', label: 'Piano/Keys' },
  { value: 'synth', label: 'Synth/Pad' }
];

const ARP_MODE_OPTIONS = [
  { value: 'none', label: 'None (play together)' },
  { value: 'up', label: 'Up' },
  { value: 'down', label: 'Down' },
  { value: 'alternate', label: 'Alternate' }
];

export default function MusicTheoryTab({ onCopyToNotepad, onShowFeedback }) {
  const [chordKey, setChordKey] = useState('');
  const [mood, setMood] = useState('chill');
  const [complexity, setComplexity] = useState('simple');
  const [instrument, setInstrument] = useState('all');
  const [arpMode, setArpMode] = useState('none');
  const [swing, setSwing] = useState(0);
  const [tempo, setTempo] = useState(90);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chordResults, setChordResults] = useState(null);
  const [learningPresets, setLearningPresets] = useState([]);
  const [userPresets, setUserPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showPiano, setShowPiano] = useState(false);
  const [highlightedNotes, setHighlightedNotes] = useState([]);
  const [activeChordIdx, setActiveChordIdx] = useState(-1);

  const handleGenerate = async () => {
    if (!chordKey?.trim()) {
      onShowFeedback?.('Please enter a key (e.g., Am, C, G#m)', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const data = await generateChordProgression({ key: chordKey, mood, complexity, instrument });
      // Normalize: ensure progression and roman_numerals are always arrays
      const normalized = {
        ...data,
        progression: Array.isArray(data?.progression)
          ? data?.progression
          : typeof data?.progression === 'string'
            ? data?.progression?.split(/[\s,\-–]+/)?.filter(Boolean)
            : [],
        roman_numerals: Array.isArray(data?.roman_numerals)
          ? data?.roman_numerals
          : typeof data?.roman_numerals === 'string'
            ? data?.roman_numerals?.split(/[\s,\-–]+/)?.filter(Boolean)
            : [],
        substitutions: Array.isArray(data?.substitutions)
          ? data?.substitutions
          : typeof data?.substitutions === 'string'
            ? [data?.substitutions]
            : [],
      };
      setChordResults(normalized);
      onShowFeedback?.('Chord progression generated!', 'success');
    } catch (error) {
      onShowFeedback?.(error?.message || 'Failed to generate chords', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayProgression = async () => {
    if (!chordResults?.progression) {
      onShowFeedback?.('Generate a progression first', 'error');
      return;
    }

    try {
      await playProgression(chordResults?.progression, tempo, arpMode, swing);
      onShowFeedback?.('Playing progression...', 'success');
    } catch (error) {
      onShowFeedback?.(error?.message || 'Playback failed', 'error');
    }
  };

  const handleExportJson = () => {
    if (!chordResults) {
      onShowFeedback?.('Generate a progression first', 'error');
      return;
    }

    const preset = {
      name: `${chordKey} ${mood} progression`,
      key: chordKey,
      ...chordResults,
      tempo,
      arpMode,
      swing
    };

    exportPresetToJson(preset);
    onShowFeedback?.('Preset exported as JSON!', 'success');
  };

  const handleExportMidi = () => {
    if (!chordResults) {
      onShowFeedback?.('Generate a progression first', 'error');
      return;
    }

    const preset = {
      name: `${chordKey} ${mood} progression`,
      progression: chordResults?.progression,
      tempo
    };

    try {
      exportPresetToMidi(preset);
      onShowFeedback?.('MIDI file exported!', 'success');
    } catch (error) {
      onShowFeedback?.(error?.message || 'MIDI export failed', 'error');
    }
  };

  const handleLoadLearningPresets = () => {
    const presets = createLearningPresets();
    setLearningPresets(presets);
    setShowPiano(true);
    onShowFeedback?.(`Loaded ${presets?.length} learning presets!`, 'success');
  };

  const handleFileUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const presets = parsePresetFile(reader?.result);
        setUserPresets(presets);
        onShowFeedback?.(`Loaded ${presets?.length} presets from file!`, 'success');
      } catch (error) {
        onShowFeedback?.(error?.message || 'Failed to parse file', 'error');
      }
    };
    reader?.readAsText(file);
  };

  const handlePlayPreset = async (preset) => {
    try {
      await playProgression(preset?.progression, preset?.tempo || tempo, arpMode, swing);
      onShowFeedback?.(`Playing ${preset?.name}...`, 'success');
    } catch (error) {
      onShowFeedback?.(error?.message || 'Playback failed', 'error');
    }
  };

  const renderChordResults = () => {
    if (!chordResults) return null;

    return (
      <div className="space-y-4">
        {/* Progression */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <h4 className="text-sm font-semibold text-purple-300 mb-3">
            Progression — {chordKey} ({mood})
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {Array.isArray(chordResults?.progression) ? (
              chordResults?.progression?.map((chord, idx) => (
                <div key={idx} className="bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="text-white font-semibold">{chord}</div>
                  {chordResults?.roman_numerals?.[idx] && (
                    <div className="text-xs text-gray-400">{chordResults?.roman_numerals?.[idx]}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-gray-700 px-4 py-2 rounded-lg">
                <div className="text-white font-semibold">
                  {chordResults?.progression || 'No progression'}
                </div>
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onCopyToNotepad?.(chordResults?.progression?.join(' - '))}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Copy Progression
          </Button>
        </div>

        {/* Voicings */}
        {chordResults?.voicings && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['guitar', 'piano', 'synth']?.map(inst => {
              const voicings = chordResults?.voicings?.[inst];
              if (!voicings?.length) return null;

              return (
                <div key={inst} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 capitalize">
                    {inst} Voicings
                  </h4>
                  <div className="space-y-2">
                    {voicings?.map((v, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-white font-medium">{v?.chord}</span>
                        <span className="text-gray-400 ml-2">— {v?.voicing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Performance Notes */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <h4 className="text-sm font-semibold text-purple-300 mb-3">Performance Notes</h4>
          <div className="space-y-2 text-sm text-gray-300">
            {chordResults?.tempo && <div>Tempo: {chordResults?.tempo} BPM</div>}
            {chordResults?.groove && <div>Groove: {chordResults?.groove}</div>}
            {chordResults?.suggested_scale && <div>Scale: {chordResults?.suggested_scale}</div>}
          </div>
        </div>

        {/* Substitutions */}
        {chordResults?.substitutions?.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-sm font-semibold text-purple-300 mb-3">Reharmonization Ideas</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              {Array.isArray(chordResults?.substitutions) ? (
                chordResults?.substitutions?.map((sub, idx) => (
                  <li key={idx}>• {sub}</li>
                ))
              ) : (
                <li>• {chordResults?.substitutions || 'No substitutions'}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Chord Generator */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Guitar className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Chord Progression Generator</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Generate progressions, voicings, and groove suggestions.</p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <Input
            type="text"
            value={chordKey}
            onChange={(e) => setChordKey(e?.target?.value)}
            placeholder="Key (e.g., Am, C)"
          />
          <Select value={mood} onChange={setMood} options={MOOD_OPTIONS} />
          <Select value={complexity} onChange={setComplexity} options={COMPLEXITY_OPTIONS} />
          <Select value={instrument} onChange={setInstrument} options={INSTRUMENT_OPTIONS} />
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {isGenerating ? 'Generating...' : 'Generate Chords'}
          </Button>
          <Button
            onClick={handlePlayProgression}
            disabled={!chordResults}
            className="bg-rose-600 hover:bg-rose-700"
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>

        {/* Playback Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Arpeggiator</label>
            <Select value={arpMode} onChange={setArpMode} options={ARP_MODE_OPTIONS} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Swing ({swing}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={swing}
              onChange={(e) => setSwing(parseInt(e?.target?.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tempo (BPM)</label>
            <Input
              type="number"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e?.target?.value))}
              min="40"
              max="240"
            />
          </div>
        </div>

        {/* Chord Playback Panel */}
        {chordResults?.progression && (
          <div className="mb-4">
            <ChordPlaybackPanel
              progression={chordResults?.progression}
              tempo={tempo}
              arpMode={arpMode}
              swing={swing}
              onHighlightNotes={setHighlightedNotes}
              onChordChange={setActiveChordIdx}
            />
          </div>
        )}

        {/* Export Controls */}
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json,.csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="preset-upload"
          />
          <label htmlFor="preset-upload">
            <Button as="span" className="bg-indigo-600 hover:bg-indigo-700">
              <Upload className="w-4 h-4 mr-2" />
              Load Presets
            </Button>
          </label>
          <Button
            onClick={handleExportJson}
            disabled={!chordResults}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            onClick={handleExportMidi}
            disabled={!chordResults}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export MIDI
          </Button>
        </div>
      </div>

      {/* Learning Presets */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">📚 Learning Presets</h3>
          <Button
            onClick={handleLoadLearningPresets}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Load Presets
          </Button>
        </div>
        <p className="text-sm text-gray-400 mb-4">Music theory examples to learn and play.</p>

        {learningPresets?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {learningPresets?.map((preset, idx) => (
              <div key={idx} className="bg-gray-900/50 rounded-lg p-3">
                <h4 className="font-semibold text-sm text-indigo-300 mb-1">{preset?.name}</h4>
                <p className="text-xs text-gray-400 mb-2">{preset?.learning}</p>
                <p className="text-xs text-emerald-300 font-mono mb-2">
                  {preset?.progression?.join(' • ')}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    onClick={() => handlePlayPreset(preset)}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    ▶ Play
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => onCopyToNotepad?.(`${preset?.name}\n${preset?.progression?.join(' - ')}`)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Piano Keyboard */}
      {showPiano && <PianoKeyboard highlightedNotes={highlightedNotes} />}

      {/* Chord Results */}
      {renderChordResults()}
    </div>
  );
}
