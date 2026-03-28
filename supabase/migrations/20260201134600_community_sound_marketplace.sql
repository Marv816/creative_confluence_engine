-- Location: supabase/migrations/20260201134600_community_sound_marketplace.sql
-- Purpose: Community Sound Marketplace with producer profiles, analytics, and revenue tracking

-- ============================================================================
-- TYPES
-- ============================================================================

DROP TYPE IF EXISTS public.sound_type CASCADE;
CREATE TYPE public.sound_type AS ENUM ('beat', 'sample', 'loop', 'vocal', 'drum_kit', 'preset');

DROP TYPE IF EXISTS public.license_type CASCADE;
CREATE TYPE public.license_type AS ENUM ('basic', 'premium', 'exclusive', 'free');

DROP TYPE IF EXISTS public.purchase_status CASCADE;
CREATE TYPE public.purchase_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Producer Profiles (extends user_profiles)
CREATE TABLE IF NOT EXISTS public.producer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL,
    bio TEXT,
    banner_url TEXT,
    location TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    sounds_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Marketplace Sounds
CREATE TABLE IF NOT EXISTS public.marketplace_sounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sound_type public.sound_type DEFAULT 'beat'::public.sound_type,
    genre public.beat_genre DEFAULT 'hip_hop'::public.beat_genre,
    bpm INTEGER,
    key TEXT,
    audio_url TEXT,
    cover_image_url TEXT,
    waveform_data JSONB,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    plays_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Licensing Options
CREATE TABLE IF NOT EXISTS public.sound_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    license_type public.license_type DEFAULT 'basic'::public.license_type,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    usage_rights JSONB DEFAULT '{}'::jsonb,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Purchases
CREATE TABLE IF NOT EXISTS public.sound_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    license_id UUID REFERENCES public.sound_licenses(id) ON DELETE SET NULL,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    producer_revenue DECIMAL(10,2) NOT NULL,
    status public.purchase_status DEFAULT 'pending'::public.purchase_status,
    payment_method TEXT,
    transaction_id TEXT,
    download_url TEXT,
    download_count INTEGER DEFAULT 0,
    download_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS public.sound_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.sound_purchases(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sound_id, reviewer_id)
);

-- Producer Followers
CREATE TABLE IF NOT EXISTS public.producer_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    follower_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producer_id, follower_id)
);

-- Sound Likes
CREATE TABLE IF NOT EXISTS public.sound_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sound_id, user_id)
);

-- Collaboration Requests
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    revenue_split JSONB,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Producer Analytics (time-series data)
CREATE TABLE IF NOT EXISTS public.producer_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    plays INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    new_followers INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producer_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_producer_profiles_user_id ON public.producer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_producer_id ON public.marketplace_sounds(producer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_genre ON public.marketplace_sounds(genre);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_bpm ON public.marketplace_sounds(bpm);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_is_featured ON public.marketplace_sounds(is_featured);
CREATE INDEX IF NOT EXISTS idx_sound_licenses_sound_id ON public.sound_licenses(sound_id);
CREATE INDEX IF NOT EXISTS idx_sound_purchases_buyer_id ON public.sound_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sound_purchases_producer_id ON public.sound_purchases(producer_id);
CREATE INDEX IF NOT EXISTS idx_sound_reviews_sound_id ON public.sound_reviews(sound_id);
CREATE INDEX IF NOT EXISTS idx_sound_reviews_producer_id ON public.sound_reviews(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_followers_producer_id ON public.producer_followers(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_followers_follower_id ON public.producer_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_sound_likes_sound_id ON public.sound_likes(sound_id);
CREATE INDEX IF NOT EXISTS idx_producer_analytics_producer_date ON public.producer_analytics(producer_id, date DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update producer statistics
CREATE OR REPLACE FUNCTION public.update_producer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_TABLE_NAME = 'marketplace_sounds' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.producer_profiles
            SET sounds_count = sounds_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.producer_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.producer_profiles
            SET sounds_count = GREATEST(0, sounds_count - 1),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.producer_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'producer_followers' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.producer_profiles
            SET followers_count = followers_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.producer_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.producer_profiles
            SET followers_count = GREATEST(0, followers_count - 1),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.producer_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Update sound statistics
CREATE OR REPLACE FUNCTION public.update_sound_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_TABLE_NAME = 'sound_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.marketplace_sounds
            SET likes_count = likes_count + 1
            WHERE id = NEW.sound_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.marketplace_sounds
            SET likes_count = GREATEST(0, likes_count - 1)
            WHERE id = OLD.sound_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Update producer rating
CREATE OR REPLACE FUNCTION public.update_producer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, review_count
    FROM public.sound_reviews
    WHERE producer_id = NEW.producer_id;
    
    UPDATE public.producer_profiles
    SET rating = COALESCE(avg_rating, 0.00),
        total_reviews = review_count,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.producer_id;
    
    RETURN NEW;
END;
$$;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.producer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Producer Profiles: Public read, owner write
DROP POLICY IF EXISTS "public_read_producer_profiles" ON public.producer_profiles;
CREATE POLICY "public_read_producer_profiles"
ON public.producer_profiles
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "users_manage_own_producer_profile" ON public.producer_profiles;
CREATE POLICY "users_manage_own_producer_profile"
ON public.producer_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Marketplace Sounds: Public read, producer write
DROP POLICY IF EXISTS "public_read_marketplace_sounds" ON public.marketplace_sounds;
CREATE POLICY "public_read_marketplace_sounds"
ON public.marketplace_sounds
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "producers_manage_own_sounds" ON public.marketplace_sounds;
CREATE POLICY "producers_manage_own_sounds"
ON public.marketplace_sounds
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

-- Sound Licenses: Public read
DROP POLICY IF EXISTS "public_read_sound_licenses" ON public.sound_licenses;
CREATE POLICY "public_read_sound_licenses"
ON public.sound_licenses
FOR SELECT
TO public
USING (is_available = true);

DROP POLICY IF EXISTS "producers_manage_licenses" ON public.sound_licenses;
CREATE POLICY "producers_manage_licenses"
ON public.sound_licenses
FOR ALL
TO authenticated
USING (
    sound_id IN (
        SELECT id FROM public.marketplace_sounds ms
        WHERE ms.producer_id IN (
            SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
        )
    )
)
WITH CHECK (
    sound_id IN (
        SELECT id FROM public.marketplace_sounds ms
        WHERE ms.producer_id IN (
            SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
        )
    )
);

-- Purchases: Buyer and producer can view
DROP POLICY IF EXISTS "users_view_own_purchases" ON public.sound_purchases;
CREATE POLICY "users_view_own_purchases"
ON public.sound_purchases
FOR SELECT
TO authenticated
USING (
    buyer_id = auth.uid()
    OR producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_create_purchases" ON public.sound_purchases;
CREATE POLICY "users_create_purchases"
ON public.sound_purchases
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Reviews: Public read, verified buyers write
DROP POLICY IF EXISTS "public_read_reviews" ON public.sound_reviews;
CREATE POLICY "public_read_reviews"
ON public.sound_reviews
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "users_manage_own_reviews" ON public.sound_reviews;
CREATE POLICY "users_manage_own_reviews"
ON public.sound_reviews
FOR ALL
TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- Followers: Users manage own follows
DROP POLICY IF EXISTS "users_manage_follows" ON public.producer_followers;
CREATE POLICY "users_manage_follows"
ON public.producer_followers
FOR ALL
TO authenticated
USING (follower_id = auth.uid())
WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS "public_view_followers" ON public.producer_followers;
CREATE POLICY "public_view_followers"
ON public.producer_followers
FOR SELECT
TO public
USING (true);

-- Likes: Users manage own likes
DROP POLICY IF EXISTS "users_manage_likes" ON public.sound_likes;
CREATE POLICY "users_manage_likes"
ON public.sound_likes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Collaboration Requests
DROP POLICY IF EXISTS "users_view_collaboration_requests" ON public.collaboration_requests;
CREATE POLICY "users_view_collaboration_requests"
ON public.collaboration_requests
FOR SELECT
TO authenticated
USING (
    requester_id = auth.uid()
    OR producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_create_collaboration_requests" ON public.collaboration_requests;
CREATE POLICY "users_create_collaboration_requests"
ON public.collaboration_requests
FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

-- Analytics: Producers view own analytics
DROP POLICY IF EXISTS "producers_view_own_analytics" ON public.producer_analytics;
CREATE POLICY "producers_view_own_analytics"
ON public.producer_analytics
FOR SELECT
TO authenticated
USING (
    producer_id IN (
        SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_producer_stats_on_sound ON public.marketplace_sounds;
CREATE TRIGGER update_producer_stats_on_sound
AFTER INSERT OR DELETE ON public.marketplace_sounds
FOR EACH ROW
EXECUTE FUNCTION public.update_producer_stats();

DROP TRIGGER IF EXISTS update_producer_stats_on_follow ON public.producer_followers;
CREATE TRIGGER update_producer_stats_on_follow
AFTER INSERT OR DELETE ON public.producer_followers
FOR EACH ROW
EXECUTE FUNCTION public.update_producer_stats();

DROP TRIGGER IF EXISTS update_sound_stats_on_like ON public.sound_likes;
CREATE TRIGGER update_sound_stats_on_like
AFTER INSERT OR DELETE ON public.sound_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_sound_stats();

DROP TRIGGER IF EXISTS update_producer_rating_on_review ON public.sound_reviews;
CREATE TRIGGER update_producer_rating_on_review
AFTER INSERT OR UPDATE ON public.sound_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_producer_rating();

-- ============================================================================
-- MOCK DATA
-- ============================================================================

DO $$
DECLARE
    existing_user_id UUID;
    producer_uuid UUID;
    sound1_uuid UUID := gen_random_uuid();
    sound2_uuid UUID := gen_random_uuid();
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
        
        IF existing_user_id IS NOT NULL THEN
            -- Create producer profile
            INSERT INTO public.producer_profiles (
                id, user_id, stage_name, bio, location, total_sales, total_revenue, rating, is_verified
            ) VALUES (
                gen_random_uuid(),
                existing_user_id,
                'BeatMaster Pro',
                'Professional beat producer specializing in Hip-Hop and Trap. Over 500 beats sold worldwide.',
                'Atlanta, GA',
                127,
                3850.00,
                4.8,
                true
            )
            ON CONFLICT (user_id) DO UPDATE
            SET stage_name = EXCLUDED.stage_name,
                bio = EXCLUDED.bio
            RETURNING id INTO producer_uuid;
            
            IF producer_uuid IS NOT NULL THEN
                -- Create marketplace sounds
                INSERT INTO public.marketplace_sounds (
                    id, producer_id, title, description, sound_type, genre, bpm, key,
                    tags, is_featured, plays_count, likes_count
                ) VALUES
                    (
                        sound1_uuid,
                        producer_uuid,
                        'Dark Trap Banger',
                        'Hard-hitting trap beat with dark melodies and 808 slides',
                        'beat'::public.sound_type,
                        'trap'::public.beat_genre,
                        140,
                        'F# Minor',
                        ARRAY['dark', 'trap', '808', 'hard'],
                        true,
                        1247,
                        89
                    ),
                    (
                        sound2_uuid,
                        producer_uuid,
                        'Smooth R&B Vibes',
                        'Soulful R&B instrumental with smooth keys and warm bass',
                        'beat'::public.sound_type,
                        'rnb'::public.beat_genre,
                        85,
                        'C Major',
                        ARRAY['smooth', 'rnb', 'soul', 'chill'],
                        false,
                        892,
                        67
                    )
                ON CONFLICT (id) DO NOTHING;
                
                -- Create licenses
                INSERT INTO public.sound_licenses (
                    sound_id, license_type, price, description
                ) VALUES
                    (sound1_uuid, 'basic'::public.license_type, 29.99, 'MP3 lease with 2,500 streams'),
                    (sound1_uuid, 'premium'::public.license_type, 99.99, 'WAV lease with unlimited streams'),
                    (sound2_uuid, 'basic'::public.license_type, 24.99, 'MP3 lease with 2,500 streams'),
                    (sound2_uuid, 'exclusive'::public.license_type, 499.99, 'Full exclusive rights')
                ON CONFLICT (id) DO NOTHING;
                
                -- Create analytics data
                INSERT INTO public.producer_analytics (
                    producer_id, date, plays, downloads, sales, revenue, new_followers
                ) VALUES
                    (producer_uuid, CURRENT_DATE - INTERVAL '7 days', 145, 12, 3, 89.97, 8),
                    (producer_uuid, CURRENT_DATE - INTERVAL '6 days', 167, 15, 5, 149.95, 12),
                    (producer_uuid, CURRENT_DATE - INTERVAL '5 days', 189, 18, 4, 119.96, 6),
                    (producer_uuid, CURRENT_DATE - INTERVAL '4 days', 203, 21, 6, 179.94, 15),
                    (producer_uuid, CURRENT_DATE - INTERVAL '3 days', 178, 14, 4, 119.96, 9),
                    (producer_uuid, CURRENT_DATE - INTERVAL '2 days', 195, 17, 7, 209.93, 11),
                    (producer_uuid, CURRENT_DATE - INTERVAL '1 day', 221, 23, 8, 239.92, 14)
                ON CONFLICT (producer_id, date) DO NOTHING;
            END IF;
        ELSE
            RAISE NOTICE 'No existing users found. Run auth migration first.';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;