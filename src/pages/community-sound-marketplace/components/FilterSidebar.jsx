import { Filter, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

export default function FilterSidebar({ filters, onFilterChange, onClearFilters }) {
  const genres = [
    { value: '', label: 'All Genres' },
    { value: 'Hip-Hop', label: 'Hip-Hop' },
    { value: 'Trap', label: 'Trap' },
    { value: 'R&B', label: 'R&B' },
    { value: 'Pop', label: 'Pop' },
    { value: 'Lo-Fi', label: 'Lo-Fi' },
    { value: 'Drill', label: 'Drill' },
    { value: 'Afrobeat', label: 'Afrobeat' },
    { value: 'Electronic', label: 'Electronic' },
    { value: 'Ambient', label: 'Ambient' },
  ];

  const soundTypes = [
    { value: '', label: 'All Types' },
    { value: 'beat', label: 'Beats' },
    { value: 'sample', label: 'Samples' },
    { value: 'loop', label: 'Loops' },
    { value: 'vocal', label: 'Vocals' },
    { value: 'sfx', label: 'Sound Effects' },
  ];

  const keySignatures = [
    { value: '', label: 'Any Key' },
    { value: 'C', label: 'C' },
    { value: 'C#', label: 'C#' },
    { value: 'D', label: 'D' },
    { value: 'D#', label: 'D#' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
    { value: 'F#', label: 'F#' },
    { value: 'G', label: 'G' },
    { value: 'G#', label: 'G#' },
    { value: 'A', label: 'A' },
    { value: 'A#', label: 'A#' },
    { value: 'B', label: 'B' },
    { value: 'Am', label: 'Am' },
    { value: 'Bm', label: 'Bm' },
    { value: 'Cm', label: 'Cm' },
    { value: 'Dm', label: 'Dm' },
    { value: 'Em', label: 'Em' },
    { value: 'Fm', label: 'Fm' },
    { value: 'Gm', label: 'Gm' },
  ];

  const hasActiveFilters = Object.values(filters)?.some(v => v !== '');

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="space-y-6">
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Genre
          </label>
          <Select
            value={filters?.genre}
            onChange={(e) => onFilterChange('genre', e?.target?.value)}
            className="w-full bg-white/5 border-white/10 text-white"
          >
            {genres?.map((genre) => (
              <option key={genre?.value} value={genre?.value}>
                {genre?.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Sound Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Type
          </label>
          <Select
            value={filters?.soundType}
            onChange={(e) => onFilterChange('soundType', e?.target?.value)}
            className="w-full bg-white/5 border-white/10 text-white"
          >
            {soundTypes?.map((type) => (
              <option key={type?.value} value={type?.value}>
                {type?.label}
              </option>
            ))}
          </Select>
        </div>

        {/* BPM Range */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            BPM Range
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters?.minBpm}
              onChange={(e) => onFilterChange('minBpm', e?.target?.value)}
              className="w-full bg-white/5 border-white/10 text-white"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters?.maxBpm}
              onChange={(e) => onFilterChange('maxBpm', e?.target?.value)}
              className="w-full bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        {/* Key Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Key Signature
          </label>
          <Select
            value={filters?.keySignature}
            onChange={(e) => onFilterChange('keySignature', e?.target?.value)}
            className="w-full bg-white/5 border-white/10 text-white"
          >
            {keySignatures?.map((key) => (
              <option key={key?.value} value={key?.value}>
                {key?.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Price Range
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min $"
              value={filters?.minPrice}
              onChange={(e) => onFilterChange('minPrice', e?.target?.value)}
              className="w-full bg-white/5 border-white/10 text-white"
            />
            <Input
              type="number"
              placeholder="Max $"
              value={filters?.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e?.target?.value)}
              className="w-full bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        {/* Mood Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Mood
          </label>
          <div className="flex flex-wrap gap-2">
            {['Dark', 'Chill', 'Energetic', 'Aggressive', 'Mellow', 'Atmospheric']?.map((mood) => (
              <button
                key={mood}
                className="px-3 py-1 text-xs bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-500 border border-white/10 hover:border-cyan-500/30 rounded-full transition-colors"
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}