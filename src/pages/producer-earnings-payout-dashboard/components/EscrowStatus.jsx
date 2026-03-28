import { Clock, CheckCircle } from 'lucide-react';

export default function EscrowStatus({ escrowTransactions }) {
  const heldTransactions = escrowTransactions?.filter((t) => t?.status === 'held') || [];
  const totalHeld = heldTransactions?.reduce((sum, t) => sum + t?.amount, 0) || 0;

  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">Escrow Status</h3>
          <p className="text-gray-400 text-sm">Funds held for security (7-day release)</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Total in Escrow</p>
          <p className="text-yellow-500 font-bold text-2xl">${totalHeld?.toFixed(2)}</p>
        </div>
      </div>

      {heldTransactions?.length > 0 ? (
        <div className="space-y-3">
          {heldTransactions?.map((escrow) => {
            const releaseDate = new Date(escrow?.releaseDate);
            const now = new Date();
            const daysRemaining = Math.ceil((releaseDate - now) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={escrow?.id}
                className="p-4 bg-white/5 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">${escrow?.amount?.toFixed(2)}</p>
                      <p className="text-gray-400 text-sm">
                        Held since {new Date(escrow?.heldAt)?.toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-500 font-medium">
                      {daysRemaining > 0 ? `${daysRemaining} days` : 'Releasing soon'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Release: {releaseDate?.toLocaleDateString('en-US')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-400">No funds currently in escrow</p>
          <p className="text-gray-500 text-sm mt-1">All transactions have been released</p>
        </div>
      )}
    </div>
  );
}