import { Music, DollarSign, Shield, Clock } from 'lucide-react';

export default function CartSummary({ sound, selectedLicense, currentStep }) {
  const platformFee = selectedLicense?.price ? selectedLicense?.price * 0.1 : 0;
  const producerRevenue = selectedLicense?.price ? selectedLicense?.price * 0.9 : 0;

  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg p-6 sticky top-8">
      <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

      {/* Sound Info */}
      {sound && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded flex items-center justify-center flex-shrink-0">
              <Music className="h-8 w-8 text-white/60" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold truncate">{sound?.title}</h4>
              <p className="text-gray-400 text-sm truncate">{sound?.producer?.producerName}</p>
              <div className="flex gap-2 mt-1 text-xs text-gray-500">
                {sound?.genre && <span>{sound?.genre}</span>}
                {sound?.bpm && <span>• {sound?.bpm} BPM</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Details */}
      {selectedLicense && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400">License Type</span>
            <span className="text-white font-medium capitalize">{selectedLicense?.licenseType}</span>
          </div>

          <div className="space-y-2 text-sm">
            {selectedLicense?.distributionLimit && (
              <div className="flex items-center justify-between text-gray-400">
                <span>Distribution Limit</span>
                <span>{selectedLicense?.distributionLimit?.toLocaleString()}</span>
              </div>
            )}
            {selectedLicense?.streamingLimit && (
              <div className="flex items-center justify-between text-gray-400">
                <span>Streaming Limit</span>
                <span>{selectedLicense?.streamingLimit?.toLocaleString()}</span>
              </div>
            )}
            {selectedLicense?.contractDurationDays && (
              <div className="flex items-center justify-between text-gray-400">
                <span>License Duration</span>
                <span>{selectedLicense?.contractDurationDays} days</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      {selectedLicense && (
        <div className="border-t border-white/10 pt-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">License Price</span>
              <span className="text-white font-medium">${selectedLicense?.price?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Platform Fee (10%)</span>
              <span className="text-gray-400">${platformFee?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Producer Revenue (90%)</span>
              <span className="text-green-400">${producerRevenue?.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-white/10 mt-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-cyan-500 font-bold text-2xl">${selectedLicense?.price?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Security Features */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-medium">Secure Payment</p>
            <p className="text-gray-400 text-xs">PCI-compliant processing via Stripe</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-medium">7-Day Escrow</p>
            <p className="text-gray-400 text-xs">Funds held securely until delivery</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-medium">Instant Access</p>
            <p className="text-gray-400 text-xs">Download immediately after payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}