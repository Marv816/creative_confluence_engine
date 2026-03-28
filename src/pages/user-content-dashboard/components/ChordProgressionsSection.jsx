import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { playProgression } from '../../../services/audioService';

const ChordProgressionsSection = ({ presets }) => {
  const [playingPreset, setPlayingPreset] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const handlePlayProgression = async (preset) => {
    try {
      setPlayingPreset(preset?.name);
      await playProgression(
        preset?.progression,
        preset?.tempo || 90,
        'none',
        0
      );
      setPlayingPreset(null);
    } catch (error) {
      console.error('[Chord Progressions] Play error:', error);
      setPlayingPreset(null);
    }
  };

  const toggleFavorite = (name) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites?.has(name)) {
        newFavorites?.delete(name);
      } else {
        newFavorites?.add(name);
      }
      return newFavorites;
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-accent p-2 flex items-center justify-center">
            <Icon name="Music" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Chord Progressions</h2>
            <p className="text-sm text-muted-foreground">{presets?.length} progressions</p>
          </div>
        </div>
      </div>

      {presets?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Music" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No chord progressions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets?.map((preset, idx) => (
            <div
              key={idx}
              className="glass-card p-4 hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate mb-1">
                    {preset?.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 bg-primary/10 rounded-full">
                      {preset?.key}
                    </span>
                    <span className="px-2 py-1 bg-secondary/10 rounded-full">
                      {preset?.tempo} BPM
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(preset?.name)}
                  className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
                  title={favorites?.has(preset?.name) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Icon
                    name={favorites?.has(preset?.name) ? 'Star' : 'Star'}
                    size={14}
                    className={favorites?.has(preset?.name) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}
                  />
                </button>
              </div>

              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">
                  {preset?.learning}
                </p>
                <div className="flex flex-wrap gap-1">
                  {preset?.progression?.map((chord, chordIdx) => (
                    <span
                      key={chordIdx}
                      className="px-2 py-1 bg-muted/50 rounded text-xs font-mono text-foreground"
                    >
                      {chord}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handlePlayProgression(preset)}
                size="sm"
                variant="outline"
                fullWidth
                iconName={playingPreset === preset?.name ? 'Loader2' : 'Play'}
                iconPosition="left"
                disabled={playingPreset === preset?.name}
                className={playingPreset === preset?.name ? 'animate-pulse' : ''}
              >
                {playingPreset === preset?.name ? 'Playing...' : 'Play Progression'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChordProgressionsSection;