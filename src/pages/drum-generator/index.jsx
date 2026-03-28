import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Music4, Play, Square, Download, Save, Trash2, Star } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import BeatPlaybackPanel from './components/BeatPlaybackPanel';
import {
  initializeDrumSampler,
  playDrumPattern,
  stopDrumPlayback,
  playDrumHit,
  exportPatternToMidi,
  createGenrePresets,
  createEmptyPattern,
  savePattern,
  loadUserPatterns,
  deletePattern,
  toggleFavorite
} from '../../services/drumService';

const TRACK_NAMES = [
  { id: 'kick', label: 'Kick', color: 'bg-red-500' },
  { id: 'snare', label: 'Snare', color: 'bg-blue-500' },
  { id: 'hihat', label: 'Hi-Hat', color: 'bg-yellow-500' },
  { id: 'openhat', label: 'Open Hat', color: 'bg-green-500' },
  { id: 'clap', label: 'Clap', color: 'bg-purple-500' },
  { id: 'crash', label: 'Crash', color: 'bg-pink-500' }
];

const PATTERN_LENGTH_OPTIONS = [
  { value: '8', label: '8 Steps (1/2 bar)' },
  { value: '16', label: '16 Steps (1 bar)' },
  { value: '32', label: '32 Steps (2 bars)' }
];

export default function DrumGenerator() {
  const { user } = useAuth();
  const [pattern, setPattern] = useState(createEmptyPattern(16));
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0);
  const [steps, setSteps] = useState(16);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stopPlayback, setStopPlayback] = useState(null);
  const [genrePresets, setGenrePresets] = useState([]);
  const [userPatterns, setUserPatterns] = useState([]);
  const [patternName, setPatternName] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('custom');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    initializeDrumSampler();
    setGenrePresets(createGenrePresets());
    if (user?.id) {
      loadPatterns();
    }
  }, [user]);

  const loadPatterns = async () => {
    try {
      const patterns = await loadUserPatterns(user?.id);
      setUserPatterns(patterns);
    } catch (error) {
      showFeedback(error?.message, 'error');
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const toggleStep = (track, stepIndex) => {
    setPattern(prev => ({
      ...prev,
      [track]: prev?.[track]?.map((val, idx) => idx === stepIndex ? (val ? 0 : 1) : val)
    }));
  };

  const handlePlay = async () => {
    if (isPlaying) {
      stopPlayback?.();
      stopDrumPlayback();
      setIsPlaying(false);
      setStopPlayback(null);
    } else {
      try {
        const stop = await playDrumPattern(pattern, bpm, swing, true);
        setStopPlayback(() => stop);
        setIsPlaying(true);
        showFeedback('Playing pattern...');
      } catch (error) {
        showFeedback(error?.message, 'error');
      }
    }
  };

  const handleExportMidi = () => {
    try {
      const name = patternName || `drum_pattern_${Date.now()}`;
      exportPatternToMidi(pattern, name, bpm);
      showFeedback('MIDI file exported!');
    } catch (error) {
      showFeedback(error?.message, 'error');
    }
  };

  const handleSavePattern = async () => {
    if (!user?.id) {
      showFeedback('Please sign in to save patterns', 'error');
      return;
    }

    if (!patternName?.trim()) {
      showFeedback('Please enter a pattern name', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await savePattern(pattern, patternName, bpm, swing, selectedGenre, user?.id);
      showFeedback('Pattern saved successfully!');
      setPatternName('');
      await loadPatterns();
    } catch (error) {
      showFeedback(error?.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPreset = (preset) => {
    setPattern(preset?.pattern);
    setBpm(preset?.bpm);
    setSteps(preset?.steps);
    setSelectedGenre(preset?.genre);
    setPatternName(preset?.name);
    showFeedback(`Loaded preset: ${preset?.name}`);
  };

  const handleLoadUserPattern = (userPattern) => {
    setPattern(userPattern?.pattern_data);
    setBpm(userPattern?.bpm);
    setSwing(userPattern?.swing);
    setSteps(userPattern?.pattern_data?.kick?.length || 16);
    setSelectedGenre(userPattern?.genre);
    setPatternName(userPattern?.name);
    showFeedback(`Loaded pattern: ${userPattern?.name}`);
  };

  const handleDeletePattern = async (patternId) => {
    if (!confirm('Delete this pattern?')) return;

    try {
      await deletePattern(patternId);
      showFeedback('Pattern deleted');
      await loadPatterns();
    } catch (error) {
      showFeedback(error?.message, 'error');
    }
  };

  const handleToggleFavorite = async (patternId, currentFavorite) => {
    try {
      await toggleFavorite(patternId, !currentFavorite);
      await loadPatterns();
    } catch (error) {
      showFeedback(error?.message, 'error');
    }
  };

  const handleClearPattern = () => {
    setPattern(createEmptyPattern(steps));
    showFeedback('Pattern cleared');
  };

  const handleStepsChange = (newSteps) => {
    const stepsNum = parseInt(newSteps);
    setSteps(stepsNum);
    setPattern(createEmptyPattern(stepsNum));
  };

  return (
    <>
      <Helmet>
        <title>Drum Generator - Lyrical Metaverse</title>
        <meta name="description" content="Create professional drum patterns with step sequencer and genre presets" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music4 className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold text-white">Drum Generator</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Design beats with professional step sequencer. Create patterns, preview audio, and export MIDI files.
            </p>
          </div>

          {/* Feedback */}
          {feedback?.message && (
            <div className={`mb-6 p-4 rounded-lg text-center ${feedback?.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
              {feedback?.message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Sequencer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Controls */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">BPM</label>
                    <Input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(parseInt(e?.target?.value) || 120)}
                      min="40"
                      max="300"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Swing (%)</label>
                    <Input
                      type="number"
                      value={swing}
                      onChange={(e) => setSwing(parseInt(e?.target?.value) || 0)}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pattern Length</label>
                    <Select
                      value={steps?.toString()}
                      onChange={(val) => handleStepsChange(val)}
                      options={PATTERN_LENGTH_OPTIONS}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handlePlay}
                      className={`w-full ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleClearPattern}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    onClick={handleExportMidi}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export MIDI
                  </Button>
                </div>

                {/* Beat Playback Panel */}
                <div className="mt-4">
                  <BeatPlaybackPanel
                    pattern={pattern}
                    bpm={bpm}
                    swing={swing}
                    steps={steps}
                    onCurrentStepChange={setActiveStep}
                  />
                </div>
              </div>

              {/* Step Sequencer */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-4">Step Sequencer</h3>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {TRACK_NAMES?.map(track => (
                      <div key={track?.id} className="flex items-center gap-2 mb-3">
                        <button
                          onClick={() => playDrumHit(track?.id)}
                          className="w-20 text-left text-sm font-semibold text-gray-300 hover:text-white transition"
                        >
                          {track?.label}
                        </button>
                        <div className="flex gap-1 flex-1">
                          {pattern?.[track?.id]?.slice(0, steps)?.map((active, idx) => (
                            <button
                              key={idx}
                              onClick={() => toggleStep(track?.id, idx)}
                              className={`flex-1 h-10 rounded transition-all ${
                                active
                                  ? `${track?.color} shadow-lg scale-105`
                                  : 'bg-gray-700 hover:bg-gray-600'
                              } ${idx % 4 === 0 ? 'border-l-2 border-purple-500/50' : ''} ${
                                activeStep === idx ? 'ring-2 ring-white/40' : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Pattern */}
              {user?.id && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">Save Pattern</h3>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      value={patternName}
                      onChange={(e) => setPatternName(e?.target?.value)}
                      placeholder="Pattern name..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSavePattern}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Genre Presets */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-4">Genre Presets</h3>
                <div className="space-y-2">
                  {genrePresets?.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadPreset(preset)}
                      className="w-full text-left bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition"
                    >
                      <div className="font-semibold text-purple-300">{preset?.name}</div>
                      <div className="text-xs text-gray-400">{preset?.bpm} BPM • {preset?.steps} steps</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Patterns */}
              {user?.id && userPatterns?.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">Your Patterns</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {userPatterns?.map((userPattern) => (
                      <div
                        key={userPattern?.id}
                        className="bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <button
                            onClick={() => handleLoadUserPattern(userPattern)}
                            className="flex-1 text-left"
                          >
                            <div className="font-semibold text-purple-300">{userPattern?.name}</div>
                            <div className="text-xs text-gray-400">
                              {userPattern?.bpm} BPM • {userPattern?.genre}
                            </div>
                          </button>
                          <button
                            onClick={() => handleToggleFavorite(userPattern?.id, userPattern?.is_favorite)}
                            className="ml-2"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                userPattern?.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                              }`}
                            />
                          </button>
                        </div>
                        <Button
                          onClick={() => handleDeletePattern(userPattern?.id)}
                          variant="ghost"
                          size="xs"
                          className="w-full text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}