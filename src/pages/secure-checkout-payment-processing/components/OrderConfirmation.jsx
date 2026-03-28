import { CheckCircle, Download, FileText, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

export default function OrderConfirmation({ purchase, sound, license }) {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Purchase Successful!</h2>
        <p className="text-gray-400">Your transaction has been completed securely</p>
      </div>

      {/* Transaction Details */}
      <div className="bg-white/5 rounded-lg p-6 mb-6">
        <h3 className="text-white font-bold mb-4">Transaction Details</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Transaction ID</span>
            <span className="text-white font-mono text-sm">{purchase?.transactionId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Purchase Date</span>
            <span className="text-white">
              {new Date(purchase?.purchasedAt)?.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Amount Paid</span>
            <span className="text-cyan-500 font-bold text-lg">${purchase?.purchasePrice?.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Payment Method</span>
            <span className="text-white capitalize">{purchase?.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Sound & License Info */}
      <div className="bg-white/5 rounded-lg p-6 mb-6">
        <h3 className="text-white font-bold mb-4">Purchased Item</h3>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Sound</p>
            <p className="text-white font-medium">{sound?.title}</p>
            <p className="text-gray-400 text-sm">by {sound?.producer?.producerName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">License Type</p>
            <p className="text-white font-medium capitalize">{license?.licenseType}</p>
          </div>
          {license?.contractDurationDays && (
            <div>
              <p className="text-gray-400 text-sm mb-1">License Duration</p>
              <p className="text-white">{license?.contractDurationDays} days</p>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-6 mb-6">
        <h3 className="text-cyan-500 font-bold mb-4">What's Next?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Download Your Files</p>
              <p className="text-gray-400 text-sm">Access your purchased sound and license certificate</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Review License Terms</p>
              <p className="text-gray-400 text-sm">Check your usage rights and restrictions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Confirmation Email</p>
              <p className="text-gray-400 text-sm">Receipt and download links sent to your email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => navigate('/user-content-dashboard')}
          className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
        >
          <Download className="h-4 w-4 mr-2" />
          View My Purchases
        </Button>
        <Button
          onClick={() => navigate('/community-sound-marketplace')}
          variant="outline"
          className="flex-1 border-white/20 text-white hover:bg-white/5"
        >
          Continue Shopping
        </Button>
      </div>

      <p className="text-gray-500 text-xs text-center mt-6">
        Need help? Contact support at support@blacctopentertainment.com
      </p>
    </div>
  );
}