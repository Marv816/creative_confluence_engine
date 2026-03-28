-- BlaccTop Entertainment Payment & Payout System Migration
-- Tables: producer_earnings, payout_schedules, payout_transactions, transaction_disputes, escrow_transactions

-- 1. Custom Types
DROP TYPE IF EXISTS public.payout_status CASCADE;
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

DROP TYPE IF EXISTS public.payout_method CASCADE;
CREATE TYPE public.payout_method AS ENUM ('bank_transfer', 'paypal', 'stripe_connect', 'digital_wallet');

DROP TYPE IF EXISTS public.dispute_status CASCADE;
CREATE TYPE public.dispute_status AS ENUM ('open', 'under_review', 'resolved', 'rejected', 'escalated');

DROP TYPE IF EXISTS public.escrow_status CASCADE;
CREATE TYPE public.escrow_status AS ENUM ('held', 'released', 'refunded');

-- 2. Producer Earnings Table (Aggregated earnings per producer)
CREATE TABLE IF NOT EXISTS public.producer_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    current_balance DECIMAL(10,2) DEFAULT 0.00,
    pending_balance DECIMAL(10,2) DEFAULT 0.00,
    lifetime_earnings DECIMAL(10,2) DEFAULT 0.00,
    total_payouts DECIMAL(10,2) DEFAULT 0.00,
    last_payout_date TIMESTAMPTZ,
    next_payout_date TIMESTAMPTZ,
    payout_method public.payout_method DEFAULT 'stripe_connect'::public.payout_method,
    payout_details JSONB DEFAULT '{}'::jsonb,
    tax_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producer_id)
);

-- 3. Payout Schedules Table (Scheduled payout configurations)
CREATE TABLE IF NOT EXISTS public.payout_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    schedule_type TEXT DEFAULT 'monthly',
    minimum_payout_amount DECIMAL(10,2) DEFAULT 50.00,
    auto_payout_enabled BOOLEAN DEFAULT true,
    next_payout_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producer_id)
);

-- 4. Payout Transactions Table (Individual payout records)
CREATE TABLE IF NOT EXISTS public.payout_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    earnings_id UUID REFERENCES public.producer_earnings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payout_method public.payout_method DEFAULT 'stripe_connect'::public.payout_method,
    status public.payout_status DEFAULT 'pending'::public.payout_status,
    stripe_payout_id TEXT,
    paypal_transaction_id TEXT,
    bank_reference TEXT,
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    initiated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Transaction Disputes Table
CREATE TABLE IF NOT EXISTS public.transaction_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES public.marketplace_purchases(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status public.dispute_status DEFAULT 'open'::public.dispute_status,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Escrow Transactions Table (Temporary fund holding)
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES public.marketplace_purchases(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status public.escrow_status DEFAULT 'held'::public.escrow_status,
    held_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    release_date TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_producer_earnings_producer_id ON public.producer_earnings(producer_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_producer_id ON public.payout_schedules(producer_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_next_payout ON public.payout_schedules(next_payout_date);
CREATE INDEX IF NOT EXISTS idx_payout_transactions_producer_id ON public.payout_transactions(producer_id);
CREATE INDEX IF NOT EXISTS idx_payout_transactions_status ON public.payout_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transaction_disputes_purchase_id ON public.transaction_disputes(purchase_id);
CREATE INDEX IF NOT EXISTS idx_transaction_disputes_status ON public.transaction_disputes(status);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_purchase_id ON public.escrow_transactions(purchase_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON public.escrow_transactions(status);

-- 8. Functions

-- Function: Initialize producer earnings record
CREATE OR REPLACE FUNCTION public.initialize_producer_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.producer_earnings (producer_id, next_payout_date)
    VALUES (NEW.id, CURRENT_TIMESTAMP + INTERVAL '30 days')
    ON CONFLICT (producer_id) DO NOTHING;
    
    INSERT INTO public.payout_schedules (producer_id, next_payout_date)
    VALUES (NEW.id, CURRENT_TIMESTAMP + INTERVAL '30 days')
    ON CONFLICT (producer_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Function: Update earnings on purchase completion
CREATE OR REPLACE FUNCTION public.update_earnings_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'completed'::public.purchase_status AND 
       (OLD.status IS NULL OR OLD.status != 'completed'::public.purchase_status) THEN
        
        -- Create escrow transaction (hold funds for 7 days)
        INSERT INTO public.escrow_transactions (
            purchase_id,
            producer_id,
            amount,
            release_date
        ) VALUES (
            NEW.id,
            NEW.producer_id,
            NEW.producer_revenue,
            CURRENT_TIMESTAMP + INTERVAL '7 days'
        );
        
        -- Update producer earnings (add to pending balance)
        UPDATE public.producer_earnings
        SET 
            pending_balance = pending_balance + NEW.producer_revenue,
            lifetime_earnings = lifetime_earnings + NEW.producer_revenue,
            updated_at = CURRENT_TIMESTAMP
        WHERE producer_id = NEW.producer_id;
        
        -- If no earnings record exists, create one
        IF NOT FOUND THEN
            INSERT INTO public.producer_earnings (
                producer_id,
                pending_balance,
                lifetime_earnings,
                next_payout_date
            ) VALUES (
                NEW.producer_id,
                NEW.producer_revenue,
                NEW.producer_revenue,
                CURRENT_TIMESTAMP + INTERVAL '30 days'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Function: Release escrow funds
CREATE OR REPLACE FUNCTION public.release_escrow_funds()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    escrow_record RECORD;
BEGIN
    FOR escrow_record IN 
        SELECT * FROM public.escrow_transactions
        WHERE status = 'held'::public.escrow_status
        AND release_date <= CURRENT_TIMESTAMP
    LOOP
        -- Move from pending to current balance
        UPDATE public.producer_earnings
        SET 
            current_balance = current_balance + escrow_record.amount,
            pending_balance = pending_balance - escrow_record.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE producer_id = escrow_record.producer_id;
        
        -- Mark escrow as released
        UPDATE public.escrow_transactions
        SET 
            status = 'released'::public.escrow_status,
            released_at = CURRENT_TIMESTAMP
        WHERE id = escrow_record.id;
    END LOOP;
END;
$$;

-- Function: Process scheduled payouts
CREATE OR REPLACE FUNCTION public.process_scheduled_payouts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    schedule_record RECORD;
    earnings_record RECORD;
BEGIN
    FOR schedule_record IN 
        SELECT * FROM public.payout_schedules
        WHERE auto_payout_enabled = true
        AND next_payout_date <= CURRENT_TIMESTAMP
    LOOP
        -- Get producer earnings
        SELECT * INTO earnings_record
        FROM public.producer_earnings
        WHERE producer_id = schedule_record.producer_id;
        
        -- Check if balance meets minimum
        IF earnings_record.current_balance >= schedule_record.minimum_payout_amount THEN
            -- Create payout transaction
            INSERT INTO public.payout_transactions (
                producer_id,
                earnings_id,
                amount,
                payout_method,
                net_amount,
                status
            ) VALUES (
                schedule_record.producer_id,
                earnings_record.id,
                earnings_record.current_balance,
                earnings_record.payout_method,
                earnings_record.current_balance * 0.98, -- 2% processing fee
                'pending'::public.payout_status
            );
            
            -- Update schedule for next payout
            UPDATE public.payout_schedules
            SET 
                next_payout_date = CASE schedule_type
                    WHEN 'weekly' THEN CURRENT_TIMESTAMP + INTERVAL '7 days'
                    WHEN 'biweekly' THEN CURRENT_TIMESTAMP + INTERVAL '14 days'
                    WHEN 'monthly' THEN CURRENT_TIMESTAMP + INTERVAL '30 days'
                    ELSE CURRENT_TIMESTAMP + INTERVAL '30 days'
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = schedule_record.id;
        END IF;
    END LOOP;
END;
$$;

-- Function: Update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 9. Enable RLS
ALTER TABLE public.producer_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies

-- Producer Earnings: Producers view own earnings
DROP POLICY IF EXISTS "producers_view_own_earnings" ON public.producer_earnings;
CREATE POLICY "producers_view_own_earnings"
ON public.producer_earnings
FOR SELECT
TO authenticated
USING (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "producers_update_own_earnings" ON public.producer_earnings;
CREATE POLICY "producers_update_own_earnings"
ON public.producer_earnings
FOR UPDATE
TO authenticated
USING (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
);

-- Payout Schedules: Producers manage own schedules
DROP POLICY IF EXISTS "producers_manage_own_schedules" ON public.payout_schedules;
CREATE POLICY "producers_manage_own_schedules"
ON public.payout_schedules
FOR ALL
TO authenticated
USING (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
);

-- Payout Transactions: Producers view own payouts
DROP POLICY IF EXISTS "producers_view_own_payouts" ON public.payout_transactions;
CREATE POLICY "producers_view_own_payouts"
ON public.payout_transactions
FOR SELECT
TO authenticated
USING (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
);

-- Transaction Disputes: Producers and buyers view own disputes
DROP POLICY IF EXISTS "users_view_own_disputes" ON public.transaction_disputes;
CREATE POLICY "users_view_own_disputes"
ON public.transaction_disputes
FOR SELECT
TO authenticated
USING (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
    OR buyer_id = auth.uid()
);

DROP POLICY IF EXISTS "users_create_disputes" ON public.transaction_disputes;
CREATE POLICY "users_create_disputes"
ON public.transaction_disputes
FOR INSERT
TO authenticated
WITH CHECK (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
    OR buyer_id = auth.uid()
);

-- Escrow Transactions: Producers view own escrow
DROP POLICY IF EXISTS "producers_view_own_escrow" ON public.escrow_transactions;
CREATE POLICY "producers_view_own_escrow"
ON public.escrow_transactions
FOR SELECT
TO authenticated
USING (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
);

-- 11. Triggers

-- Trigger: Initialize earnings when producer profile created
DROP TRIGGER IF EXISTS on_producer_profile_created ON public.producer_profiles;
CREATE TRIGGER on_producer_profile_created
    AFTER INSERT ON public.producer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_producer_earnings();

-- Trigger: Update earnings on purchase
DROP TRIGGER IF EXISTS on_purchase_completed ON public.marketplace_purchases;
CREATE TRIGGER on_purchase_completed
    AFTER INSERT OR UPDATE ON public.marketplace_purchases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_earnings_on_purchase();

-- Trigger: Update timestamp on producer_earnings
DROP TRIGGER IF EXISTS update_producer_earnings_timestamp ON public.producer_earnings;
CREATE TRIGGER update_producer_earnings_timestamp
    BEFORE UPDATE ON public.producer_earnings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Update timestamp on payout_schedules
DROP TRIGGER IF EXISTS update_payout_schedules_timestamp ON public.payout_schedules;
CREATE TRIGGER update_payout_schedules_timestamp
    BEFORE UPDATE ON public.payout_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Update timestamp on transaction_disputes
DROP TRIGGER IF EXISTS update_transaction_disputes_timestamp ON public.transaction_disputes;
CREATE TRIGGER update_transaction_disputes_timestamp
    BEFORE UPDATE ON public.transaction_disputes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Mock Data
DO $$
DECLARE
    existing_producer_id UUID;
    existing_purchase_id UUID;
    existing_buyer_id UUID;
BEGIN
    -- Verify producer_profiles table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'producer_profiles'
    ) THEN
        SELECT id INTO existing_producer_id FROM public.producer_profiles LIMIT 1;
        
        IF existing_producer_id IS NOT NULL THEN
            -- Initialize earnings for existing producer (trigger should handle this, but ensure it exists)
            INSERT INTO public.producer_earnings (
                producer_id,
                current_balance,
                pending_balance,
                lifetime_earnings,
                next_payout_date,
                payout_method
            ) VALUES (
                existing_producer_id,
                250.00,
                150.00,
                1500.00,
                CURRENT_TIMESTAMP + INTERVAL '15 days',
                'stripe_connect'::public.payout_method
            )
            ON CONFLICT (producer_id) DO UPDATE
            SET 
                current_balance = 250.00,
                pending_balance = 150.00,
                lifetime_earnings = 1500.00;
            
            -- Create payout schedule
            INSERT INTO public.payout_schedules (
                producer_id,
                schedule_type,
                minimum_payout_amount,
                auto_payout_enabled,
                next_payout_date
            ) VALUES (
                existing_producer_id,
                'monthly',
                50.00,
                true,
                CURRENT_TIMESTAMP + INTERVAL '15 days'
            )
            ON CONFLICT (producer_id) DO NOTHING;
            
            -- Check for existing purchase
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'marketplace_purchases'
            ) THEN
                SELECT id, buyer_id INTO existing_purchase_id, existing_buyer_id 
                FROM public.marketplace_purchases 
                WHERE producer_id = existing_producer_id
                LIMIT 1;
                
                IF existing_purchase_id IS NOT NULL THEN
                    -- Create sample escrow transaction
                    INSERT INTO public.escrow_transactions (
                        purchase_id,
                        producer_id,
                        amount,
                        status,
                        release_date
                    ) VALUES (
                        existing_purchase_id,
                        existing_producer_id,
                        45.00,
                        'held'::public.escrow_status,
                        CURRENT_TIMESTAMP + INTERVAL '5 days'
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
            END IF;
        ELSE
            RAISE NOTICE 'No existing producers found. Create producer profiles first.';
        END IF;
    ELSE
        RAISE NOTICE 'Table producer_profiles does not exist. Run marketplace migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;