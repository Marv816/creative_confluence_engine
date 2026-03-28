-- BlaccTop Entertainment Marketplace Migration
-- Tables: marketplace_sounds, marketplace_purchases, marketplace_licenses, producer_profiles, sound_ratings

-- 1. Custom Types
DROP TYPE IF EXISTS public.sound_type CASCADE;
CREATE TYPE public.sound_type AS ENUM ('beat', 'sample', 'loop', 'vocal', 'sfx');

DROP TYPE IF EXISTS public.license_type CASCADE;
CREATE TYPE public.license_type AS ENUM ('lease', 'exclusive', 'free', 'custom');

DROP TYPE IF EXISTS public.purchase_status CASCADE;
CREATE TYPE public.purchase_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

DROP TYPE IF EXISTS public.sound_status CASCADE;
CREATE TYPE public.sound_status AS ENUM ('draft', 'published', 'archived');

-- 2. Producer Profiles Table
CREATE TABLE IF NOT EXISTS public.producer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    producer_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 3. Marketplace Sounds Table
CREATE TABLE IF NOT EXISTS public.marketplace_sounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sound_type public.sound_type DEFAULT 'beat'::public.sound_type,
    audio_url TEXT NOT NULL,
    waveform_url TEXT,
    cover_image_url TEXT,
    genre TEXT,
    bpm INTEGER,
    key_signature TEXT,
    mood_tags TEXT[],
    instrument_tags TEXT[],
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    status public.sound_status DEFAULT 'published'::public.sound_status,
    plays_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Marketplace Licenses Table
CREATE TABLE IF NOT EXISTS public.marketplace_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    license_type public.license_type DEFAULT 'lease'::public.license_type,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    revenue_share_percentage DECIMAL(5,2) DEFAULT 0.00,
    usage_terms TEXT,
    distribution_limit INTEGER,
    streaming_limit INTEGER,
    allows_radio BOOLEAN DEFAULT true,
    allows_music_video BOOLEAN DEFAULT true,
    allows_profit_performances BOOLEAN DEFAULT true,
    contract_duration_days INTEGER,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Marketplace Purchases Table
CREATE TABLE IF NOT EXISTS public.marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    license_id UUID REFERENCES public.marketplace_licenses(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    purchase_price DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    producer_revenue DECIMAL(10,2) NOT NULL,
    status public.purchase_status DEFAULT 'pending'::public.purchase_status,
    payment_method TEXT,
    transaction_id TEXT,
    download_url TEXT,
    download_expires_at TIMESTAMPTZ,
    purchased_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Sound Ratings Table
CREATE TABLE IF NOT EXISTS public.sound_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sound_id UUID REFERENCES public.marketplace_sounds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sound_id, user_id)
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_producer_profiles_user_id ON public.producer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_producer_id ON public.marketplace_sounds(producer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_genre ON public.marketplace_sounds(genre);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_bpm ON public.marketplace_sounds(bpm);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_status ON public.marketplace_sounds(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_sounds_featured ON public.marketplace_sounds(featured);
CREATE INDEX IF NOT EXISTS idx_marketplace_licenses_sound_id ON public.marketplace_licenses(sound_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer_id ON public.marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_sound_id ON public.marketplace_purchases(sound_id);
CREATE INDEX IF NOT EXISTS idx_sound_ratings_sound_id ON public.sound_ratings(sound_id);

-- 8. Functions
CREATE OR REPLACE FUNCTION public.update_producer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        UPDATE public.producer_profiles
        SET 
            total_sales = total_sales + 1,
            total_revenue = total_revenue + NEW.producer_revenue,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.producer_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_sound_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    rating_cnt INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(*) INTO avg_rating, rating_cnt
    FROM public.sound_ratings
    WHERE sound_id = COALESCE(NEW.sound_id, OLD.sound_id);
    
    UPDATE public.marketplace_sounds
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.sound_id, OLD.sound_id);
    
    UPDATE public.producer_profiles
    SET 
        rating_average = COALESCE(avg_rating, 0.00),
        rating_count = COALESCE(rating_cnt, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT producer_id FROM public.marketplace_sounds WHERE id = COALESCE(NEW.sound_id, OLD.sound_id));
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_sound_plays(sound_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.marketplace_sounds
    SET plays_count = plays_count + 1
    WHERE id = sound_uuid;
END;
$$;

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
ALTER TABLE public.producer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_ratings ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies

-- Producer Profiles: Public read, own manage
DROP POLICY IF EXISTS "public_read_producer_profiles" ON public.producer_profiles;
CREATE POLICY "public_read_producer_profiles"
ON public.producer_profiles
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "users_manage_own_producer_profiles" ON public.producer_profiles;
CREATE POLICY "users_manage_own_producer_profiles"
ON public.producer_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Marketplace Sounds: Public read published, producers manage own
DROP POLICY IF EXISTS "public_read_published_sounds" ON public.marketplace_sounds;
CREATE POLICY "public_read_published_sounds"
ON public.marketplace_sounds
FOR SELECT
TO public
USING (status = 'published'::public.sound_status);

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

-- Marketplace Licenses: Public read, producers manage
DROP POLICY IF EXISTS "public_read_licenses" ON public.marketplace_licenses;
CREATE POLICY "public_read_licenses"
ON public.marketplace_licenses
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "producers_manage_licenses" ON public.marketplace_licenses;
CREATE POLICY "producers_manage_licenses"
ON public.marketplace_licenses
FOR ALL
TO authenticated
USING (
    sound_id IN (
        SELECT id FROM public.marketplace_sounds WHERE producer_id IN (
            SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
        )
    )
)
WITH CHECK (
    sound_id IN (
        SELECT id FROM public.marketplace_sounds WHERE producer_id IN (
            SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
        )
    )
);

-- Marketplace Purchases: Users view own purchases
DROP POLICY IF EXISTS "users_view_own_purchases" ON public.marketplace_purchases;
CREATE POLICY "users_view_own_purchases"
ON public.marketplace_purchases
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "users_create_purchases" ON public.marketplace_purchases;
CREATE POLICY "users_create_purchases"
ON public.marketplace_purchases
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Sound Ratings: Public read, users manage own
DROP POLICY IF EXISTS "public_read_ratings" ON public.sound_ratings;
CREATE POLICY "public_read_ratings"
ON public.sound_ratings
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "users_manage_own_ratings" ON public.sound_ratings;
CREATE POLICY "users_manage_own_ratings"
ON public.sound_ratings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. Triggers
DROP TRIGGER IF EXISTS update_producer_stats_trigger ON public.marketplace_purchases;
CREATE TRIGGER update_producer_stats_trigger
AFTER INSERT OR UPDATE ON public.marketplace_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_producer_stats();

DROP TRIGGER IF EXISTS update_sound_rating_trigger ON public.sound_ratings;
CREATE TRIGGER update_sound_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sound_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_sound_rating();

DROP TRIGGER IF EXISTS update_producer_profiles_updated_at ON public.producer_profiles;
CREATE TRIGGER update_producer_profiles_updated_at
BEFORE UPDATE ON public.producer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketplace_sounds_updated_at ON public.marketplace_sounds;
CREATE TRIGGER update_marketplace_sounds_updated_at
BEFORE UPDATE ON public.marketplace_sounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'marketplace-audio',
    'marketplace-audio',
    true,
    52428800, -- 50MB
    ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/flac']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'marketplace-images',
    'marketplace-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "public_read_marketplace_audio" ON storage.objects;
CREATE POLICY "public_read_marketplace_audio"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'marketplace-audio');

DROP POLICY IF EXISTS "authenticated_upload_marketplace_audio" ON storage.objects;
CREATE POLICY "authenticated_upload_marketplace_audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'marketplace-audio');

DROP POLICY IF EXISTS "owners_delete_marketplace_audio" ON storage.objects;
CREATE POLICY "owners_delete_marketplace_audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'marketplace-audio' AND owner = auth.uid());

DROP POLICY IF EXISTS "public_read_marketplace_images" ON storage.objects;
CREATE POLICY "public_read_marketplace_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'marketplace-images');

DROP POLICY IF EXISTS "authenticated_upload_marketplace_images" ON storage.objects;
CREATE POLICY "authenticated_upload_marketplace_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'marketplace-images');

DROP POLICY IF EXISTS "owners_delete_marketplace_images" ON storage.objects;
CREATE POLICY "owners_delete_marketplace_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'marketplace-images' AND owner = auth.uid());

-- 13. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    producer_id_1 UUID := gen_random_uuid();
    producer_id_2 UUID := gen_random_uuid();
    sound_id_1 UUID := gen_random_uuid();
    sound_id_2 UUID := gen_random_uuid();
    sound_id_3 UUID := gen_random_uuid();
    license_id_1 UUID := gen_random_uuid();
    license_id_2 UUID := gen_random_uuid();
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
        
        IF existing_user_id IS NOT NULL THEN
            -- Create producer profiles
            INSERT INTO public.producer_profiles (id, user_id, producer_name, bio, total_sales, total_revenue, rating_average, rating_count, is_verified)
            VALUES 
                (producer_id_1, existing_user_id, 'BeatMaster Pro', 'Professional beat producer specializing in trap and hip-hop', 45, 2250.00, 4.8, 23, true),
                (producer_id_2, existing_user_id, 'SoundScape Studios', 'Creating atmospheric loops and ambient samples', 32, 1600.00, 4.6, 18, true)
            ON CONFLICT (id) DO NOTHING;
            
            -- Create marketplace sounds
            INSERT INTO public.marketplace_sounds (id, producer_id, title, description, sound_type, audio_url, genre, bpm, key_signature, mood_tags, instrument_tags, duration_seconds, status, plays_count, downloads_count, featured)
            VALUES 
                (sound_id_1, producer_id_1, 'Dark Trap Beat 2024', 'Hard-hitting trap beat with 808 bass and crisp hi-hats', 'beat'::public.sound_type, 'https://example.com/audio/dark-trap.mp3', 'Trap', 140, 'Am', ARRAY['dark', 'aggressive', 'energetic'], ARRAY['808', 'hi-hat', 'synth'], 180, 'published'::public.sound_status, 1250, 45, true),
                (sound_id_2, producer_id_1, 'Lo-Fi Chill Vibes', 'Relaxing lo-fi beat perfect for study sessions', 'beat'::public.sound_type, 'https://example.com/audio/lofi-chill.mp3', 'Lo-Fi', 85, 'C', ARRAY['chill', 'relaxed', 'mellow'], ARRAY['piano', 'vinyl', 'drums'], 150, 'published'::public.sound_status, 890, 32, false),
                (sound_id_3, producer_id_2, 'Ambient Pad Collection', 'Ethereal ambient pads for atmospheric production', 'sample'::public.sound_type, 'https://example.com/audio/ambient-pads.mp3', 'Ambient', 120, 'Dm', ARRAY['atmospheric', 'dreamy', 'spacious'], ARRAY['synth', 'pad'], 60, 'published'::public.sound_status, 567, 28, false)
            ON CONFLICT (id) DO NOTHING;
            
            -- Create licenses
            INSERT INTO public.marketplace_licenses (id, sound_id, license_type, price, usage_terms, distribution_limit, streaming_limit, allows_radio, allows_music_video, allows_profit_performances, is_available)
            VALUES 
                (license_id_1, sound_id_1, 'lease'::public.license_type, 29.99, 'Standard lease with distribution rights', 5000, 500000, true, true, true, true),
                (license_id_2, sound_id_1, 'exclusive'::public.license_type, 299.99, 'Full exclusive rights with unlimited distribution', NULL, NULL, true, true, true, true)
            ON CONFLICT (id) DO NOTHING;
            
            -- Create sample ratings
            INSERT INTO public.sound_ratings (sound_id, user_id, rating, review)
            VALUES 
                (sound_id_1, existing_user_id, 5, 'Incredible beat! The 808s hit perfectly and the mix is clean.'),
                (sound_id_2, existing_user_id, 4, 'Great lo-fi vibes, perfect for my study playlist.')
            ON CONFLICT (sound_id, user_id) DO NOTHING;
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