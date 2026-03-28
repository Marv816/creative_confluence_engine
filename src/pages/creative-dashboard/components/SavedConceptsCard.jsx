import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SavedConceptsCard = ({ concepts }) => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (content, id) => {
    try {
      await navigator.clipboard?.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getConceptIcon = (type) => {
    const icons = {
      concept: 'Lightbulb',
      lyric: 'Music',
      mood: 'Palette',
      beat: 'Radio'
    };
    return icons?.[type] || 'FileText';
  };

  const getConceptColor = (type) => {
    const colors = {
      concept: 'from-generator-indigo to-indigo-600',
      lyric: 'from-generator-rose to-rose-600',
      mood: 'from-generator-teal to-teal-600',
      beat: 'from-generator-amber to-amber-600'
    };
    return colors?.[type] || 'from-primary to-secondary';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-secondary p-2 flex items-center justify-center">
            <Icon name="Bookmark" size={20} color="white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Saved Concepts</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted/30 rounded-full">
          {concepts?.length} saved
        </span>
      </div>
      <div className="space-y-3">
        {concepts?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="BookmarkX" size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No saved concepts yet</p>
            <p className="text-xs text-muted-foreground mt-1">Save your favorite generations to access them later</p>
          </div>
        ) : (
          concepts?.map((concept) => (
            <div
              key={concept?.id}
              className="p-4 rounded-lg bg-muted/20 border border-white/5 hover:border-white/10 transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getConceptColor(concept?.type)} p-1.5 flex items-center justify-center flex-shrink-0`}>
                  <Icon name={getConceptIcon(concept?.type)} size={16} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground mb-1">{concept?.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{concept?.content}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/70">
                  {new Date(concept.savedAt)?.toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName={copiedId === concept?.id ? 'Check' : 'Copy'}
                    onClick={() => handleCopy(concept?.content, concept?.id)}
                    aria-label="Copy concept"
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    iconName="ExternalLink"
                    aria-label="Open concept"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {concepts?.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          iconName="FolderOpen"
          iconPosition="left"
          className="mt-4"
        >
          View All Saved Concepts
        </Button>
      )}
    </div>
  );
};

export default SavedConceptsCard;