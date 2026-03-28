import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const PromptFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const moodOptions = [
    { value: 'all', label: 'All Moods' },
    { value: 'uplifting', label: 'Uplifting' },
    { value: 'melancholic', label: 'Melancholic' },
    { value: 'aggressive', label: 'Aggressive' },
    { value: 'peaceful', label: 'Peaceful' },
    { value: 'mysterious', label: 'Mysterious' },
  ];

  const complexityOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'difficulty-asc', label: 'Difficulty: Low to High' },
    { value: 'difficulty-desc', label: 'Difficulty: High to Low' },
    { value: 'time-asc', label: 'Time: Short to Long' },
    { value: 'time-desc', label: 'Time: Long to Short' },
  ];

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Filter" size={20} />
          Filter Prompts
        </h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-primary hover:text-primary/80 transition-colors focus-ring rounded px-2 py-1"
        >
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Mood"
          options={moodOptions}
          value={filters?.mood}
          onChange={(value) => onFilterChange('mood', value)}
        />
        <Select
          label="Complexity"
          options={complexityOptions}
          value={filters?.complexity}
          onChange={(value) => onFilterChange('complexity', value)}
        />
        <Select
          label="Sort By"
          options={sortOptions}
          value={filters?.sort}
          onChange={(value) => onFilterChange('sort', value)}
        />
      </div>
    </div>
  );
};

export default PromptFilters;