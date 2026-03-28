import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function FinancialSummary({ summary }) {
  const stats = [
    {
      label: 'Total Earnings',
      value: `$${summary?.totalEarnings || '0.00'}`,
      icon: DollarSign,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    },
    {
      label: 'Total Paid Out',
      value: `$${summary?.totalPaidOut || '0.00'}`,
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      label: 'Available Balance',
      value: `$${summary?.availableBalance || '0.00'}`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Pending Payouts',
      value: `$${summary?.pendingPayouts || '0.00'}`,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats?.map((stat, index) => {
        const Icon = stat?.icon;
        return (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat?.bg}`}>
                <Icon className={`h-6 w-6 ${stat?.color}`} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{stat?.value}</h3>
            <p className="text-gray-400 text-sm">{stat?.label}</p>
          </div>
        );
      })}
    </div>
  );
}