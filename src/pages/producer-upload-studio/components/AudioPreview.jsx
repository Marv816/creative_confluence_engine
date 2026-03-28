import { Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';

export default function AudioPreview({ audioUrl, title }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef?.current?.pause();
    } else {
      audioRef?.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef?.current?.currentTime || 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef?.current?.duration || 0);
  };

  const handleSeek = (e) => {
    const rect = e?.currentTarget?.getBoundingClientRect();
    const x = e?.clientX - rect?.left;
    const percentage = x / rect?.width;
    const newTime = percentage * duration;
    if (audioRef?.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center gap-4">
        <Button
          size="icon"
          onClick={handlePlayPause}
          className="bg-purple-500 text-white hover:bg-purple-400 flex-shrink-0"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>

        <div className="flex-1">
          <p className="text-white font-medium mb-2">{title || 'Audio Preview'}</p>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">{formatTime(currentTime)}</span>
            <div
              onClick={handleSeek}
              className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
            >
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="text-gray-400 text-sm">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}