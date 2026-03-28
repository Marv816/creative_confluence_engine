import { Play, Pause, Heart, ShoppingCart, Star, Music2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../components/ui/Button';

export default function SoundCard({ sound, isPlaying, onPlay, onPurchase }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const lowestPrice = sound?.licenses?.reduce((min, license) => 
    license?.price < min ? license?.price : min, 
    sound?.licenses?.[0]?.price || 0
  );

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
      {/* Cover Image */}
      <div className="aspect-square overflow-hidden bg-black/50 relative">
        {!imageError && sound?.cover_image_url ? (
          <img
            src={sound?.cover_image_url}
            alt={sound?.title || 'Sound cover'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
            <Music2 className="h-16 w-16 text-white/20" />
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="icon"
            onClick={onPlay}
            className="w-16 h-16 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-110 transition-transform"
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {sound?.featured && (
            <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-cyan-500 text-black rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Featured
            </span>
          )}
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-purple-500 text-white rounded-full">
            {sound?.sound_type}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>

        {/* Waveform Visualization Placeholder */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end px-2 pb-1">
          <div className="flex items-end gap-0.5 w-full h-8">
            {[...Array(40)]?.map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-cyan-500/30 rounded-t"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Sound Info */}
      <div className="p-4">
        <h3 className="text-white font-bold mb-1 truncate">{sound?.title || 'Untitled'}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <p className="text-gray-400 text-sm truncate flex-1">
            {sound?.producer?.producer_name || 'Unknown Producer'}
          </p>
          {sound?.producer?.is_verified && (
            <span className="text-cyan-500 text-xs" title="Verified Producer">✓</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            {sound?.plays_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {sound?.favorites_count || 0}
          </span>
          {sound?.producer?.rating_average > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              {sound?.producer?.rating_average?.toFixed(1)}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {sound?.genre && (
            <span className="px-2 py-0.5 text-xs bg-white/5 text-gray-400 rounded">
              {sound?.genre}
            </span>
          )}
          {sound?.bpm && (
            <span className="px-2 py-0.5 text-xs bg-white/5 text-gray-400 rounded">
              {sound?.bpm} BPM
            </span>
          )}
          {sound?.key_signature && (
            <span className="px-2 py-0.5 text-xs bg-white/5 text-gray-400 rounded">
              {sound?.key_signature}
            </span>
          )}
        </div>

        {/* Price and Purchase */}
        <div className="flex items-center justify-between">
          <div>
            {lowestPrice === 0 ? (
              <span className="text-cyan-500 font-bold text-lg">FREE</span>
            ) : (
              <div>
                <span className="text-cyan-500 font-bold text-lg">${lowestPrice?.toFixed(2)}</span>
                {sound?.licenses?.length > 1 && (
                  <span className="text-gray-500 text-xs ml-1">+</span>
                )}
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={onPurchase}
            className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
}