import { useState, useEffect } from 'react';
import { ShoppingCart, Filter, Music2 } from 'lucide-react';
import { beatsService } from 'services/supabaseService';
import Header from 'components/Header';
import Footer from 'components/Footer';
import ProductCard from 'components/ProductCard';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

export default function MusicStore() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ genre: '', isFree: undefined });
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadBeats();
  }, [filters]);

  const loadBeats = async () => {
    try {
      setLoading(true);
      const data = await beatsService?.getAll(filters);
      setBeats(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load beats');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (beat) => {
    setCart([...cart, beat]);
  };

  const genres = [
    { value: '', label: 'All Genres' },
    { value: 'hip_hop', label: 'Hip-Hop' },
    { value: 'trap', label: 'Trap' },
    { value: 'rnb', label: 'R&B' },
    { value: 'drill', label: 'Drill' },
    { value: 'afrobeat', label: 'Afrobeat' },
    { value: 'pop', label: 'Pop' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-500/10 to-black">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Music & Beats <span className="text-cyan-500">Store</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Premium beats and instrumentals from top producers. 
            Find the perfect sound for your next hit.
          </p>
        </div>
      </section>
      {/* Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filter by:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <Select
                value={filters?.genre}
                onChange={(e) => setFilters({ ...filters, genre: e?.target?.value })}
                className="w-full sm:w-48"
              >
                {genres?.map((genre) => (
                  <option key={genre?.value} value={genre?.value}>
                    {genre?.label}
                  </option>
                ))}
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={filters?.isFree === true ? 'default' : 'ghost'}
                  onClick={() => setFilters({ ...filters, isFree: filters?.isFree === true ? undefined : true })}
                  className="text-white"
                >
                  Free Only
                </Button>
                <Button
                  variant={filters?.isFree === false ? 'default' : 'ghost'}
                  onClick={() => setFilters({ ...filters, isFree: filters?.isFree === false ? undefined : false })}
                  className="text-white"
                >
                  Premium
                </Button>
              </div>
            </div>

            {cart?.length > 0 && (
              <div className="flex items-center gap-2 text-cyan-500">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-bold">{cart?.length} items</span>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Beats Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8]?.map((i) => (
                <div key={i} className="bg-white/5 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">{error}</p>
              <Button onClick={loadBeats} className="mt-4 bg-cyan-500 text-black hover:bg-cyan-400">
                Try Again
              </Button>
            </div>
          ) : beats?.length === 0 ? (
            <div className="text-center py-20">
              <Music2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No beats found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {beats?.map((beat) => (
                <ProductCard
                  key={beat?.id}
                  product={{
                    id: beat?.id,
                    title: beat?.title,
                    artist: beat?.artists?.stage_name,
                    image: beat?.cover_image_url,
                    price: beat?.is_free ? 0 : beat?.price,
                    badge: beat?.featured ? 'Featured' : beat?.is_free ? 'Free' : null,
                    category: beat?.genre?.replace('_', ' ')?.toUpperCase(),
                  }}
                  onAddToCart={() => handleAddToCart(beat)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}