import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Payment Service
 * Handles Stripe payments, royalty calculations, and payout automation
 */

export const paymentService = {
  // ============================================================================
  // PAYMENT TRANSACTIONS
  // ============================================================================

  async createPaymentIntent(purchaseData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const platformFee = parseFloat(purchaseData?.amount) * 0.10;
      const producerRevenue = parseFloat(purchaseData?.amount) - platformFee;

      const { data, error } = await supabase?.from('payment_transactions')?.insert({
          purchase_id: purchaseData?.purchaseId,
          buyer_id: user?.id,
          producer_id: purchaseData?.producerId,
          sound_id: purchaseData?.soundId,
          amount: purchaseData?.amount,
          currency: 'usd',
          platform_fee: platformFee?.toFixed(2),
          producer_revenue: producerRevenue?.toFixed(2),
          payment_method: purchaseData?.paymentMethod || 'card',
          status: 'pending',
          metadata: purchaseData?.metadata || {}
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Payment] Create payment intent error:', error);
      throw error;
    }
  },

  async updateTransactionStatus(transactionId, status, metadata = {}) {
    try {
      const updates = {
        status,
        metadata,
        updated_at: new Date()?.toISOString()
      };

      if (status === 'completed') {
        updates.completed_at = new Date()?.toISOString();
      } else if (status === 'refunded') {
        updates.refunded_at = new Date()?.toISOString();
      }

      const { data, error } = await supabase?.from('payment_transactions')?.update(updates)?.eq('id', transactionId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Payment] Update transaction status error:', error);
      throw error;
    }
  },

  async getTransactionHistory(filters = {}) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase?.from('payment_transactions')?.select(`
          *,
          buyer:user_profiles!payment_transactions_buyer_id_fkey(id, full_name, email, avatar_url),
          producer:producer_profiles!payment_transactions_producer_id_fkey(id, producer_name, avatar_url),
          sound:marketplace_sounds(id, title, cover_image_url, genre)
        `);

      const { data: producerProfile } = await supabase?.from('producer_profiles')?.select('id')?.eq('user_id', user?.id)?.single();

      if (producerProfile) {
        query = query?.or(`buyer_id.eq.${user?.id},producer_id.eq.${producerProfile?.id}`);
      } else {
        query = query?.eq('buyer_id', user?.id);
      }

      if (filters?.status) query = query?.eq('status', filters?.status);
      if (filters?.startDate) query = query?.gte('created_at', filters?.startDate);
      if (filters?.endDate) query = query?.lte('created_at', filters?.endDate);
      if (filters?.minAmount) query = query?.gte('amount', filters?.minAmount);
      if (filters?.maxAmount) query = query?.lte('amount', filters?.maxAmount);

      query = query?.order('created_at', { ascending: false });

      if (filters?.limit) query = query?.limit(filters?.limit);

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(tx => ({
        id: tx?.id,
        purchaseId: tx?.purchase_id,
        buyerId: tx?.buyer_id,
        producerId: tx?.producer_id,
        soundId: tx?.sound_id,
        stripePaymentIntentId: tx?.stripe_payment_intent_id,
        amount: parseFloat(tx?.amount || 0),
        currency: tx?.currency,
        platformFee: parseFloat(tx?.platform_fee || 0),
        producerRevenue: parseFloat(tx?.producer_revenue || 0),
        paymentMethod: tx?.payment_method,
        status: tx?.status,
        receiptUrl: tx?.receipt_url,
        createdAt: tx?.created_at,
        completedAt: tx?.completed_at,
        buyer: tx?.buyer,
        producer: tx?.producer,
        sound: tx?.sound
      })) || [];
    } catch (error) {
      console.error('[Payment] Get transaction history error:', error);
      throw error;
    }
  },

  async getTransactionById(transactionId) {
    try {
      const { data, error } = await supabase?.from('payment_transactions')?.select(`
          *,
          buyer:user_profiles!payment_transactions_buyer_id_fkey(id, full_name, email, avatar_url),
          producer:producer_profiles!payment_transactions_producer_id_fkey(id, producer_name, avatar_url),
          sound:marketplace_sounds(id, title, cover_image_url, genre, bpm, key_signature)
        `)?.eq('id', transactionId)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Payment] Get transaction by ID error:', error);
      throw error;
    }
  },

  // ============================================================================
  // PRODUCER PAYOUTS
  // ============================================================================

  async getProducerPayouts(filters = {}) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: producerProfile } = await supabase?.from('producer_profiles')?.select('id')?.eq('user_id', user?.id)?.single();

      if (!producerProfile) throw new Error('Producer profile not found');

      let query = supabase?.from('producer_payouts')?.select('*')?.eq('producer_id', producerProfile?.id);

      if (filters?.status) query = query?.eq('status', filters?.status);
      if (filters?.startDate) query = query?.gte('created_at', filters?.startDate);
      if (filters?.endDate) query = query?.lte('created_at', filters?.endDate);

      query = query?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(payout => ({
        id: payout?.id,
        producerId: payout?.producer_id,
        amount: parseFloat(payout?.amount || 0),
        currency: payout?.currency,
        status: payout?.status,
        stripePayoutId: payout?.stripe_payout_id,
        payoutMethod: payout?.payout_method,
        scheduledDate: payout?.scheduled_date,
        processedDate: payout?.processed_date,
        completedDate: payout?.completed_date,
        failureReason: payout?.failure_reason,
        createdAt: payout?.created_at
      })) || [];
    } catch (error) {
      console.error('[Payment] Get producer payouts error:', error);
      throw error;
    }
  },

  async getProducerEarningsSummary() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: producerProfile } = await supabase?.from('producer_profiles')?.select('id')?.eq('user_id', user?.id)?.single();

      if (!producerProfile) throw new Error('Producer profile not found');

      const { data: transactions } = await supabase?.from('payment_transactions')?.select('producer_revenue, status')?.eq('producer_id', producerProfile?.id)?.eq('status', 'completed');

      const { data: payouts } = await supabase?.from('producer_payouts')?.select('amount, status')?.eq('producer_id', producerProfile?.id);

      const totalEarnings = transactions?.reduce((sum, tx) => sum + parseFloat(tx?.producer_revenue || 0), 0) || 0;
      const totalPaidOut = payouts?.filter(p => p?.status === 'completed')?.reduce((sum, p) => sum + parseFloat(p?.amount || 0), 0) || 0;
      const pendingPayouts = payouts?.filter(p => ['pending', 'scheduled', 'processing']?.includes(p?.status))?.reduce((sum, p) => sum + parseFloat(p?.amount || 0), 0) || 0;

      return {
        totalEarnings: totalEarnings?.toFixed(2),
        totalPaidOut: totalPaidOut?.toFixed(2),
        availableBalance: (totalEarnings - totalPaidOut - pendingPayouts)?.toFixed(2),
        pendingPayouts: pendingPayouts?.toFixed(2),
        transactionCount: transactions?.length || 0
      };
    } catch (error) {
      console.error('[Payment] Get earnings summary error:', error);
      throw error;
    }
  },

  // ============================================================================
  // ROYALTY DISTRIBUTIONS
  // ============================================================================

  async getRoyaltyDistributions(filters = {}) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: producerProfile } = await supabase?.from('producer_profiles')?.select('id')?.eq('user_id', user?.id)?.single();

      if (!producerProfile) throw new Error('Producer profile not found');

      let query = supabase?.from('royalty_distributions')?.select(`
          *,
          transaction:payment_transactions(id, amount, status, created_at),
          sound:marketplace_sounds(id, title, cover_image_url)
        `)?.eq('producer_id', producerProfile?.id);

      if (filters?.startDate) query = query?.gte('created_at', filters?.startDate);
      if (filters?.endDate) query = query?.lte('created_at', filters?.endDate);

      query = query?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(royalty => ({
        id: royalty?.id,
        transactionId: royalty?.transaction_id,
        producerId: royalty?.producer_id,
        soundId: royalty?.sound_id,
        royaltyPercentage: parseFloat(royalty?.royalty_percentage || 0),
        royaltyAmount: parseFloat(royalty?.royalty_amount || 0),
        distributedAt: royalty?.distributed_at,
        createdAt: royalty?.created_at,
        transaction: royalty?.transaction,
        sound: royalty?.sound
      })) || [];
    } catch (error) {
      console.error('[Payment] Get royalty distributions error:', error);
      throw error;
    }
  },

  // ============================================================================
  // PAYMENT DISPUTES
  // ============================================================================

  async createDispute(disputeData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('payment_disputes')?.insert({
          transaction_id: disputeData?.transactionId,
          purchase_id: disputeData?.purchaseId,
          buyer_id: user?.id,
          producer_id: disputeData?.producerId,
          dispute_reason: disputeData?.reason,
          dispute_description: disputeData?.description,
          evidence_urls: disputeData?.evidenceUrls || [],
          status: 'open'
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Payment] Create dispute error:', error);
      throw error;
    }
  },

  async getDisputes(filters = {}) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase?.from('payment_disputes')?.select(`
          *,
          transaction:payment_transactions(id, amount, status),
          buyer:user_profiles!payment_disputes_buyer_id_fkey(id, full_name, email),
          producer:producer_profiles!payment_disputes_producer_id_fkey(id, producer_name)
        `);

      const { data: producerProfile } = await supabase?.from('producer_profiles')?.select('id')?.eq('user_id', user?.id)?.single();

      if (producerProfile) {
        query = query?.or(`buyer_id.eq.${user?.id},producer_id.eq.${producerProfile?.id}`);
      } else {
        query = query?.eq('buyer_id', user?.id);
      }

      if (filters?.status) query = query?.eq('status', filters?.status);

      query = query?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Payment] Get disputes error:', error);
      throw error;
    }
  },

  async updateDisputeStatus(disputeId, status, resolutionNotes = '') {
    try {
      const updates = {
        status,
        resolution_notes: resolutionNotes,
        updated_at: new Date()?.toISOString()
      };

      if (['resolved', 'closed']?.includes(status)) {
        const { data: { user } } = await supabase?.auth?.getUser();
        updates.resolved_by = user?.id;
        updates.resolved_at = new Date()?.toISOString();
      }

      const { data, error } = await supabase?.from('payment_disputes')?.update(updates)?.eq('id', disputeId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Payment] Update dispute status error:', error);
      throw error;
    }
  },

  // ============================================================================
  // ESCROW TRANSACTIONS
  // ============================================================================

  async getEscrowTransactions() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('escrow_transactions')?.select(`
          *,
          transaction:payment_transactions(
            id,
            amount,
            status,
            buyer:user_profiles!payment_transactions_buyer_id_fkey(full_name),
            producer:producer_profiles!payment_transactions_producer_id_fkey(producer_name)
          )
        `)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Payment] Get escrow transactions error:', error);
      throw error;
    }
  },

  // ============================================================================
  // STRIPE INTEGRATION
  // ============================================================================

  async getStripeInstance() {
    return await stripePromise;
  },

  async createCheckoutSession(purchaseData) {
    try {
      console.log('[Payment] Creating checkout session:', purchaseData);
      return { success: true, sessionId: 'mock_session_id' };
    } catch (error) {
      console.error('[Payment] Create checkout session error:', error);
      throw error;
    }
  }
};

export default paymentService;
function earningsService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: earningsService is not implemented yet.', args);
  return null;
}

export { earningsService };