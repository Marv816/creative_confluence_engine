import { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { collaborationsService } from 'services/supabaseService';
import { useAuth } from 'contexts/AuthContext';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Button from 'components/ui/Button';
import { format } from 'date-fns';

export default function CollaborationHub() {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('open');
  const { user } = useAuth();

  useEffect(() => {
    loadCollaborations();
  }, [filter]);

  const loadCollaborations = async () => {
    try {
      setLoading(true);
      const data = await collaborationsService?.getAll({ status: filter });
      setCollaborations(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load collaborations');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (collaborationId) => {
    if (!user) {
      alert('Please sign in to join collaborations');
      return;
    }

    try {
      await collaborationsService?.join(collaborationId, user?.id);
      loadCollaborations();
    } catch (err) {
      alert(err?.message || 'Failed to join collaboration');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Users className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-cyan-500" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/20 text-green-500';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'completed':
        return 'bg-cyan-500/20 text-cyan-500';
      case 'closed':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Collaboration <span className="text-cyan-500">Hub</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Connect with artists, producers, and creators. Find your next collaboration partner and create something amazing together.
          </p>
        </div>
      </section>
      {/* Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['open', 'in_progress', 'completed', 'closed']?.map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'ghost'}
                onClick={() => setFilter(status)}
                className={filter === status ? 'bg-cyan-500 text-black' : 'text-white'}
              >
                {status?.replace('_', ' ')?.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </section>
      {/* Collaborations Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6]?.map((i) => (
                <div key={i} className="bg-white/5 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">{error}</p>
              <Button onClick={loadCollaborations} className="mt-4 bg-cyan-500 text-black hover:bg-cyan-400">
                Try Again
              </Button>
            </div>
          ) : collaborations?.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No collaborations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborations?.map((collab) => (
                <div
                  key={collab?.id}
                  className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg p-6 hover:border-cyan-500/30 transition-all duration-300"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getStatusColor(collab?.status)}`}>
                      {getStatusIcon(collab?.status)}
                      {collab?.status?.replace('_', ' ')}
                    </span>
                    {collab?.project_type && (
                      <span className="px-2 py-1 text-xs text-gray-400 bg-white/5 rounded">
                        {collab?.project_type}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3">{collab?.title}</h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {collab?.description}
                  </p>

                  {/* Creator */}
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={collab?.user_profiles?.avatar_url || '/assets/images/no_image.png'}
                      alt={collab?.user_profiles?.full_name || 'Creator'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-400">
                      by <span className="text-white">{collab?.user_profiles?.full_name}</span>
                    </span>
                  </div>

                  {/* Skills */}
                  {collab?.required_skills && collab?.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {collab?.required_skills?.slice(0, 3)?.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-500 rounded">
                          {skill}
                        </span>
                      ))}
                      {collab?.required_skills?.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-400">+{collab?.required_skills?.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{collab?.current_collaborators || 0}/{collab?.max_collaborators || 0}</span>
                    </div>
                    {collab?.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(collab?.deadline), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {collab?.status === 'open' && (
                    <Button
                      onClick={() => handleJoin(collab?.id)}
                      className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
                      disabled={!user}
                    >
                      {user ? 'Join Collaboration' : 'Sign In to Join'}
                    </Button>
                  )}
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