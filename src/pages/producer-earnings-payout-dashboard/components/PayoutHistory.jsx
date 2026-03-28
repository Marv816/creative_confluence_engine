import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function PayoutHistory({ payoutTransactions }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      case 'processing':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white">Payout History</h2>
        <p className="text-gray-400 mt-1">View all your payout transactions</p>
      </div>

      <div className="divide-y divide-white/10">
        {payoutTransactions?.length > 0 ? (
          payoutTransactions?.map((payout) => (
            <div key={payout?.id} className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(payout?.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-bold">Payout #{payout?.id?.slice(0, 8)}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          getStatusColor(payout?.status)
                        }`}
                      >
                        {payout?.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Amount</p>
                        <p className="text-white font-medium">${payout?.amount?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Processing Fee</p>
                        <p className="text-white font-medium">${payout?.processingFee?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Net Amount</p>
                        <p className="text-green-500 font-bold">${payout?.netAmount?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Method</p>
                        <p className="text-white font-medium capitalize">
                          {payout?.payoutMethod?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Initiated: {new Date(payout?.initiatedAt)?.toLocaleDateString('en-US')}
                      </span>
                      {payout?.completedAt && (
                        <span>
                          Completed: {new Date(payout?.completedAt)?.toLocaleDateString('en-US')}
                        </span>
                      )}
                      {payout?.stripePayoutId && (
                        <span>Stripe ID: {payout?.stripePayoutId}</span>
                      )}
                    </div>
                    {payout?.failureReason && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                        <p className="text-red-500 text-sm">{payout?.failureReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No payout history yet</p>
            <p className="text-gray-500 text-sm mt-1">Your payouts will appear here once processed</p>
          </div>
        )}
      </div>
    </div>
  );
}