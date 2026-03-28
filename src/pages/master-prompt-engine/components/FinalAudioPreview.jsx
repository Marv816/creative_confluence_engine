import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { Play, Pause, Square, Volume2, VolumeX, Sparkles, Music } from 'lucide-react';
import { initializeDrumSampler, DRUM_NOTES } from '../../../services/drumService';
import { initializeSampler, chordToMidiNotes, midiToNoteName } from '../../../services/audioService';

const DEFAULT_BEAT = {
  kick:    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
  snare:   [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  hihat:   [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
  clap:    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
};

const DEFAULT_CHORDS = ['Am', 'F', 'C', 'G'];

export default function FinalAudioPreview({ bpm = 90, chords, genre, mood }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(75);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentChord, setCurrentChord] = useState(-1);
  const [mode, setMode] = useState('both'); // 'beat', 'chords', 'both'
  const partRef = useRef(null);
  const chordTimerRef = useRef(null);
  const chordLoopRef = useRef(false);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const waveDataRef = useRef(Array.from({ length: 64 }, () => Math.random() * 0.2 + 0.05));
  const currentStepRef = useRef(-1);

  const progression = chords?.length > 0 ? chords : DEFAULT_CHORDS;
  const parsedBpm = parseInt(bpm) || 90;

  function volumeToDb(v) {
    if (v === 0) return -Infinity;
    return 20 * Math.log10(v / 100);
  }

  const stopAll = useCallback(() => {
    if (partRef?.current) { partRef?.current?.stop(); partRef?.current?.dispose(); partRef.current = null; }
    Tone?.Transport?.stop();
    Tone?.Transport?.cancel();
    chordLoopRef.current = false;
    if (chordTimerRef?.current) clearTimeout(chordTimerRef?.current);
    setIsPlaying(false);
    setCurrentStep(-1);
    setCurrentChord(-1);
    currentStepRef.current = -1;
  }, []);

  const handlePlay = async () => {
    if (isPlaying) { stopAll(); return; }
    setIsLoading(true);
    try {
      await Tone?.start();
      const volDb = isMuted ? -Infinity : volumeToDb(volume);
      const volNode = new Tone.Volume(volDb)?.toDestination();

      if (mode === 'beat' || mode === 'both') {
        const drumSampler = await initializeDrumSampler();
        drumSampler?.connect(volNode);
        Tone.Transport.bpm.value = parsedBpm;
        const numSteps = 16;
        const part = new Tone.Part((time, step) => {
          currentStepRef.current = step;
          setCurrentStep(step);
          Object.keys(DEFAULT_BEAT).forEach(track => {
            if (DEFAULT_BEAT[track][step]) {
              const note = DRUM_NOTES[track];
              if (note) drumSampler.triggerAttackRelease(note, '16n', time);
            }
          });
        }, Array.from({ length: numSteps }, (_, i) => [i * (60 / parsedBpm / 4), i]));
        part.loop = true;
        part.loopEnd = numSteps * (60 / parsedBpm / 4);
        part?.start(0);
        partRef.current = part;
        Tone?.Transport?.start();
      }

      if (mode === 'chords' || mode === 'both') {
        const pianSampler = await initializeSampler();
        pianSampler?.connect(volNode);
        chordLoopRef.current = true;
        const durationPer = Math.max(0.5, (60 / parsedBpm) * 4);
        const delayMs = durationPer * 1000;

        const playChordLoop = async (idx = 0) => {
          if (!chordLoopRef?.current) return;
          setCurrentChord(idx % progression?.length);
          const notes = chordToMidiNotes(progression?.[idx % progression?.length]);
          const noteNames = notes?.map(midiToNoteName);
          pianSampler?.triggerAttackRelease(noteNames, durationPer * 0.8);
          chordTimerRef.current = setTimeout(() => playChordLoop(idx + 1), delayMs);
        };
        playChordLoop(0);
      }

      setIsPlaying(true);
    } catch (err) {
      console.error('Final preview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMute = () => {
    if (isMuted) { setIsMuted(false); setVolume(prevVolume); }
    else { setPrevVolume(volume); setIsMuted(true); }
  };

  // Waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas?.getContext('2d');
    const W = canvas?.width; const H = canvas?.height;
    ctx?.clearRect(0, 0, W, H);
    const bars = waveDataRef?.current?.length;
    const barW = (W / bars) - 1;
    if (isPlaying) waveDataRef.current = waveDataRef?.current?.map(v => v + (Math.random() * 0.8 + 0.1 - v) * 0.12);
    const stepFrac = currentStepRef?.current >= 0 ? (currentStepRef?.current + 1) / 16 : 0;
    waveDataRef?.current?.forEach((val, i) => {
      const x = i * (barW + 1);
      const frac = i / bars;
      const isActive = isPlaying && frac <= stepFrac;
      const barH = val * H * (isPlaying ? 1 : 0.3);
      const y = (H - barH) / 2;
      const r = isActive ? 192 : 139; const g = isActive ? 132 : 92; const b = isActive ? 252 : 246;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.globalAlpha = isActive ? 0.9 : 0.35;
      ctx.shadowColor = isActive ? 'rgba(192,132,252,0.6)' : 'transparent';
      ctx.shadowBlur = isActive ? 10 : 0;
      ctx?.beginPath();
      ctx?.roundRect(x, y, barW, Math.max(2, barH), 2);
      ctx?.fill();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (isPlaying) animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) animFrameRef.current = requestAnimationFrame(drawWaveform);
    else { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); drawWaveform(); }
    return () => { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); };
  }, [isPlaying, drawWaveform]);

  useEffect(() => () => stopAll(), []);

  return (
    <div className={`rounded-xl p-5 border transition-all duration-300 ${
      isPlaying
        ? 'bg-gradient-to-br from-purple-900/40 to-cyan-900/20 border-purple-500/60 shadow-xl shadow-purple-500/10'
        : 'bg-gray-900/80 border-gray-700/50'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${isPlaying ? 'text-purple-400 animate-pulse' : 'text-gray-500'}`} />
          <span className="text-base font-bold text-white">Final Reference Track</span>
          {genre && <span className="text-xs text-gray-400 bg-gray-800 rounded px-2 py-0.5">{genre}</span>}
        </div>
        <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-3 py-1">
          <Music className="w-3 h-3 text-purple-400" />
          <span className="text-xs font-mono font-bold text-purple-300">{parsedBpm}</span>
          <span className="text-xs text-gray-500">BPM</span>
        </div>
      </div>
      {/* Mode selector */}
      <div className="flex gap-2 mb-4">
        {[['beat', '🥁 Beat'], ['chords', '🎹 Chords'], ['both', '🎵 Both']]?.map(([val, label]) => (
          <button
            key={val}
            onClick={() => { if (isPlaying) stopAll(); setMode(val); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === val
                ? 'bg-purple-600 text-white' :'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Chord pills */}
      {(mode === 'chords' || mode === 'both') && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {progression?.map((chord, idx) => (
            <div
              key={idx}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                isPlaying && idx === currentChord
                  ? 'bg-purple-500 text-white scale-110 shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {chord}
            </div>
          ))}
        </div>
      )}
      {/* Waveform */}
      <div className="mb-4 rounded-lg overflow-hidden bg-purple-500/5 border border-purple-500/10">
        <canvas ref={canvasRef} width={600} height={64} className="w-full" />
      </div>
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
              isPlaying
                ? 'bg-yellow-500 hover:bg-yellow-400' :'bg-gradient-to-br from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          <button onClick={stopAll} className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-all hover:scale-105 active:scale-95">
            <Square className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <button onClick={handleMute} className="text-gray-400 hover:text-white transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range" min="0" max="100" value={isMuted ? 0 : volume}
            onChange={(e) => { setIsMuted(false); setVolume(parseInt(e?.target?.value)); }}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${isMuted ? 0 : volume}%, #374151 ${isMuted ? 0 : volume}%, #374151 100%)`}}
          />
          <span className="text-xs text-gray-500 w-7 text-right">{isMuted ? 0 : volume}%</span>
        </div>
      </div>
      {isPlaying && (
        <p className="text-xs text-center text-gray-500 mt-3">
          🎵 Reference track playing — {mode === 'both' ? 'Beat + Chords' : mode === 'beat' ? 'Drum Pattern' : 'Chord Progression'}
        </p>
      )}
    </div>
  );
}
