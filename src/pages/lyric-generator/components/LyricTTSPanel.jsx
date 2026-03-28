import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';

export default function LyricTTSPanel({ lyrics, bpm = 90 }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [volume, setVolume] = useState(90);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(90);
  const [rate, setRate] = useState(1.0);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef(null);
  const linesRef = useRef([]);
  const currentLineIdxRef = useRef(0);
  const playingRef = useRef(false);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const waveDataRef = useRef(Array.from({ length: 48 }, () => Math.random() * 0.15 + 0.05));

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const getLines = useCallback(() => {
    if (!lyrics) return [];
    return lyrics?.split('\n')?.filter(l => l?.trim()?.length > 0);
  }, [lyrics]);

  const stopPlayback = useCallback(() => {
    window.speechSynthesis?.cancel();
    playingRef.current = false;
    setIsPlaying(false);
    setCurrentLine(-1);
    currentLineIdxRef.current = 0;
  }, []);

  const speakLine = useCallback((lines, idx) => {
    if (!playingRef?.current || idx >= lines?.length) {
      setIsPlaying(false);
      setCurrentLine(-1);
      playingRef.current = false;
      return;
    }

    setCurrentLine(idx);
    currentLineIdxRef.current = idx;

    const utterance = new SpeechSynthesisUtterance(lines[idx]);
    utterance.volume = isMuted ? 0 : volume / 100;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis?.getVoices();
    const preferred = voices?.find(v => v?.lang === 'en-US' && v?.name?.includes('Google')) ||
                      voices?.find(v => v?.lang === 'en-US') ||
                      voices?.[0];
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      if (playingRef?.current) {
        const beatDelay = Math.max(100, (60000 / bpm) * 0.5);
        setTimeout(() => speakLine(lines, idx + 1), beatDelay);
      }
    };
    utterance.onerror = () => {
      if (playingRef?.current) speakLine(lines, idx + 1);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis?.speak(utterance);
  }, [volume, isMuted, rate, bpm]);

  const handlePlay = useCallback(() => {
    if (isPlaying) { stopPlayback(); return; }
    if (!lyrics?.trim()) return;

    const lines = getLines();
    if (!lines?.length) return;

    window.speechSynthesis?.cancel();
    playingRef.current = true;
    setIsPlaying(true);
    setCurrentLine(0);
    speakLine(lines, 0);
  }, [isPlaying, lyrics, getLines, speakLine, stopPlayback]);

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
    if (isPlaying) waveDataRef.current = waveDataRef?.current?.map(v => v + (Math.random() * 0.65 + 0.1 - v) * 0.2);
    const lines = getLines();
    const lineFrac = lines?.length > 0 && currentLine >= 0 ? (currentLine + 1) / lines?.length : 0;
    waveDataRef?.current?.forEach((val, i) => {
      const x = i * (barW + 1);
      const isActive = isPlaying && (i / bars) <= lineFrac;
      const barH = val * H * (isPlaying ? 1 : 0.3);
      const y = (H - barH) / 2;
      ctx.fillStyle = isActive ? '#22d3ee' : '#06b6d4';
      ctx.globalAlpha = isActive ? 0.9 : 0.4;
      ctx.shadowColor = isActive ? 'rgba(34,211,238,0.5)' : 'transparent';
      ctx.shadowBlur = isActive ? 8 : 0;
      ctx?.beginPath();
      ctx?.roundRect(x, y, barW, Math.max(2, barH), 2);
      ctx?.fill();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (isPlaying) animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, [isPlaying, currentLine, getLines]);

  useEffect(() => {
    if (isPlaying) animFrameRef.current = requestAnimationFrame(drawWaveform);
    else { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); drawWaveform(); }
    return () => { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); };
  }, [isPlaying, drawWaveform]);

  useEffect(() => () => stopPlayback(), []);

  const lines = getLines();
  const progressPct = lines?.length > 0 && currentLine >= 0 ? ((currentLine + 1) / lines?.length) * 100 : 0;

  if (!isSupported) {
    return (
      <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-700/50">
        <p className="text-sm text-gray-400 text-center">Text-to-speech not supported in this browser.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
      isPlaying ? 'border-cyan-500/60 shadow-lg shadow-cyan-500/10' : 'border-gray-700/50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all ${isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-sm font-bold text-white">🎤 Lyric Preview</span>
          <span className="text-xs text-gray-500">(TTS)</span>
        </div>
        {isPlaying && currentLine >= 0 && (
          <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-lg px-2 py-0.5">
            <span className="text-xs text-cyan-300">Line {currentLine + 1}/{lines?.length}</span>
          </div>
        )}
      </div>
      {/* Current line display */}
      {isPlaying && currentLine >= 0 && lines?.[currentLine] && (
        <div className="mb-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <p className="text-sm text-cyan-200 font-medium italic">"{lines?.[currentLine]}"</p>
        </div>
      )}
      {/* Waveform */}
      <div className="mb-3 rounded-lg overflow-hidden bg-cyan-500/5 border border-cyan-500/10">
        <canvas ref={canvasRef} width={500} height={48} className="w-full" />
      </div>
      {/* Progress */}
      <div className="mb-3 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{width: `${progressPct}%`}} />
      </div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePlay}
            disabled={!lyrics?.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 ${
              isPlaying ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-cyan-600 hover:bg-cyan-500'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>
          <button onClick={stopPlayback} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-all hover:scale-105 active:scale-95">
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
            style={{background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${isMuted ? 0 : volume}%, #374151 ${isMuted ? 0 : volume}%, #374151 100%)`}}
          />
          <span className="text-xs text-gray-500 w-7 text-right">{isMuted ? 0 : volume}%</span>
        </div>
      </div>
      {/* Speed control */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">Speed:</span>
        {[0.75, 1.0, 1.25, 1.5]?.map(r => (
          <button
            key={r}
            onClick={() => setRate(r)}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
              rate === r ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {r}x
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-auto">Rhythm sync: {bpm} BPM</span>
      </div>
    </div>
  );
}
