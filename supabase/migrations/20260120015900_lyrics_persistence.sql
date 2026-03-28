-- Location: supabase/migrations/20260120015900_lyrics_persistence.sql
-- Purpose: Add lyrics persistence, generator history, and user preferences with real-time sync

-- ============================================================================
-- TYPES
-- ============================================================================

CREATE TYPE public.lyric_section AS ENUM ('verse', 'chorus', 'bridge', 'hook', 'intro', 'outro');
CREATE TYPE public.generation_status AS ENUM ('draft', 'completed', 'archived');

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Lyrics Table
CREATE TABLE public.user_lyrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    genre TEXT,
    subject TEXT,
    tone TEXT,
    artist_styles TEXT,
    section public.lyric_section DEFAULT 'verse'::public.lyric_section,
    bars INTEGER DEFAULT 16,
    status public.generation_status DEFAULT 'draft'::public.generation_status,
    analysis JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Generator History Table
CREATE TABLE public.generator_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lyrics_id UUID REFERENCES public.user_lyrics(id) ON DELETE SET NULL,
    genre TEXT NOT NULL,
    subject TEXT NOT NULL,
    tone TEXT,
    artist_styles TEXT,
    section public.lyric_section,
    bars INTEGER,
    generation_method TEXT DEFAULT 'standard',
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences Table
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    default_genre TEXT DEFAULT 'Hip-Hop',
    default_tone TEXT DEFAULT 'Confident',
    favorite_artists TEXT[] DEFAULT ARRAY[]::TEXT[],
    auto_save_enabled BOOLEAN DEFAULT true,
    real_time_sync_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'dark',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_lyrics_user_id ON public.user_lyrics(user_id);
CREATE INDEX idx_user_lyrics_created_at ON public.user_lyrics(created_at DESC);
CREATE INDEX idx_user_lyrics_status ON public.user_lyrics(status);
CREATE INDEX idx_generator_history_user_id ON public.generator_history(user_id);
CREATE INDEX idx_generator_history_created_at ON public.generator_history(created_at DESC);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION public.create_default_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.user_lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generator_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- User Lyrics Policies
CREATE POLICY "users_manage_own_lyrics"
ON public.user_lyrics
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Generator History Policies
CREATE POLICY "users_view_own_history"
ON public.generator_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_create_own_history"
ON public.generator_history
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- User Preferences Policies
CREATE POLICY "users_manage_own_preferences"
ON public.user_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on user_lyrics
CREATE TRIGGER update_user_lyrics_updated_at
    BEFORE UPDATE ON public.user_lyrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create default preferences for new users
CREATE TRIGGER create_user_preferences_on_signup
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_preferences();

-- ============================================================================
-- MOCK DATA
-- ============================================================================

DO $$
DECLARE
    existing_user_id UUID;
    lyric_id_1 UUID := gen_random_uuid();
    lyric_id_2 UUID := gen_random_uuid();
BEGIN
    -- Get existing user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample lyrics
        INSERT INTO public.user_lyrics (id, user_id, title, content, genre, subject, tone, artist_styles, section, bars, status)
        VALUES 
            (lyric_id_1, existing_user_id, 'City Lights', 
             E'Walking through the city lights, feeling so alive\nEvery corner tells a story, every street a vibe\nDreams are painted on the walls, colors never fade\nThis is where I found myself, this is where I stayed',
             'Hip-Hop', 'City Life', 'Reflective', 'Kendrick Lamar, J. Cole', 'verse'::public.lyric_section, 16, 'completed'::public.generation_status),
            (lyric_id_2, existing_user_id, 'Rise Up',
             E'Started from the bottom now we rising to the top\nNothing gonna stop us, never gonna drop\nEvery setback is a setup for a comeback\nKeep pushing forward, never looking back',
             'Trap', 'Success', 'Confident', 'Drake, Future', 'chorus'::public.lyric_section, 8, 'completed'::public.generation_status);
        
        -- Create generator history
        INSERT INTO public.generator_history (user_id, lyrics_id, genre, subject, tone, artist_styles, section, bars, generation_method, success)
        VALUES 
            (existing_user_id, lyric_id_1, 'Hip-Hop', 'City Life', 'Reflective', 'Kendrick Lamar, J. Cole', 'verse'::public.lyric_section, 16, 'standard', true),
            (existing_user_id, lyric_id_2, 'Trap', 'Success', 'Confident', 'Drake, Future', 'chorus'::public.lyric_section, 8, 'streaming', true);
        
        -- User preferences created automatically by trigger
        RAISE NOTICE 'Mock data created successfully for user: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No existing users found. Run auth migration first.';
    END IF;
END $$;