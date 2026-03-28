import { Download, DollarSign, Calendar } from 'lucide-react';

export default function TransactionHistory({ earningsBreakdown }) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white">Transaction History</h2>
        <p className="text-gray-400 mt-1">All your sales and earnings</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Platform Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Your Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {earningsBreakdown?.length > 0 ? (
              earningsBreakdown?.map((transaction, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-white text-sm">
                        {new Date(transaction?.purchasedAt)?.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-cyan-500" />
                      <span className="text-white text-sm">Sound Purchase</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-medium">${transaction?.purchasePrice?.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-red-400">-${transaction?.platformFee?.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-500 font-bold">${transaction?.producerRevenue?.toFixed(2)}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No transactions yet</p>
                  <p className="text-gray-500 text-sm mt-1">Your sales will appear here</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {earningsBreakdown?.length > 0 && (
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Transactions</span>
            <span className="text-white font-bold">{earningsBreakdown?.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}