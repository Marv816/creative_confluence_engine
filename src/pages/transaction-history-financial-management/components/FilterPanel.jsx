import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { X } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'disputed', label: 'Disputed' }
];

export default function FilterPanel({ filters, onFilterChange, onClearFilters }) {
  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Filters</h3>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-cyan-500 hover:text-cyan-400"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Status</label>
          <Select
            value={filters?.status}
            onChange={(value) => onFilterChange('status', value)}
            options={statusOptions}
            className="w-full bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Start Date</label>
          <Input
            type="date"
            value={filters?.startDate}
            onChange={(e) => onFilterChange('startDate', e?.target?.value)}
            className="w-full bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">End Date</label>
          <Input
            type="date"
            value={filters?.endDate}
            onChange={(e) => onFilterChange('endDate', e?.target?.value)}
            className="w-full bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Amount Range */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Min Amount ($)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={filters?.minAmount}
            onChange={(e) => onFilterChange('minAmount', e?.target?.value)}
            placeholder="0.00"
            className="w-full bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Max Amount ($)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={filters?.maxAmount}
            onChange={(e) => onFilterChange('maxAmount', e?.target?.value)}
            placeholder="1000.00"
            className="w-full bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>
    </div>
  );
}