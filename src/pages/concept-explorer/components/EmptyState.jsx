import React from 'react';
import Icon from '../../../components/AppIcon';

const EmptyState = () => {
  return (
    <div className="glass-card p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-400/20 flex items-center justify-center">
          <Icon name="Lightbulb" size={40} className="text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-3">
          Start Your Creative Journey
        </h3>
        
        <p className="text-muted-foreground mb-6">
          Enter a seed word above to generate an AI-powered concept map with semantic associations, related terms, and creative connections.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="glass-card p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Sparkles" size={18} className="text-indigo-500" />
              <span className="text-sm font-medium text-foreground">Discover</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Find unexpected word connections
            </p>
          </div>

          <div className="glass-card p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Network" size={18} className="text-purple-400" />
              <span className="text-sm font-medium text-foreground">Explore</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Navigate semantic relationships
            </p>
          </div>

          <div className="glass-card p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Save" size={18} className="text-cyan-500" />
              <span className="text-sm font-medium text-foreground">Create</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Save concepts to your workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;