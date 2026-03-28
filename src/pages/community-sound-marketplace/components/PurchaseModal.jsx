import { X, ShoppingCart, Check, FileText } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../components/ui/Button';

import { supabase } from '../../../lib/supabase';
import paymentService from '../../../services/paymentService';
import { useAuth } from '../../../contexts/AuthContext';

export default function PurchaseModal({ sound, onClose }) {
  const { user } = useAuth();
  const [selectedLicense, setSelectedLicense] = useState(sound?.licenses?.[0]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async () => {
    try {
      setProcessing(true);
      setError(null);

      if (!user) {
        setError('Please sign in to complete purchase');
        return;
      }

      if (!selectedLicense) {
        setError('Please select a license');
        return;
      }

      const platformFee = selectedLicense?.price * 0.10;
      const producerRevenue = selectedLicense?.price - platformFee;

      const { data: purchase, error: purchaseError } = await supabase?.from('marketplace_purchases')?.insert({
          buyer_id: user?.id,
          sound_id: sound?.id,
          license_id: selectedLicense?.id,
          producer_id: sound?.producer_id,
          purchase_price: selectedLicense?.price,
          platform_fee: platformFee?.toFixed(2),
          producer_revenue: producerRevenue?.toFixed(2),
          status: 'pending',
          payment_method: 'card'
        })?.select()?.single();

      if (purchaseError) throw purchaseError;

      await paymentService?.createPaymentIntent({
        purchaseId: purchase?.id,
        producerId: sound?.producer_id,
        soundId: sound?.id,
        amount: selectedLicense?.price,
        paymentMethod: 'card',
        metadata: {
          licenseType: selectedLicense?.license_type,
          soundTitle: sound?.title
        }
      });

      window.location.href = `/secure-checkout-payment-processing?purchaseId=${purchase?.id}`;
    } catch (err) {
      setError(err?.message || 'Failed to proceed to checkout');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Purchase Sound</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Purchase Successful!</h3>
              <p className="text-gray-400">Your download will begin shortly.</p>
            </div>
          ) : (
            <>
              {/* Sound Info */}
              <div className="flex gap-4 mb-6 p-4 bg-white/5 rounded-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded flex items-center justify-center flex-shrink-0">
                  <FileText className="h-8 w-8 text-white/40" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{sound?.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{sound?.producer?.producer_name}</p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {sound?.genre && <span>{sound?.genre}</span>}
                    {sound?.bpm && <span>• {sound?.bpm} BPM</span>}
                    {sound?.key_signature && <span>• {sound?.key_signature}</span>}
                  </div>
                </div>
              </div>

              {/* License Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Select License Type</h4>
                <div className="space-y-3">
                  {sound?.licenses?.map((license) => (
                    <button
                      key={license?.id}
                      onClick={() => setSelectedLicense(license)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedLicense?.id === license?.id
                          ? 'border-cyan-500 bg-cyan-500/10' :'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold capitalize">{license?.license_type}</span>
                        <span className="text-cyan-500 font-bold text-lg">
                          ${license?.price?.toFixed(2)}
                        </span>
                      </div>
                      {license?.usage_terms && (
                        <p className="text-gray-400 text-sm">{license?.usage_terms}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                        {license?.distribution_limit && (
                          <span>• {license?.distribution_limit?.toLocaleString()} distributions</span>
                        )}
                        {license?.streaming_limit && (
                          <span>• {license?.streaming_limit?.toLocaleString()} streams</span>
                        )}
                        {license?.allows_music_video && <span>• Music video allowed</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* License Details */}
              {selectedLicense && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">License Includes</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      High-quality audio file (WAV/MP3)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {selectedLicense?.allows_radio ? 'Radio broadcasting allowed' : 'No radio broadcasting'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {selectedLicense?.allows_music_video ? 'Music video creation allowed' : 'No music videos'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {selectedLicense?.allows_profit_performances ? 'Profit performances allowed' : 'Non-profit only'}
                    </li>
                    {selectedLicense?.contract_duration_days && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {selectedLicense?.contract_duration_days} days license duration
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Purchase Summary */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">License Price</span>
                  <span className="text-white font-medium">${selectedLicense?.price?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Platform Fee (10%)</span>
                  <span className="text-white font-medium">${(selectedLicense?.price * 0.1)?.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-cyan-500 font-bold text-xl">${selectedLicense?.price?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 text-white border-white/10"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
                  disabled={processing || !selectedLicense}
                >
                  {processing ? (
                    'Processing...'
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}