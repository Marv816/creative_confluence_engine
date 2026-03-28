import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function RevenueChart({ earningsBreakdown, timeRange }) {
  // Group earnings by date
  const chartData = earningsBreakdown?.reduce((acc, transaction) => {
    const date = new Date(transaction?.purchasedAt)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const existing = acc?.find((item) => item?.date === date);
    if (existing) {
      existing.revenue += transaction?.producerRevenue;
      existing.sales += 1;
    } else {
      acc?.push({
        date,
        revenue: transaction?.producerRevenue,
        sales: 1
      });
    }
    return acc;
  }, []) || [];

  const totalRevenue = earningsBreakdown?.reduce((sum, t) => sum + t?.producerRevenue, 0) || 0;
  const totalSales = earningsBreakdown?.length || 0;
  const averageRevenue = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-white text-2xl font-bold">${totalRevenue?.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Sales</p>
              <p className="text-white text-2xl font-bold">{totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Average Sale</p>
              <p className="text-white text-2xl font-bold">${averageRevenue?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-6">Revenue Over Time</h3>
        {chartData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No revenue data for selected time range</p>
          </div>
        )}
      </div>

      {/* Sales Chart */}
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-bold text-lg mb-6">Sales Volume</h3>
        {chartData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Sales Count"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No sales data for selected time range</p>
          </div>
        )}
      </div>
    </div>
  );
}