-- BlaccTop Entertainment Marketplace Payment System Migration
-- Tables: payment_transactions, producer_payouts, royalty_distributions, payment_disputes, escrow_transactions

-- 1. Custom Types
DROP TYPE IF EXISTS public.transaction_status CASCADE;
CREATE TYPE public.transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed');

DROP TYPE IF EXISTS public.payout_status CASCADE;
CREATE TYPE public.payout_status AS ENUM ('pending', 'scheduled', 'processing', 'completed', 'failed', 'cancelled');

DROP TYPE IF EXISTS public.dispute_status CASCADE;
CREATE TYPE public.dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed', 'escalated');

DROP TYPE IF EXISTS public.escrow_status CASCADE;
CREATE TYPE public.escrow_status AS ENUM ('held', 'released', 'refunded', 'disputed');

-- 2. Payment Transactions Table (Detailed transaction history)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES public.marketplace_purchases(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    producer_revenue DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_method_details JSONB DEFAULT '{}'::jsonb,
    status public.transaction_status DEFAULT 'pending'::public.transaction_status,
    failure_reason TEXT,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ
);

-- 3. Producer Payouts Table (Automated payout tracking)
CREATE TABLE IF NOT EXISTS public.producer_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status public.payout_status DEFAULT 'pending'::public.payout_status,
    stripe_payout_id TEXT UNIQUE,
    stripe_account_id TEXT,
    payout_method TEXT DEFAULT 'stripe',
    scheduled_date TIMESTAMPTZ,
    processed_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    failure_reason TEXT,
    transaction_ids UUID[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Royalty Distributions Table (Track royalty splits)
CREATE TABLE IF NOT EXISTS public.royalty_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    royalty_percentage DECIMAL(5,2) NOT NULL,
    royalty_amount DECIMAL(10,2) NOT NULL,
    payout_id UUID REFERENCES public.producer_payouts(id) ON DELETE SET NULL,
    distributed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payment Disputes Table (Dispute resolution system)
CREATE TABLE IF NOT EXISTS public.payment_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.marketplace_purchases(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    dispute_reason TEXT NOT NULL,
    dispute_description TEXT,
    evidence_urls TEXT[],
    status public.dispute_status DEFAULT 'open'::public.dispute_status,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Escrow Transactions Table (Secure transaction holding)
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.marketplace_purchases(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status public.escrow_status DEFAULT 'held'::public.escrow_status,
    held_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    release_scheduled_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    release_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_purchase_id ON public.payment_transactions(purchase_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_buyer_id ON public.payment_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_producer_id ON public.payment_transactions(producer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_producer_payouts_producer_id ON public.producer_payouts(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_payouts_status ON public.producer_payouts(status);
CREATE INDEX IF NOT EXISTS idx_producer_payouts_scheduled_date ON public.producer_payouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_royalty_distributions_transaction_id ON public.royalty_distributions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_royalty_distributions_producer_id ON public.royalty_distributions(producer_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_transaction_id ON public.payment_disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON public.payment_disputes(status);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_transaction_id ON public.escrow_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON public.escrow_transactions(status);

-- 8. Functions
CREATE OR REPLACE FUNCTION public.calculate_platform_fee(amount DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN ROUND(amount * 0.10, 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_producer_revenue(amount DECIMAL, platform_fee DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN ROUND(amount - platform_fee, 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.process_royalty_distribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    revenue_share DECIMAL;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SELECT revenue_share_percentage INTO revenue_share
        FROM public.marketplace_licenses
        WHERE id = (SELECT license_id FROM public.marketplace_purchases WHERE id = NEW.purchase_id LIMIT 1);
        
        IF revenue_share IS NOT NULL AND revenue_share > 0 THEN
            INSERT INTO public.royalty_distributions (
                transaction_id,
                producer_id,
                sound_id,
                royalty_percentage,
                royalty_amount,
                distributed_at
            ) VALUES (
                NEW.id,
                NEW.producer_id,
                NEW.sound_id,
                revenue_share,
                ROUND(NEW.producer_revenue * (revenue_share / 100), 2),
                CURRENT_TIMESTAMP
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_purchase_status_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE public.marketplace_purchases
        SET status = 'completed'::public.purchase_status,
            completed_at = CURRENT_TIMESTAMP,
            transaction_id = NEW.stripe_payment_intent_id
        WHERE id = NEW.purchase_id;
    ELSIF NEW.status = 'failed' THEN
        UPDATE public.marketplace_purchases
        SET status = 'failed'::public.purchase_status
        WHERE id = NEW.purchase_id;
    ELSIF NEW.status = 'refunded' THEN
        UPDATE public.marketplace_purchases
        SET status = 'refunded'::public.purchase_status
        WHERE id = NEW.purchase_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 9. Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies

-- Payment Transactions: Buyers and producers can view their own transactions
DROP POLICY IF EXISTS "users_view_own_payment_transactions" ON public.payment_transactions;
CREATE POLICY "users_view_own_payment_transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid() OR producer_id IN (
    SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "users_create_payment_transactions" ON public.payment_transactions;
CREATE POLICY "users_create_payment_transactions"
ON public.payment_transactions
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Producer Payouts: Producers can view their own payouts
DROP POLICY IF EXISTS "producers_view_own_payouts" ON public.producer_payouts;
CREATE POLICY "producers_view_own_payouts"
ON public.producer_payouts
FOR SELECT
TO authenticated
USING (producer_id IN (
    SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
));

-- Royalty Distributions: Producers can view their own royalties
DROP POLICY IF EXISTS "producers_view_own_royalties" ON public.royalty_distributions;
CREATE POLICY "producers_view_own_royalties"
ON public.royalty_distributions
FOR SELECT
TO authenticated
USING (producer_id IN (
    SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
));

-- Payment Disputes: Buyers and producers can manage their disputes
DROP POLICY IF EXISTS "users_manage_own_disputes" ON public.payment_disputes;
CREATE POLICY "users_manage_own_disputes"
ON public.payment_disputes
FOR ALL
TO authenticated
USING (buyer_id = auth.uid() OR producer_id IN (
    SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
))
WITH CHECK (buyer_id = auth.uid());

-- Escrow Transactions: Buyers and producers can view their escrow
DROP POLICY IF EXISTS "users_view_own_escrow" ON public.escrow_transactions;
CREATE POLICY "users_view_own_escrow"
ON public.escrow_transactions
FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.payment_transactions pt
    WHERE pt.id = escrow_transactions.transaction_id
    AND (pt.buyer_id = auth.uid() OR pt.producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    ))
));

-- 11. Triggers
DROP TRIGGER IF EXISTS trigger_process_royalty_distribution ON public.payment_transactions;
CREATE TRIGGER trigger_process_royalty_distribution
    AFTER UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.process_royalty_distribution();

DROP TRIGGER IF EXISTS trigger_update_purchase_status ON public.payment_transactions;
CREATE TRIGGER trigger_update_purchase_status
    AFTER UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_purchase_status_on_transaction();

DROP TRIGGER IF EXISTS trigger_update_producer_payouts_timestamp ON public.producer_payouts;
CREATE TRIGGER trigger_update_producer_payouts_timestamp
    BEFORE UPDATE ON public.producer_payouts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_update_payment_disputes_timestamp ON public.payment_disputes;
CREATE TRIGGER trigger_update_payment_disputes_timestamp
    BEFORE UPDATE ON public.payment_disputes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_update_escrow_transactions_timestamp ON public.escrow_transactions;
CREATE TRIGGER trigger_update_escrow_transactions_timestamp
    BEFORE UPDATE ON public.escrow_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();