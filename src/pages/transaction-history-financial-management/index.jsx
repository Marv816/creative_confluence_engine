import { useState, useEffect } from 'react';
import { Filter, Download, Search, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import paymentService from '../../services/paymentService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

import TransactionList from './components/TransactionList';
import FilterPanel from './components/FilterPanel';
import FinancialSummary from './components/FinancialSummary';
import DisputeModal from './components/DisputeModal';
import TransactionDetailModal from './components/TransactionDetailModal';

export default function TransactionHistoryFinancialManagement() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadSummary();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService?.getTransactionHistory();
      setTransactions(data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await paymentService?.getProducerEarningsSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters?.status) {
      filtered = filtered?.filter(tx => tx?.status === filters?.status);
    }

    if (filters?.startDate) {
      filtered = filtered?.filter(tx => new Date(tx?.createdAt) >= new Date(filters?.startDate));
    }

    if (filters?.endDate) {
      filtered = filtered?.filter(tx => new Date(tx?.createdAt) <= new Date(filters?.endDate));
    }

    if (filters?.minAmount) {
      filtered = filtered?.filter(tx => tx?.amount >= parseFloat(filters?.minAmount));
    }

    if (filters?.maxAmount) {
      filtered = filtered?.filter(tx => tx?.amount <= parseFloat(filters?.maxAmount));
    }

    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter(tx => 
        tx?.sound?.title?.toLowerCase()?.includes(searchLower) ||
        tx?.producer?.producer_name?.toLowerCase()?.includes(searchLower) ||
        tx?.buyer?.full_name?.toLowerCase()?.includes(searchLower)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      search: ''
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Transaction ID', 'Sound', 'Amount', 'Fee', 'Revenue', 'Status']?.join(','),
      ...filteredTransactions?.map(tx => [
        new Date(tx?.createdAt)?.toLocaleDateString(),
        tx?.id,
        tx?.sound?.title || 'N/A',
        `$${tx?.amount?.toFixed(2)}`,
        `$${tx?.platformFee?.toFixed(2)}`,
        `$${tx?.producerRevenue?.toFixed(2)}`,
        tx?.status
      ]?.join(','))
    ]?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleInitiateDispute = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDisputeModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to view your transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-500/10 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                Transaction <span className="text-cyan-500">History</span>
              </h1>
              <p className="text-xl text-gray-400">
                Comprehensive financial oversight and transaction management
              </p>
            </div>
            <Button
              onClick={handleExport}
              className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
              disabled={filteredTransactions?.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by sound, producer, or buyer..."
                value={filters?.search}
                onChange={(e) => handleFilterChange('search', e?.target?.value)}
                className="pl-12 pr-4 py-4 w-full bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Financial Summary */}
      {summary && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <FinancialSummary summary={summary} />
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="lg:hidden mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full text-white border-white/10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>
              
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">{filteredTransactions?.length} transactions</span>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)]?.map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-lg h-32 animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={loadTransactions} className="bg-cyan-500 text-black hover:bg-cyan-400">
                    Try Again
                  </Button>
                </div>
              ) : filteredTransactions?.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No transactions found</h3>
                  <p className="text-gray-400 mb-4">Try adjusting your filters</p>
                  <Button onClick={clearFilters} variant="ghost" className="text-cyan-500">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <TransactionList
                  transactions={filteredTransactions}
                  onViewDetails={handleViewDetails}
                  onInitiateDispute={handleInitiateDispute}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {showDisputeModal && selectedTransaction && (
        <DisputeModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowDisputeModal(false);
            setSelectedTransaction(null);
          }}
          onSuccess={() => {
            loadTransactions();
            setShowDisputeModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {showDetailModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTransaction(null);
          }}
          onInitiateDispute={() => {
            setShowDetailModal(false);
            setShowDisputeModal(true);
          }}
        />
      )}
    </div>
  );
}