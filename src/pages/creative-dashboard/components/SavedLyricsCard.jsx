import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Trash2 } from 'lucide-react';
import { lyricsService } from '../../../services/lyricsService';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';

export default function SavedLyricsCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [realtimeChannel, setRealtimeChannel] = useState(null);

  useEffect(() => {
    if (user) {
      loadLyrics();
      setupRealtimeSync();
    } else {
      setLyrics([]);
      setLoading(false);
    }

    return () => {
      if (realtimeChannel) {
        lyricsService?.unsubscribe(realtimeChannel);
      }
    };
  }, [user]);

  const loadLyrics = async () => {
    try {
      setLoading(true);
      const data = await lyricsService?.getAll({ limit: 5 });
      setLyrics(data);
      setError('');
    } catch (err) {
      console.error('[Saved Lyrics Card] Load error:', err);
      setError('Failed to load lyrics');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSync = () => {
    const channel = lyricsService?.subscribeToChanges((payload) => {
      console.log('[Saved Lyrics Card] Real-time update:', payload);
      
      if (payload?.eventType === 'INSERT') {
        setLyrics(prev => [payload?.new, ...prev]?.slice(0, 5));
      } else if (payload?.eventType === 'UPDATE') {
        setLyrics(prev => prev?.map(lyric => 
          lyric?.id === payload?.new?.id ? {
            id: payload?.new?.id,
            userId: payload?.new?.user_id,
            title: payload?.new?.title,
            content: payload?.new?.content,
            genre: payload?.new?.genre,
            subject: payload?.new?.subject,
            tone: payload?.new?.tone,
            artistStyles: payload?.new?.artist_styles,
            section: payload?.new?.section,
            bars: payload?.new?.bars,
            status: payload?.new?.status,
            analysis: payload?.new?.analysis,
            metadata: payload?.new?.metadata,
            createdAt: payload?.new?.created_at,
            updatedAt: payload?.new?.updated_at
          } : lyric
        ));
      } else if (payload?.eventType === 'DELETE') {
        setLyrics(prev => prev?.filter(lyric => lyric?.id !== payload?.old?.id));
      }
    });

    setRealtimeChannel(channel);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lyric?')) return;

    try {
      await lyricsService?.delete(id);
      setLyrics(prev => prev?.filter(lyric => lyric?.id !== id));
    } catch (err) {
      console.error('[Saved Lyrics Card] Delete error:', err);
      alert('Failed to delete lyric');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date?.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Saved Lyrics</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Sign in to save and sync your lyrics across devices</p>
          <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary/90">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Saved Lyrics</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading your lyrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Saved Lyrics</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
          <Button onClick={loadLyrics} className="mt-4 bg-primary hover:bg-primary/90">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Saved Lyrics</h3>
        </div>
        <Button 
          onClick={() => navigate('/lyric-generator')} 
          size="sm" 
          className="bg-primary hover:bg-primary/90"
        >
          Create New
        </Button>
      </div>
      {lyrics?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No saved lyrics yet</p>
          <Button onClick={() => navigate('/lyric-generator')} className="bg-primary hover:bg-primary/90">
            Generate Your First Lyrics
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lyrics?.map((lyric) => (
            <div
              key={lyric?.id}
              className="bg-background/50 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate mb-1">
                    {lyric?.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    {lyric?.genre && (
                      <span className="px-2 py-1 bg-primary/10 rounded-full">
                        {lyric?.genre}
                      </span>
                    )}
                    {lyric?.section && (
                      <span className="px-2 py-1 bg-secondary/10 rounded-full">
                        {lyric?.section}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lyric?.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDate(lyric?.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(lyric?.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
                  title="Delete lyric"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {lyrics?.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/lyric-generator')}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View all saved lyrics →
          </button>
        </div>
      )}
    </div>
  );
}