import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { marketplaceService } from '../../../services/marketplaceService';

const SoundCatalog = ({ sounds, producer }) => {
  const [playingId, setPlayingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');

  const genres = ['all', 'hip_hop', 'trap', 'rnb', 'pop', 'drill', 'afrobeat'];

  const filteredSounds = sounds?.filter(sound => {
    const matchesSearch = sound?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesGenre = filterGenre === 'all' || sound?.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const handlePlay = async (soundId) => {
    if (playingId === soundId) {
      setPlayingId(null);
    } else {
      setPlayingId(soundId);
      await marketplaceService?.incrementPlayCount(soundId);
    }
  };

  const formatGenre = (genre) => {
    return genre?.replace('_', ' ')?.replace(/\b\w/g, l => l?.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search sounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full h-10 pl-10 pr-4 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {genres?.map(genre => (
              <button
                key={genre}
                onClick={() => setFilterGenre(genre)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filterGenre === genre
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {formatGenre(genre)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {filteredSounds?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Icon name="Music" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Sounds Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterGenre !== 'all' ?'Try adjusting your filters' :'This producer hasn\'t uploaded any sounds yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSounds?.map(sound => (
            <div key={sound?.id} className="glass-card overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative aspect-square bg-gradient-to-br from-purple-500 to-pink-500">
                {sound?.cover_image_url ? (
                  <img
                    src={sound?.cover_image_url}
                    alt={sound?.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Music" size={64} className="text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handlePlay(sound?.id)}
                    className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Icon
                      name={playingId === sound?.id ? 'Pause' : 'Play'}
                      size={24}
                      className="text-primary-foreground"
                    />
                  </button>
                </div>
                {sound?.is_featured && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    FEATURED
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2 truncate">{sound?.title}</h3>
                {sound?.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{sound?.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {sound?.genre && (
                    <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                      {formatGenre(sound?.genre)}
                    </span>
                  )}
                  {sound?.bpm && (
                    <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                      {sound?.bpm} BPM
                    </span>
                  )}
                  {sound?.key && (
                    <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                      {sound?.key}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Icon name="Play" size={14} />
                      <span>{sound?.plays_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Heart" size={14} />
                      <span>{sound?.likes_count || 0}</span>
                    </div>
                  </div>
                  {sound?.licenses?.[0] && (
                    <span className="font-semibold text-primary">
                      ${sound?.licenses?.[0]?.price}
                    </span>
                  )}
                </div>

                <Button className="w-full mt-4" size="sm" iconName="ShoppingCart" iconPosition="left">
                  View Licenses
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SoundCatalog;