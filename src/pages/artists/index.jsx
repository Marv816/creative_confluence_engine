import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, MapPin, Users, Play } from 'lucide-react';
import { artistsService } from 'services/supabaseService';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Button from 'components/ui/Button';

export default function ArtistsShowcase() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      setLoading(true);
      const data = await artistsService?.getAll();
      setArtists(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Featured <span className="text-cyan-500">Artists</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover talented artists from the BlaccTop Entertainment community. 
            Connect, collaborate, and create the future of music together.
          </p>
        </div>
      </section>
      {/* Artists Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6]?.map((i) => (
                <div key={i} className="bg-white/5 rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">{error}</p>
              <Button onClick={loadArtists} className="mt-4 bg-cyan-500 text-black hover:bg-cyan-400">
                Try Again
              </Button>
            </div>
          ) : artists?.length === 0 ? (
            <div className="text-center py-20">
              <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No artists found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists?.map((artist) => (
                <div
                  key={artist?.id}
                  className="group relative bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all duration-300"
                >
                  {/* Featured Badge */}
                  {artist?.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-cyan-500 text-black rounded-full">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Artist Image */}
                  <div className="aspect-square overflow-hidden bg-black/50">
                    <img
                      src={artist?.avatar_url || artist?.user_profiles?.avatar_url || '/assets/images/no_image.png'}
                      alt={artist?.stage_name || 'Artist'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Artist Info */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{artist?.stage_name}</h3>
                    <p className="text-cyan-500 text-sm mb-4">{artist?.genre || 'Various Genres'}</p>
                    
                    {artist?.location && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{artist?.location}</span>
                      </div>
                    )}

                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                      {artist?.bio || 'No bio available'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Play className="h-4 w-4" />
                        <span>{artist?.plays_count?.toLocaleString() || 0} plays</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{artist?.followers_count?.toLocaleString() || 0} followers</span>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <Link to={`/artists/${artist?.id}`}>
                      <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}