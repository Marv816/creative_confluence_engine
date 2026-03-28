import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Calendar, Download, Settings, AlertCircle } from 'lucide-react';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { earningsService } from '../../services/paymentService';
import { marketplaceService } from '../../services/marketplaceService';
import Button from '../../components/ui/Button';
import EarningsOverview from './components/EarningsOverview';
import RevenueChart from './components/RevenueChart';
import PayoutHistory from './components/PayoutHistory';
import PayoutSettings from './components/PayoutSettings';
import EscrowStatus from './components/EscrowStatus';
import TransactionHistory from './components/TransactionHistory';
import Icon from '../../components/AppIcon';


export default function ProducerEarningsPayoutDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [producerProfile, setProducerProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [earningsBreakdown, setEarningsBreakdown] = useState([]);
  const [payoutSchedule, setPayoutSchedule] = useState(null);
  const [payoutTransactions, setPayoutTransactions] = useState([]);
  const [escrowTransactions, setEscrowTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(30);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get producer profile
      const { data: profiles } = await marketplaceService?.supabase
        ?.from('producer_profiles')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.single();

      if (!profiles) {
        throw new Error('Producer profile not found. Please create a producer profile first.');
      }

      setProducerProfile(profiles);

      // Load all financial data
      const [
        earningsData,
        breakdownData,
        scheduleData,
        payoutsData,
        escrowData
      ] = await Promise.all([
        earningsService?.getProducerEarnings(profiles?.id),
        earningsService?.getEarningsBreakdown(profiles?.id, timeRange),
        earningsService?.getPayoutSchedule(profiles?.id),
        earningsService?.getPayoutTransactions(profiles?.id),
        earningsService?.getEscrowTransactions(profiles?.id)
      ]);

      setEarnings(earningsData);
      setEarningsBreakdown(breakdownData);
      setPayoutSchedule(scheduleData);
      setPayoutTransactions(payoutsData);
      setEscrowTransactions(escrowData);
    } catch (err) {
      console.error('Load dashboard error:', err);
      setError(err?.message || 'Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      setError(null);
      await earningsService?.requestPayout(producerProfile?.id);
      await loadDashboardData();
    } catch (err) {
      setError(err?.message || 'Failed to request payout');
    }
  };

  const handleUpdatePayoutSettings = async (updates) => {
    try {
      setError(null);
      await earningsService?.updatePayoutSchedule(producerProfile?.id, updates);
      await loadDashboardData();
    } catch (err) {
      setError(err?.message || 'Failed to update payout settings');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'payouts', label: 'Payout History', icon: Calendar },
    { id: 'transactions', label: 'Transactions', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <HeaderNavigation
          isAuthenticated={false}
          onAuthClick={() => navigate('/login')}
        />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to view your earnings dashboard</p>
            <Button
              onClick={() => navigate('/login')}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <HeaderNavigation isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading earnings dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !producerProfile) {
    return (
      <div className="min-h-screen bg-black">
        <HeaderNavigation isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Profile Required</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => navigate('/producer-upload-studio')}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
            >
              Create Producer Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <HeaderNavigation isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Earnings & Payouts</h1>
              <p className="text-gray-400">Manage your revenue and payment settings</p>
            </div>
            <Button
              onClick={handleRequestPayout}
              disabled={!earnings || earnings?.currentBalance < 50}
              className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
            >
              <Download className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </div>

          {earnings?.currentBalance < 50 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-medium">Minimum Payout Not Met</p>
                <p className="text-yellow-400 text-sm mt-1">
                  You need at least $50.00 in your current balance to request a payout. Current balance: $
                  {earnings?.currentBalance?.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-2">
            <div className="flex flex-wrap gap-2">
              {tabs?.map((tab) => {
                const Icon = tab?.icon;
                return (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === tab?.id
                        ? 'bg-cyan-500 text-black' :'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab?.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <EarningsOverview
                earnings={earnings}
                payoutSchedule={payoutSchedule}
                producerProfile={producerProfile}
              />
              <EscrowStatus escrowTransactions={escrowTransactions} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Revenue Analytics</h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(Number(e?.target?.value))}
                  className="bg-gray-900 border border-white/10 text-white rounded-lg px-4 py-2"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
              </div>
              <RevenueChart earningsBreakdown={earningsBreakdown} timeRange={timeRange} />
            </div>
          )}

          {activeTab === 'payouts' && (
            <PayoutHistory payoutTransactions={payoutTransactions} />
          )}

          {activeTab === 'transactions' && (
            <TransactionHistory earningsBreakdown={earningsBreakdown} />
          )}

          {activeTab === 'settings' && (
            <PayoutSettings
              payoutSchedule={payoutSchedule}
              earnings={earnings}
              onUpdate={handleUpdatePayoutSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
}