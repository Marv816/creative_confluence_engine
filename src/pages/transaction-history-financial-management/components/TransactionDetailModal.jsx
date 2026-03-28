import { X, FileText, Calendar, DollarSign, User, Music, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const statusConfig = {
  completed: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Completed' },
  pending: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
  processing: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Processing' },
  failed: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' },
  refunded: { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Refunded' },
  disputed: { color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Disputed' }
};

export default function TransactionDetailModal({ transaction, onClose, onInitiateDispute }) {
  const config = statusConfig?.[transaction?.status] || statusConfig?.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Transaction Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Badge */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${config?.bg}`}>
              <span className={`text-sm font-bold ${config?.color}`}>{config?.label}</span>
            </div>
          </div>

          {/* Transaction Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Sound Info */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Music className="h-5 w-5 text-cyan-500" />
                <h3 className="text-sm font-medium text-gray-400">Sound</h3>
              </div>
              <p className="text-white font-medium mb-1">{transaction?.sound?.title || 'Unknown'}</p>
              <p className="text-gray-400 text-sm">{transaction?.sound?.genre || 'N/A'}</p>
            </div>

            {/* Producer Info */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-cyan-500" />
                <h3 className="text-sm font-medium text-gray-400">Producer</h3>
              </div>
              <p className="text-white font-medium">{transaction?.producer?.producer_name || 'Unknown'}</p>
            </div>

            {/* Date */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-cyan-500" />
                <h3 className="text-sm font-medium text-gray-400">Transaction Date</h3>
              </div>
              <p className="text-white font-medium">
                {new Date(transaction?.createdAt)?.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Transaction ID */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-cyan-500" />
                <h3 className="text-sm font-medium text-gray-400">Transaction ID</h3>
              </div>
              <p className="text-white font-mono text-sm break-all">{transaction?.id}</p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="mb-6 p-6 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-cyan-500" />
              <h3 className="text-lg font-bold text-white">Financial Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Purchase Amount</span>
                <span className="text-white font-medium">${transaction?.amount?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Platform Fee (10%)</span>
                <span className="text-white font-medium">${transaction?.platformFee?.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">Producer Revenue</span>
                  <span className="text-green-500 font-bold text-xl">
                    ${transaction?.producerRevenue?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {transaction?.paymentMethod && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Payment Method</h3>
              <p className="text-white font-medium capitalize">{transaction?.paymentMethod}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-white border-white/10"
            >
              Close
            </Button>
            {transaction?.status === 'completed' && (
              <Button
                onClick={onInitiateDispute}
                className="flex-1 bg-orange-500 text-white hover:bg-orange-400 font-bold"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Initiate Dispute
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}