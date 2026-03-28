import React from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';

const SearchFilterBar = ({ searchQuery, filterType, filterTag, onSearch, onFilterChange }) => {
  const contentTypes = [
    { value: 'all', label: 'All Content', icon: 'Grid' },
    { value: 'lyrics', label: 'Lyrics', icon: 'FileText' },
    { value: 'chords', label: 'Chords', icon: 'Music' },
    { value: 'presets', label: 'Presets', icon: 'Bookmark' }
  ];

  const popularTags = [
    'Hip-Hop',
    'Trap',
    'R&B',
    'Pop',
    'chill',
    'upbeat',
    'dark',
    'jazzy'
  ];

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search lyrics, chords, presets..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e?.target?.value)}
              className="w-full h-10 pl-10 pr-4 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contentTypes?.map((type) => (
            <Button
              key={type?.value}
              onClick={() => onFilterChange?.(type?.value, filterTag)}
              size="sm"
              variant={filterType === type?.value ? 'default' : 'outline'}
              iconName={type?.icon}
              iconPosition="left"
              className="whitespace-nowrap"
            >
              {type?.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Tag" size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filter by tag:</span>
          {filterTag && (
            <button
              onClick={() => onFilterChange?.(filterType, '')}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags?.map((tag) => (
            <button
              key={tag}
              onClick={() => onFilterChange?.(filterType, filterTag === tag ? '' : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;