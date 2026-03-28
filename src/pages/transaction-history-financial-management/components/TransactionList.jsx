import { CheckCircle, XCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Completed' },
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
  processing: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Processing' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' },
  refunded: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Refunded' },
  disputed: { icon: AlertTriangle, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Disputed' }
};

export default function TransactionList({ transactions, onViewDetails, onInitiateDispute }) {
  const getStatusConfig = (status) => statusConfig?.[status] || statusConfig?.pending;

  return (
    <div className="space-y-4">
      {transactions?.map((transaction) => {
        const config = getStatusConfig(transaction?.status);
        const StatusIcon = config?.icon;

        return (
          <div
            key={transaction?.id}
            className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {transaction?.sound?.title || 'Unknown Sound'}
                  </h3>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded ${config?.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${config?.color}`} />
                    <span className={`text-xs font-medium ${config?.color}`}>
                      {config?.label}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">
                  {transaction?.producer?.producer_name || 'Unknown Producer'}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(transaction?.createdAt)?.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span>ID: {transaction?.id?.substring(0, 8)}...</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-500 mb-1">
                  ${transaction?.amount?.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  Fee: ${transaction?.platformFee?.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-black/30 rounded">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-white font-medium">${transaction?.amount?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Platform Fee</p>
                <p className="text-white font-medium">${transaction?.platformFee?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Producer Revenue</p>
                <p className="text-green-500 font-medium">${transaction?.producerRevenue?.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => onViewDetails(transaction)}
                variant="ghost"
                className="flex-1 text-white border-white/10"
              >
                View Details
              </Button>
              {transaction?.status === 'completed' && (
                <Button
                  onClick={() => onInitiateDispute(transaction)}
                  variant="ghost"
                  className="flex-1 text-orange-500 border-orange-500/20"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Dispute
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}