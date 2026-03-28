import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

export default function PayoutSettings({ payoutSchedule, earnings, onUpdate }) {
  const [scheduleType, setScheduleType] = useState(payoutSchedule?.scheduleType || 'monthly');
  const [minimumAmount, setMinimumAmount] = useState(payoutSchedule?.minimumPayoutAmount || 50);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(payoutSchedule?.autoPayoutEnabled ?? true);
  const [payoutMethod, setPayoutMethod] = useState(earnings?.payoutMethod || 'stripe_connect');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate?.({
        scheduleType,
        minimumPayoutAmount: parseFloat(minimumAmount),
        autoPayoutEnabled
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
            <Settings className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Payout Settings</h2>
            <p className="text-gray-400">Configure your payout preferences</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Payout Schedule */}
        <div>
          <h3 className="text-white font-bold mb-4">Payout Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Schedule Type</label>
              <Select
                value={scheduleType}
                onChange={(e) => setScheduleType(e?.target?.value)}
                className="w-full"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
              <p className="text-gray-500 text-xs mt-1">
                How often you want to receive automatic payouts
              </p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Minimum Payout Amount</label>
              <Input
                type="number"
                min="50"
                step="10"
                value={minimumAmount}
                onChange={(e) => setMinimumAmount(e?.target?.value)}
                className="w-full"
              />
              <p className="text-gray-500 text-xs mt-1">
                Minimum balance required to trigger payout (min: $50)
              </p>
            </div>
          </div>
        </div>

        {/* Auto Payout */}
        <div className="p-4 bg-white/5 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPayoutEnabled}
              onChange={(e) => setAutoPayoutEnabled(e?.target?.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
            />
            <div>
              <p className="text-white font-medium">Enable Automatic Payouts</p>
              <p className="text-gray-400 text-sm">
                Automatically transfer funds when minimum amount is reached
              </p>
            </div>
          </label>
        </div>

        {/* Payout Method */}
        <div>
          <h3 className="text-white font-bold mb-4">Payout Method</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="radio"
                name="payoutMethod"
                value="stripe_connect"
                checked={payoutMethod === 'stripe_connect'}
                onChange={(e) => setPayoutMethod(e?.target?.value)}
                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <p className="text-white font-medium">Stripe Connect</p>
                <p className="text-gray-400 text-sm">Direct deposit to your bank account (2% fee)</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="radio"
                name="payoutMethod"
                value="paypal"
                checked={payoutMethod === 'paypal'}
                onChange={(e) => setPayoutMethod(e?.target?.value)}
                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <p className="text-white font-medium">PayPal</p>
                <p className="text-gray-400 text-sm">Transfer to your PayPal account (2.5% fee)</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="radio"
                name="payoutMethod"
                value="bank_transfer"
                checked={payoutMethod === 'bank_transfer'}
                onChange={(e) => setPayoutMethod(e?.target?.value)}
                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <p className="text-white font-medium">Bank Transfer</p>
                <p className="text-gray-400 text-sm">Direct bank transfer (1.5% fee, 3-5 business days)</p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold px-8"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}