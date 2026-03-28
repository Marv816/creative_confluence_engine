import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, Pause, Square, Volume2, VolumeX, Zap } from 'lucide-react';
import { initializeDrumSampler, triggerDrumHit } from '../../../services/drumService';

export default function BeatPlaybackPanel({ pattern, bpm, swing, steps, onCurrentStepChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const partRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const waveDataRef = useRef(Array.from({ length: 48 }, () => Math.random() * 0.2 + 0.05));
  const currentStepRef = useRef(-1);

  function volumeToDb(v) {
    if (v === 0) return -Infinity;
    return 20 * Math.log10(v / 100);
  }

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  useEffect(() => {
    try {
      Tone.getDestination().volume.value = isMuted ? -Infinity : volumeToDb(volume);
    } catch (e) {}
  }, [volume, isMuted]);

  const stopAll = useCallback(() => {
    if (partRef?.current) {
      partRef?.current?.stop();
      partRef?.current?.dispose();
      partRef.current = null;
    }
    Tone?.Transport?.stop();
    Tone?.Transport?.cancel();
    setIsPlaying(false);
    setCurrentStep(-1);
    currentStepRef.current = -1;
    onCurrentStepChange?.(-1);
  }, [onCurrentStepChange]);

  const handlePlay = async () => {
    if (isPlaying) {
      stopAll();
      return;
    }
    setIsLoading(true);
    try {
      await initializeDrumSampler();
      await Tone?.start();

      // Apply volume to destination (drum synths route directly to Tone.Destination)
      try {
        Tone.getDestination().volume.value = isMuted ? -Infinity : volumeToDb(volume);
      } catch (e) {}

      Tone.Transport.bpm.value = bpm;
      Tone.Transport.swing = swing / 100;

      const tracks = Object.keys(pattern);
      const numSteps = pattern?.[tracks?.[0]]?.length || steps;

      if (partRef?.current) {
        partRef?.current?.stop();
        partRef?.current?.dispose();
      }

      const part = new Tone.Part((time, step) => {
        currentStepRef.current = step;
        setCurrentStep(step);
        onCurrentStepChange?.(step);
        tracks.forEach(track => {
          if (pattern?.[track]?.[step]) {
            triggerDrumHit(track, time);
          }
        });
      }, Array.from({ length: numSteps }, (_, i) => [i * (60 / bpm / 4), i]));

      part.loop = true;
      part.loopEnd = numSteps * (60 / bpm / 4);
      part?.start(0);
      partRef.current = part;

      Tone?.Transport?.start();
      setIsPlaying(true);
    } catch (err) {
      console.error('Beat playback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => stopAll();

  const handleMute = () => {
    if (isMuted) { setIsMuted(false); setVolume(prevVolume); }
    else { setPrevVolume(volume); setIsMuted(true); }
  };

  // Waveform animation
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas?.getContext('2d');
    const W = canvas?.width;
    const H = canvas?.height;
    ctx?.clearRect(0, 0, W, H);

    const bars = waveDataRef?.current?.length;
    const barW = (W / bars) - 1;

    if (isPlaying) {
      waveDataRef.current = waveDataRef?.current?.map(v => {
        const t = Math.random() * 0.75 + 0.1;
        return v + (t - v) * 0.18;
      });
    }

    const step = currentStepRef?.current;
    const activeFrac = steps > 0 ? step / steps : 0;

    waveDataRef?.current?.forEach((val, i) => {
      const x = i * (barW + 1);
      const frac = i / bars;
      const isActive = isPlaying && frac <= activeFrac;
      const barH = val * H * (isPlaying ? 1 : 0.35);
      const y = (H - barH) / 2;

      ctx.fillStyle = isActive ? '#c084fc' : '#7c3aed';
      ctx.globalAlpha = isActive ? 0.9 : 0.4;
      ctx.shadowColor = isActive ? 'rgba(192,132,252,0.5)' : 'transparent';
      ctx.shadowBlur = isActive ? 8 : 0;
      ctx?.beginPath();
      ctx?.roundRect(x, y, barW, Math.max(2, barH), 2);
      ctx?.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (isPlaying) animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, [isPlaying, steps]);

  useEffect(() => {
    if (isPlaying) animFrameRef.current = requestAnimationFrame(drawWaveform);
    else { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); drawWaveform(); }
    return () => { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); };
  }, [isPlaying, drawWaveform]);

  // Stop when bpm/swing changes while playing
  useEffect(() => {
    if (isPlaying) stopAll();
  }, [bpm, swing]);

  const progressPct = steps > 0 && currentStep >= 0 ? ((currentStep + 1) / steps) * 100 : 0;

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
      isPlaying ? 'border-purple-500/60 shadow-lg shadow-purple-500/10' : 'border-gray-700/50'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all ${isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-sm font-bold text-white">🥁 Beat Preview</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-3 py-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-mono font-bold text-purple-300">{bpm}</span>
            <span className="text-xs text-gray-500">BPM</span>
          </div>
          {isPlaying && (
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1">
              <span className="text-xs text-gray-400">Step</span>
              <span className="text-xs font-mono font-bold text-purple-300">{currentStep + 1}/{steps}</span>
            </div>
          )}
        </div>
      </div>
      {/* Waveform */}
      <div className="mb-3 rounded-lg overflow-hidden bg-purple-500/5 border border-purple-500/10">
        <canvas ref={canvasRef} width={500} height={52} className="w-full" />
      </div>
      {/* Progress */}
      <div className="mb-3 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-100"
          style={{width: `${progressPct}%`}}
        />
      </div>
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
              isPlaying ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-purple-600 hover:bg-purple-500'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={handleStop}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-all hover:scale-105 active:scale-95"
            title="Stop"
          >
            <Square className="w-3.5 h-3.5 text-white" />
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
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${isMuted ? 0 : volume}%, #374151 ${isMuted ? 0 : volume}%, #374151 100%)`
            }}
          />
          <span className="text-xs text-gray-500 w-7 text-right">{isMuted ? 0 : volume}%</span>
        </div>
      </div>
    </div>
  );
}
