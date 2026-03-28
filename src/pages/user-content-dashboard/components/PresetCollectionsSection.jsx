import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PresetCollectionsSection = ({ presets }) => {
  const [favorites, setFavorites] = useState(new Set());
  const [selectedComplexity, setSelectedComplexity] = useState('all');

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

  const filteredPresets = presets?.filter(preset => {
    if (selectedComplexity === 'all') return true;
    return preset?.complexity === selectedComplexity;
  });

  const favoritePresets = filteredPresets?.filter(preset => favorites?.has(preset?.name));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary p-2 flex items-center justify-center">
            <Icon name="Bookmark" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Preset Collections</h2>
            <p className="text-sm text-muted-foreground">
              {favoritePresets?.length} favorites • {filteredPresets?.length} total
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Button
          onClick={() => setSelectedComplexity('all')}
          size="sm"
          variant={selectedComplexity === 'all' ? 'default' : 'outline'}
        >
          All
        </Button>
        <Button
          onClick={() => setSelectedComplexity('simple')}
          size="sm"
          variant={selectedComplexity === 'simple' ? 'default' : 'outline'}
        >
          Simple
        </Button>
        <Button
          onClick={() => setSelectedComplexity('intermediate')}
          size="sm"
          variant={selectedComplexity === 'intermediate' ? 'default' : 'outline'}
        >
          Intermediate
        </Button>
        <Button
          onClick={() => setSelectedComplexity('advanced')}
          size="sm"
          variant={selectedComplexity === 'advanced' ? 'default' : 'outline'}
        >
          Advanced
        </Button>
      </div>

      {favoritePresets?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="Star" size={16} className="text-yellow-400 fill-yellow-400" />
            Favorites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favoritePresets?.map((preset, idx) => (
              <div
                key={idx}
                className="glass-card p-3 hover:border-primary/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {preset?.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {preset?.progression?.join(' → ')}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(preset?.name)}
                    className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <Icon name="Star" size={14} className="text-yellow-400 fill-yellow-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          All Presets ({filteredPresets?.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPresets?.map((preset, idx) => (
            <div
              key={idx}
              className="glass-card p-3 hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-xs text-foreground truncate">
                    {preset?.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="px-1.5 py-0.5 bg-primary/10 rounded text-xs">
                      {preset?.complexity}
                    </span>
                    <span className="px-1.5 py-0.5 bg-secondary/10 rounded text-xs">
                      {preset?.mood}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(preset?.name)}
                  className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Icon
                    name="Star"
                    size={12}
                    className={favorites?.has(preset?.name) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresetCollectionsSection;