-- Location: supabase/migrations/20260129141000_drum_patterns.sql
-- Purpose: Add drum pattern persistence with real-time sync

-- ============================================================================
-- TYPES
-- ============================================================================

CREATE TYPE public.pattern_genre AS ENUM ('trap', 'boom_bap', 'house', 'techno', 'dnb', 'lofi', 'custom');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drum Patterns Table
CREATE TABLE public.drum_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pattern_data JSONB NOT NULL,
    bpm INTEGER DEFAULT 120 CHECK (bpm >= 40 AND bpm <= 300),
    swing INTEGER DEFAULT 0 CHECK (swing >= 0 AND swing <= 100),
    genre public.pattern_genre DEFAULT 'custom'::public.pattern_genre,
    steps INTEGER DEFAULT 16 CHECK (steps IN (8, 16, 32)),
    is_favorite BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_drum_patterns_user_id ON public.drum_patterns(user_id);
CREATE INDEX idx_drum_patterns_created_at ON public.drum_patterns(created_at DESC);
CREATE INDEX idx_drum_patterns_genre ON public.drum_patterns(genre);
CREATE INDEX idx_drum_patterns_favorite ON public.drum_patterns(is_favorite);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.drum_patterns ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drum Patterns Policies
CREATE POLICY "users_manage_own_patterns"
ON public.drum_patterns
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on pattern changes
CREATE TRIGGER update_drum_patterns_updated_at
BEFORE UPDATE ON public.drum_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();