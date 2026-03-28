import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import SoundCard from './SoundCard';
import Button from '../../../components/ui/Button';

export default function FeaturedCarousel({ sounds, onPlay, onPurchase, currentlyPlaying }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const maxIndex = Math.max(0, sounds?.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const visibleSounds = sounds?.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <Button
          size="icon"
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-black/80 backdrop-blur-sm text-white hover:bg-black border border-white/10 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      {currentIndex < maxIndex && (
        <Button
          size="icon"
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-black/80 backdrop-blur-sm text-white hover:bg-black border border-white/10 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
      {/* Carousel Content */}
      <div className="overflow-hidden">
        <div 
          className="flex gap-6 transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
        >
          {sounds?.map((sound) => (
            <div key={sound?.id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
              <SoundCard
                sound={sound}
                isPlaying={currentlyPlaying?.id === sound?.id}
                onPlay={() => onPlay(sound)}
                onPurchase={() => onPurchase(sound)}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {[...Array(maxIndex + 1)]?.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex ? 'w-8 bg-cyan-500' : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}