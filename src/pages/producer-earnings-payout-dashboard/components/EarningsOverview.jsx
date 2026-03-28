import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function EarningsOverview({ earnings, payoutSchedule, producerProfile }) {
  const stats = [
    {
      label: 'Current Balance',
      value: `$${earnings?.currentBalance?.toFixed(2) || '0.00'}`,
      subtext: 'Available for payout',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Pending Balance',
      value: `$${earnings?.pendingBalance?.toFixed(2) || '0.00'}`,
      subtext: 'In escrow (7 days)',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Lifetime Earnings',
      value: `$${earnings?.lifetimeEarnings?.toFixed(2) || '0.00'}`,
      subtext: 'Total revenue earned',
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      label: 'Total Payouts',
      value: `$${earnings?.totalPayouts?.toFixed(2) || '0.00'}`,
      subtext: 'Successfully withdrawn',
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats?.map((stat) => {
          const Icon = stat?.icon;
          return (
            <div
              key={stat?.label}
              className="bg-gray-900 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat?.color}`} />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat?.label}</h3>
              <p className="text-white text-3xl font-bold mb-1">{stat?.value}</p>
              <p className="text-gray-500 text-xs">{stat?.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Payout Schedule Info */}
      {payoutSchedule && (
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-bold text-lg mb-4">Next Scheduled Payout</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Payout Date</p>
              <p className="text-white font-medium">
                {payoutSchedule?.nextPayoutDate
                  ? new Date(payoutSchedule?.nextPayoutDate)?.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Not scheduled'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Schedule Type</p>
              <p className="text-white font-medium capitalize">{payoutSchedule?.scheduleType || 'Monthly'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Minimum Amount</p>
              <p className="text-white font-medium">${payoutSchedule?.minimumPayoutAmount?.toFixed(2) || '50.00'}</p>
            </div>
          </div>

          {payoutSchedule?.autoPayoutEnabled && (
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-cyan-500 text-sm">
                ✓ Automatic payouts enabled - Funds will be transferred automatically when minimum is reached
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}