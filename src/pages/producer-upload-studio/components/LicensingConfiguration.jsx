import { X } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';


export default function LicensingConfiguration({ licenses, onChange, onRemove }) {
  const licenseTypes = [
    { value: 'lease', label: 'Lease' },
    { value: 'exclusive', label: 'Exclusive' },
    { value: 'free', label: 'Free' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-4">
      {licenses?.map((license, index) => (
        <div key={index} className="p-6 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white capitalize">
              License {index + 1}: {license?.license_type}
            </h4>
            {licenses?.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* License Type & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  License Type
                </label>
                <Select
                  value={license?.license_type}
                  onChange={(e) => onChange(index, 'license_type', e?.target?.value)}
                  className="w-full bg-white/5 border-white/10 text-white"
                >
                  {licenseTypes?.map((type) => (
                    <option key={type?.value} value={type?.value}>
                      {type?.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Price ($)
                </label>
                <Input
                  type="number"
                  value={license?.price}
                  onChange={(e) => onChange(index, 'price', parseFloat(e?.target?.value))}
                  placeholder="29.99"
                  step="0.01"
                  min="0"
                  className="w-full bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Usage Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Usage Terms
              </label>
              <textarea
                value={license?.usage_terms}
                onChange={(e) => onChange(index, 'usage_terms', e?.target?.value)}
                placeholder="Describe the license terms and restrictions..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Distribution & Streaming Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Distribution Limit
                </label>
                <Input
                  type="number"
                  value={license?.distribution_limit || ''}
                  onChange={(e) => onChange(index, 'distribution_limit', e?.target?.value ? parseInt(e?.target?.value) : null)}
                  placeholder="5000 (leave empty for unlimited)"
                  className="w-full bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Streaming Limit
                </label>
                <Input
                  type="number"
                  value={license?.streaming_limit || ''}
                  onChange={(e) => onChange(index, 'streaming_limit', e?.target?.value ? parseInt(e?.target?.value) : null)}
                  placeholder="500000 (leave empty for unlimited)"
                  className="w-full bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Allowed Uses
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={license?.allows_radio}
                    onChange={(e) => onChange(index, 'allows_radio', e?.target?.checked)}
                  />
                  <span className="text-white">Radio Broadcasting</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={license?.allows_music_video}
                    onChange={(e) => onChange(index, 'allows_music_video', e?.target?.checked)}
                  />
                  <span className="text-white">Music Video Creation</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={license?.allows_profit_performances}
                    onChange={(e) => onChange(index, 'allows_profit_performances', e?.target?.checked)}
                  />
                  <span className="text-white">Profit Performances</span>
                </label>
              </div>
            </div>

            {/* Contract Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contract Duration (Days)
              </label>
              <Input
                type="number"
                value={license?.contract_duration_days || ''}
                onChange={(e) => onChange(index, 'contract_duration_days', e?.target?.value ? parseInt(e?.target?.value) : null)}
                placeholder="365 (leave empty for perpetual)"
                className="w-full bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}