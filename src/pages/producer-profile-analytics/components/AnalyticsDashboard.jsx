import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

import { Line, Bar } from 'recharts';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = ({ analytics, producer, isOwner }) => {
  const [timeRange, setTimeRange] = useState('30');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (analytics) {
      calculateSummary();
    }
  }, [analytics]);

  const calculateSummary = () => {
    const total = analytics?.reduce(
      (acc, day) => ({
        plays: acc?.plays + (day?.plays || 0),
        downloads: acc?.downloads + (day?.downloads || 0),
        sales: acc?.sales + (day?.sales || 0),
        revenue: acc?.revenue + parseFloat(day?.revenue || 0),
        followers: acc?.followers + (day?.newFollowers || 0)
      }),
      { plays: 0, downloads: 0, sales: 0, revenue: 0, followers: 0 }
    );
    setSummary(total);
  };

  const chartData = analytics?.map(item => ({
    date: new Date(item?.date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    plays: item?.plays || 0,
    sales: item?.sales || 0,
    revenue: parseFloat(item?.revenue || 0),
    followers: item?.newFollowers || 0
  }));

  const statCards = [
    {
      label: 'Total Plays',
      value: summary?.plays || 0,
      icon: 'Play',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Total Sales',
      value: summary?.sales || 0,
      icon: 'ShoppingCart',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Revenue',
      value: `$${(summary?.revenue || 0)?.toFixed(2)}`,
      icon: 'DollarSign',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'New Followers',
      value: summary?.followers || 0,
      icon: 'Users',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  if (!isOwner) {
    return (
      <div className="glass-card p-12 text-center">
        <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Private</h3>
        <p className="text-muted-foreground">
          Only the producer can view detailed analytics
        </p>
      </div>
    );
  }

  if (!analytics || analytics?.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Icon name="TrendingUp" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground">
          Analytics data will appear here once you have activity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards?.map((stat, index) => (
          <div key={index} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
                <Icon name={stat?.icon} size={24} className={stat?.color} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat?.label}</p>
            <p className="text-3xl font-bold text-foreground">{stat?.value}</p>
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Plays & Sales Trends</h3>
          <div className="flex gap-2">
            {['7', '30', '90']?.map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  timeRange === days
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="plays" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Sounds</h3>
          <div className="space-y-3">
            {[1, 2, 3]?.map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Icon name="Music" size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sound Title {i}</p>
                    <p className="text-xs text-muted-foreground">1,234 plays</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">$89.99</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {[
              { country: 'United States', percentage: 45 },
              { country: 'United Kingdom', percentage: 22 },
              { country: 'Canada', percentage: 15 },
              { country: 'Germany', percentage: 10 },
              { country: 'Other', percentage: 8 }
            ]?.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{item?.country}</span>
                  <span className="text-sm font-semibold text-primary">{item?.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${item?.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;