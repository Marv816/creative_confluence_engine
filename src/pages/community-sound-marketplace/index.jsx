import { useState, useEffect, useRef } from 'react';
import { Filter, Search, TrendingUp, Music2 } from 'lucide-react';
import { marketplaceSoundsService } from '../../services/marketplaceService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import SoundCard from './components/SoundCard';
import FeaturedCarousel from './components/FeaturedCarousel';
import FilterSidebar from './components/FilterSidebar';
import PurchaseModal from './components/PurchaseModal';

export default function CommunitySoundMarketplace() {
  const [sounds, setSounds] = useState([]);
  const [featuredSounds, setFeaturedSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    genre: '',
    soundType: '',
    minBpm: '',
    maxBpm: '',
    keySignature: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSound, setSelectedSound] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadSounds();
    loadFeaturedSounds();
  }, [filters]);

  const loadSounds = async () => {
    try {
      setLoading(true);
      const data = await marketplaceSoundsService?.getAll(filters);
      setSounds(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load sounds');
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedSounds = async () => {
    try {
      const data = await marketplaceSoundsService?.getFeatured();
      setFeaturedSounds(data || []);
    } catch (err) {
      console.error('Failed to load featured sounds:', err);
    }
  };

  const handlePlayPause = async (sound) => {
    if (currentlyPlaying?.id === sound?.id) {
      audioRef?.current?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef?.current) {
        audioRef.current.src = sound?.audio_url;
        audioRef?.current?.play();
        setCurrentlyPlaying(sound);
        await marketplaceSoundsService?.incrementPlays(sound?.id);
      }
    }
  };

  const handlePurchaseClick = (sound) => {
    setSelectedSound(sound);
    setShowPurchaseModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      soundType: '',
      minBpm: '',
      maxBpm: '',
      keySignature: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-500/10 to-black">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Community Sound <span className="text-cyan-500">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Discover, buy, and sell premium beats, samples, loops, and vocals from talented producers worldwide.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search beats, samples, producers..."
                value={filters?.search}
                onChange={(e) => handleFilterChange('search', e?.target?.value)}
                className="pl-12 pr-4 py-4 w-full bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Featured Carousel */}
      {featuredSounds?.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-cyan-500" />
              <h2 className="text-3xl font-bold text-white">Featured Beats</h2>
            </div>
            <FeaturedCarousel 
              sounds={featuredSounds} 
              onPlay={handlePlayPause}
              onPurchase={handlePurchaseClick}
              currentlyPlaying={currentlyPlaying}
            />
          </div>
        </section>
      )}
      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="lg:hidden mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full text-white border-white/10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>
              
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                <FilterSidebar 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>

            {/* Sounds Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Music2 className="h-5 w-5" />
                  <span className="font-medium">{sounds?.length} sounds available</span>
                </div>
                
                <Select
                  value="newest"
                  onChange={() => {}}
                  className="w-48 bg-white/5 border-white/10 text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </Select>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)]?.map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-lg h-80 animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={loadSounds} className="bg-cyan-500 text-black hover:bg-cyan-400">
                    Try Again
                  </Button>
                </div>
              ) : sounds?.length === 0 ? (
                <div className="text-center py-12">
                  <Music2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No sounds found</h3>
                  <p className="text-gray-400 mb-4">Try adjusting your filters</p>
                  <Button onClick={clearFilters} variant="ghost" className="text-cyan-500">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sounds?.map((sound) => (
                    <SoundCard
                      key={sound?.id}
                      sound={sound}
                      isPlaying={currentlyPlaying?.id === sound?.id}
                      onPlay={() => handlePlayPause(sound)}
                      onPurchase={() => handlePurchaseClick(sound)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
      {/* Purchase Modal */}
      {showPurchaseModal && selectedSound && (
        <PurchaseModal
          sound={selectedSound}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedSound(null);
          }}
        />
      )}
    </div>
  );
}