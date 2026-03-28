import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Music } from 'lucide-react';

export default function AudioPlaybackControls({
  isPlaying = false,
  onPlay,
  onPause,
  onStop,
  bpm = 120,
  volume = 80,
  onVolumeChange,
  label = 'Preview',
  accentColor = 'purple',
  currentStep = 0,
  totalSteps = 16,
  showWaveform = true,
  showBpm = true,
  compact = false
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const waveDataRef = useRef(Array.from({ length: 64 }, () => Math.random() * 0.3 + 0.1));
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const colorMap = {
    purple: { bar: '#a855f7', glow: 'rgba(168,85,247,0.4)', active: '#c084fc', bg: 'rgba(168,85,247,0.1)' },
    emerald: { bar: '#10b981', glow: 'rgba(16,185,129,0.4)', active: '#34d399', bg: 'rgba(16,185,129,0.1)' },
    cyan: { bar: '#06b6d4', glow: 'rgba(6,182,212,0.4)', active: '#22d3ee', bg: 'rgba(6,182,212,0.1)' },
    rose: { bar: '#f43f5e', glow: 'rgba(244,63,94,0.4)', active: '#fb7185', bg: 'rgba(244,63,94,0.1)' },
  };
  const colors = colorMap?.[accentColor] || colorMap?.purple;

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas?.getContext('2d');
    const W = canvas?.width;
    const H = canvas?.height;
    ctx?.clearRect(0, 0, W, H);

    const bars = waveDataRef?.current?.length;
    const barW = W / bars - 1;

    if (isPlaying) {
      waveDataRef.current = waveDataRef?.current?.map((v, i) => {
        const target = Math.random() * 0.7 + 0.15;
        return v + (target - v) * 0.15;
      });
    }

    waveDataRef?.current?.forEach((val, i) => {
      const x = i * (barW + 1);
      const barH = val * H * (isPlaying ? 1 : 0.4);
      const y = (H - barH) / 2;

      const isActive = isPlaying && i < (currentStep / totalSteps) * bars;
      ctx.fillStyle = isActive ? colors?.active : colors?.bar;
      ctx.globalAlpha = isActive ? 0.9 : 0.45;

      if (isPlaying && isActive) {
        ctx.shadowColor = colors?.glow;
        ctx.shadowBlur = 6;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx?.beginPath();
      ctx?.roundRect(x, y, barW, barH, 2);
      ctx?.fill();
    });

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [isPlaying, currentStep, totalSteps, colors]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    } else {
      if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current);
      drawWaveform();
    }
    return () => { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); };
  }, [isPlaying, drawWaveform]);

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange?.(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      onVolumeChange?.(0);
    }
  };

  const progressPct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-700/50">
        <div className="flex items-center gap-1">
          {onPlay && !isPlaying && (
            <button onClick={onPlay} className={`w-8 h-8 rounded-full flex items-center justify-center bg-${accentColor}-600 hover:bg-${accentColor}-500 transition-all`} style={{backgroundColor: colors?.bar}}>
              <Play className="w-3.5 h-3.5 text-white ml-0.5" />
            </button>
          )}
          {onPause && isPlaying && (
            <button onClick={onPause} className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-600 hover:bg-yellow-500 transition-all">
              <Pause className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          {onStop && (
            <button onClick={onStop} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-all">
              <Square className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
        {showBpm && <span className="text-xs font-mono text-gray-400">{bpm} BPM</span>}
        {showWaveform && (
          <canvas ref={canvasRef} width={80} height={24} className="rounded" />
        )}
        <span className="text-xs text-gray-400 ml-auto">{label}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50" style={{borderColor: isPlaying ? colors?.bar + '60' : undefined}}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} style={{backgroundColor: colors?.bar}} />
          <span className="text-sm font-semibold text-gray-200">{label}</span>
        </div>
        {showBpm && (
          <div className="flex items-center gap-1.5 bg-gray-800/80 rounded-lg px-3 py-1">
            <Music className="w-3 h-3" style={{color: colors?.bar}} />
            <span className="text-xs font-mono font-bold" style={{color: colors?.bar}}>{bpm}</span>
            <span className="text-xs text-gray-500">BPM</span>
          </div>
        )}
      </div>
      {/* Waveform */}
      {showWaveform && (
        <div className="mb-3 rounded-lg overflow-hidden" style={{background: colors?.bg}}>
          <canvas ref={canvasRef} width={400} height={48} className="w-full" />
        </div>
      )}
      {/* Progress bar */}
      {isPlaying && totalSteps > 0 && (
        <div className="mb-3 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{width: `${progressPct}%`, backgroundColor: colors?.bar}}
          />
        </div>
      )}
      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <div className="flex items-center gap-1.5">
          {!isPlaying ? (
            <button
              onClick={onPlay}
              disabled={!onPlay}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
              style={{backgroundColor: colors?.bar}}
              title="Play"
            >
              <Play className="w-4 h-4 text-white ml-0.5" />
            </button>
          ) : (
            <button
              onClick={onPause || onStop}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95"
              title="Pause"
            >
              <Pause className="w-4 h-4 text-white" />
            </button>
          )}
          <button
            onClick={onStop}
            disabled={!onStop}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
            title="Stop"
          >
            <Square className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1">
          <button onClick={handleMuteToggle} className="text-gray-400 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => { setIsMuted(false); onVolumeChange?.(parseInt(e?.target?.value)); }}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${colors?.bar} 0%, ${colors?.bar} ${isMuted ? 0 : volume}%, #374151 ${isMuted ? 0 : volume}%, #374151 100%)`
            }}
          />
          <span className="text-xs text-gray-500 w-7 text-right">{isMuted ? 0 : volume}%</span>
        </div>
      </div>
    </div>
  );
}
