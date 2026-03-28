import React from 'react';
import { Filter, Grid, List } from 'lucide-react';

const FilterBar = ({ filterType, onFilterChange, viewMode, onViewModeChange }) => {
  const filters = [
    { value: 'all', label: 'All Projects' },
    { value: 'owned', label: 'Owned by Me' },
    { value: 'shared', label: 'Shared with Me' },
    { value: 'recent', label: 'Recently Updated' }
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Filter Buttons */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
        {filters?.map((filter) => (
          <button
            key={filter?.value}
            onClick={() => onFilterChange(filter?.value)}
            className={`px-4 py-2 text-sm font-bold rounded transition-all duration-300 ${
              filterType === filter?.value
                ? 'bg-cyan-500 text-black' :'text-gray-400 hover:text-white'
            }`}
          >
            {filter?.label}
          </button>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded transition-all duration-300 ${
            viewMode === 'grid' ?'bg-cyan-500 text-black' :'text-gray-400 hover:text-white'
          }`}
          title="Grid View"
        >
          <Grid className="h-5 w-5" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded transition-all duration-300 ${
            viewMode === 'list' ?'bg-cyan-500 text-black' :'text-gray-400 hover:text-white'
          }`}
          title="List View"
        >
          <List className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
