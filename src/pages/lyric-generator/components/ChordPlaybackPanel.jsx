import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { Play, Pause, Square, Volume2, VolumeX, Music2 } from 'lucide-react';
import { initializeSampler, chordToMidiNotes, midiToNoteName, arpeggiateNotes } from '../../../services/audioService';

export default function ChordPlaybackPanel({ progression, tempo = 90, arpMode = 'none', swing = 0, onHighlightNotes, onChordChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIdx, setCurrentChordIdx] = useState(-1);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const playingRef = useRef(false);
  const stopRequestRef = useRef(false);
  // Session ID: incremented each time we start a new play session.
  // Each async loop captures its session ID and exits if it no longer matches.
  const sessionIdRef = useRef(0);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const volNodeRef = useRef(null);
  const waveDataRef = useRef(Array.from({ length: 48 }, () => Math.random() * 0.2 + 0.05));

  function volumeToDb(v) {
    if (v === 0) return -Infinity;
    return 20 * Math.log10(v / 100);
  }

  const cleanupVolNode = useCallback(() => {
    if (volNodeRef?.current) {
      try { volNodeRef?.current?.dispose(); } catch (_) {}
      volNodeRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(() => {
    stopRequestRef.current = true;
    playingRef.current = false;
    sessionIdRef.current += 1; // Invalidate any running async loop
    setIsPlaying(false);
    setCurrentChordIdx(-1);
    onHighlightNotes?.([]);
    onChordChange?.(-1);
    cleanupVolNode();
  }, [onHighlightNotes, onChordChange, cleanupVolNode]);

  // Stop playback whenever the progression changes (preset switch)
  useEffect(() => {
    stopPlayback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progression]);

  const handlePlay = async () => {
    if (isPlaying) { stopPlayback(); return; }
    if (!progression?.length) return;

    setIsLoading(true);
    try {
      // Must resume AudioContext first (browser autoplay policy)
      await Tone?.start();

      const sampler = await initializeSampler();

      // Cleanup any previous volume node
      cleanupVolNode();

      // Disconnect sampler from any previous routing
      try { sampler?.disconnect(); } catch (_) {}

      // Create fresh volume node and route sampler → volume → destination
      const volNode = new Tone.Volume(isMuted ? -Infinity : volumeToDb(volume));
      volNode?.toDestination();
      sampler?.connect(volNode);
      volNodeRef.current = volNode;

      // Capture session ID for this play session
      sessionIdRef.current += 1;
      const mySession = sessionIdRef?.current;

      playingRef.current = true;
      stopRequestRef.current = false;
      setIsPlaying(true);

      const durationPer = Math.max(0.5, (60 / tempo) * 2);
      const delayMs = durationPer * 1000;

      const playLoop = async () => {
        while (playingRef?.current && !stopRequestRef?.current && sessionIdRef?.current === mySession) {
          for (let i = 0; i < progression?.length; i++) {
            if (!playingRef?.current || stopRequestRef?.current || sessionIdRef?.current !== mySession) break;
            setCurrentChordIdx(i);
            onChordChange?.(i);

            const notes = chordToMidiNotes(progression?.[i]);
            onHighlightNotes?.(notes?.map(midiToNoteName));

            if (arpMode === 'none') {
              const noteNames = notes?.map(midiToNoteName);
              sampler?.triggerAttackRelease(noteNames, durationPer * 0.85);
              await new Promise(r => setTimeout(r, delayMs));
            } else {
              const arpNotes = arpeggiateNotes(notes, arpMode);
              const noteDur = (durationPer / arpNotes?.length) * 0.7;
              const stepMs = delayMs / arpNotes?.length;
              for (let j = 0; j < arpNotes?.length; j++) {
                if (!playingRef?.current || stopRequestRef?.current || sessionIdRef?.current !== mySession) break;
                const swingOffset = j % 2 === 1 ? (stepMs * swing / 100) : 0;
                sampler?.triggerAttackRelease(midiToNoteName(arpNotes?.[j]), noteDur);
                await new Promise(r => setTimeout(r, stepMs + swingOffset));
              }
            }
          }
        }
        // Only cleanup if this session is still the active one
        if (sessionIdRef?.current === mySession) {
          cleanupVolNode();
          setIsPlaying(false);
          setCurrentChordIdx(-1);
          onHighlightNotes?.([]);
          onChordChange?.(-1);
        }
      };

      playLoop();
    } catch (err) {
      console.error('Chord playback error:', err);
      setIsPlaying(false);
      cleanupVolNode();
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
    if (isPlaying) waveDataRef.current = waveDataRef?.current?.map(v => v + (Math.random() * 0.7 + 0.1 - v) * 0.15);
    const chordFrac = progression?.length > 0 && currentChordIdx >= 0 ? (currentChordIdx + 1) / progression?.length : 0;
    waveDataRef?.current?.forEach((val, i) => {
      const x = i * (barW + 1);
      const isActive = isPlaying && (i / bars) <= chordFrac;
      const barH = val * H * (isPlaying ? 1 : 0.35);
      const y = (H - barH) / 2;
      ctx.fillStyle = isActive ? '#34d399' : '#10b981';
      ctx.globalAlpha = isActive ? 0.9 : 0.4;
      ctx.shadowColor = isActive ? 'rgba(52,211,153,0.5)' : 'transparent';
      ctx.shadowBlur = isActive ? 8 : 0;
      ctx?.beginPath();
      ctx?.roundRect(x, y, barW, Math.max(2, barH), 2);
      ctx?.fill();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (isPlaying) animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, [isPlaying, currentChordIdx, progression]);

  useEffect(() => {
    if (isPlaying) animFrameRef.current = requestAnimationFrame(drawWaveform);
    else { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); drawWaveform(); }
    return () => { if (animFrameRef?.current) cancelAnimationFrame(animFrameRef?.current); };
  }, [isPlaying, drawWaveform]);

  useEffect(() => () => {
    stopPlayback();
  }, []);

  const progressPct = progression?.length > 0 && currentChordIdx >= 0 ? ((currentChordIdx + 1) / progression?.length) * 100 : 0;

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
      isPlaying ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10' : 'border-gray-700/50'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-sm font-bold text-white">🎹 Chord Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && currentChordIdx >= 0 && progression?.[currentChordIdx] && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-3 py-1">
              <span className="text-xs font-bold text-emerald-300">{progression?.[currentChordIdx]}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-3 py-1">
            <Music2 className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-300">{tempo}</span>
            <span className="text-xs text-gray-500">BPM</span>
          </div>
        </div>
      </div>
      {/* Chord pills */}
      {progression?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {progression?.map((chord, idx) => (
            <div
              key={idx}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                isPlaying && idx === currentChordIdx
                  ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {chord}
            </div>
          ))}
        </div>
      )}
      {/* Waveform */}
      <div className="mb-3 rounded-lg overflow-hidden bg-emerald-500/5 border border-emerald-500/10">
        <canvas ref={canvasRef} width={500} height={48} className="w-full" />
      </div>
      {/* Progress */}
      <div className="mb-3 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-200" style={{width: `${progressPct}%`}} />
      </div>
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePlay}
            disabled={isLoading || !progression?.length}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 ${
              isPlaying ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
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
            style={{background: `linear-gradient(to right, #10b981 0%, #10b981 ${isMuted ? 0 : volume}%, #374151 ${isMuted ? 0 : volume}%, #374151 100%)`}}
          />
          <span className="text-xs text-gray-500 w-7 text-right">{isMuted ? 0 : volume}%</span>
        </div>
      </div>
    </div>
  );
}
