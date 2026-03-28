import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { lyricsService } from '../../../services/lyricsService';

const SavedLyricsSection = ({ lyrics, onRefresh }) => {
  const navigate = useNavigate();
  const [expandedLyric, setExpandedLyric] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lyric?')) return;

    try {
      await lyricsService?.delete(id);
      onRefresh?.();
    } catch (error) {
      console.error('[Saved Lyrics] Delete error:', error);
      alert('Failed to delete lyric');
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites?.has(id)) {
        newFavorites?.delete(id);
      } else {
        newFavorites?.add(id);
      }
      return newFavorites;
    });
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

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary p-2 flex items-center justify-center">
            <Icon name="FileText" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Saved Lyrics</h2>
            <p className="text-sm text-muted-foreground">{lyrics?.length} total</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/lyric-generator')}
          size="sm"
          iconName="Plus"
          iconPosition="left"
        >
          Create New
        </Button>
      </div>

      {lyrics?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">No saved lyrics yet</p>
          <Button onClick={() => navigate('/lyric-generator')}>
            Generate Your First Lyrics
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lyrics?.map((lyric) => (
            <div
              key={lyric?.id}
              className="glass-card p-4 hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate mb-1">
                    {lyric?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(lyric?.id)}
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                    title={favorites?.has(lyric?.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Icon
                      name={favorites?.has(lyric?.id) ? 'Star' : 'Star'}
                      size={16}
                      className={favorites?.has(lyric?.id) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(lyric?.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
                    title="Delete lyric"
                  >
                    <Icon name="Trash2" size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {lyric?.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Clock" size={12} />
                  {formatDate(lyric?.createdAt)}
                </div>
                <button
                  onClick={() => setExpandedLyric(expandedLyric === lyric?.id ? null : lyric?.id)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {expandedLyric === lyric?.id ? 'Show less' : 'Preview'}
                </button>
              </div>

              {expandedLyric === lyric?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {lyric?.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedLyricsSection;