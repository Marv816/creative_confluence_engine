-- BlaccTop Entertainment Platform Migration
-- Tables: artists, beats, blog_posts, collaborations

-- 1. Custom Types
CREATE TYPE public.artist_status AS ENUM ('active', 'inactive', 'featured');
CREATE TYPE public.beat_genre AS ENUM ('hip_hop', 'trap', 'rnb', 'pop', 'drill', 'afrobeat', 'other');
CREATE TYPE public.collaboration_status AS ENUM ('open', 'in_progress', 'completed', 'closed');
CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'archived');

-- 2. Core Tables

-- User Profiles (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Artists Table
CREATE TABLE public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    genre TEXT,
    location TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    status public.artist_status DEFAULT 'active'::public.artist_status,
    featured BOOLEAN DEFAULT false,
    plays_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Beats/Music Store Table
CREATE TABLE public.beats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT,
    cover_image_url TEXT,
    genre public.beat_genre DEFAULT 'hip_hop'::public.beat_genre,
    bpm INTEGER,
    key TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_free BOOLEAN DEFAULT false,
    tags TEXT[],
    plays_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_url TEXT,
    category TEXT,
    tags TEXT[],
    status public.post_status DEFAULT 'draft'::public.post_status,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Collaborations Table
CREATE TABLE public.collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    project_type TEXT,
    required_skills TEXT[],
    status public.collaboration_status DEFAULT 'open'::public.collaboration_status,
    max_collaborators INTEGER DEFAULT 5,
    current_collaborators INTEGER DEFAULT 0,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration Members (Junction Table)
CREATE TABLE public.collaboration_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID REFERENCES public.collaborations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collaboration_id, user_id)
);

-- 3. Indexes
CREATE INDEX idx_artists_user_id ON public.artists(user_id);
CREATE INDEX idx_artists_status ON public.artists(status);
CREATE INDEX idx_artists_featured ON public.artists(featured);
CREATE INDEX idx_beats_artist_id ON public.beats(artist_id);
CREATE INDEX idx_beats_genre ON public.beats(genre);
CREATE INDEX idx_beats_featured ON public.beats(featured);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_collaborations_creator_id ON public.collaborations(creator_id);
CREATE INDEX idx_collaborations_status ON public.collaborations(status);
CREATE INDEX idx_collaboration_members_user_id ON public.collaboration_members(user_id);

-- 4. Functions

-- Trigger function for user_profiles (if not exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_members ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- User Profiles Policies
CREATE POLICY "public_can_view_user_profiles"
ON public.user_profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Artists Policies
CREATE POLICY "public_can_view_artists"
ON public.artists
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_artists"
ON public.artists
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Beats Policies
CREATE POLICY "public_can_view_beats"
ON public.beats
FOR SELECT
TO public
USING (true);

CREATE POLICY "artists_manage_own_beats"
ON public.beats
FOR ALL
TO authenticated
USING (
    artist_id IN (
        SELECT id FROM public.artists WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    artist_id IN (
        SELECT id FROM public.artists WHERE user_id = auth.uid()
    )
);

-- Blog Posts Policies
CREATE POLICY "public_can_view_published_posts"
ON public.blog_posts
FOR SELECT
TO public
USING (status = 'published'::public.post_status);

CREATE POLICY "users_manage_own_blog_posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Collaborations Policies
CREATE POLICY "public_can_view_open_collaborations"
ON public.collaborations
FOR SELECT
TO public
USING (status = 'open'::public.collaboration_status);

CREATE POLICY "authenticated_can_view_all_collaborations"
ON public.collaborations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_manage_own_collaborations"
ON public.collaborations
FOR ALL
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- Collaboration Members Policies
CREATE POLICY "members_can_view_collaboration_members"
ON public.collaboration_members
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_can_join_collaborations"
ON public.collaboration_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_leave_collaborations"
ON public.collaboration_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 7. Triggers

-- User profiles trigger (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp triggers
CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON public.artists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beats_updated_at
    BEFORE UPDATE ON public.beats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaborations_updated_at
    BEFORE UPDATE ON public.collaborations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user1_uuid UUID := gen_random_uuid();
    user2_uuid UUID := gen_random_uuid();
    artist1_uuid UUID;
    artist2_uuid UUID;
    artist3_uuid UUID;
    beat1_uuid UUID;
    beat2_uuid UUID;
    beat3_uuid UUID;
    post1_uuid UUID;
    collab1_uuid UUID;
BEGIN
    -- Create auth users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@blacctop.com', crypt('blacctop2026', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "BlaccTop Admin", "role": "admin"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'producer@blacctop.com', crypt('blacctop2026', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Metro Beats", "role": "user"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'artist@blacctop.com', crypt('blacctop2026', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Lyric Master", "role": "user"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create artists
    INSERT INTO public.artists (id, user_id, stage_name, bio, genre, location, status, featured, plays_count, followers_count)
    VALUES
        (gen_random_uuid(), user1_uuid, 'Metro Beats', 'Award-winning producer specializing in trap and hip-hop beats. Over 10 years of experience crafting chart-topping instrumentals.', 'Hip-Hop/Trap', 'Atlanta, GA', 'featured'::public.artist_status, true, 15420, 3200),
        (gen_random_uuid(), user2_uuid, 'Lyric Master', 'Versatile artist and songwriter with a passion for storytelling through music. Collaborating with producers worldwide.', 'R&B/Hip-Hop', 'Los Angeles, CA', 'active'::public.artist_status, false, 8750, 1850),
        (gen_random_uuid(), admin_uuid, 'BlaccTop Sound', 'Official BlaccTop Entertainment production team. Creating the sound of tomorrow.', 'Various', 'New York, NY', 'featured'::public.artist_status, true, 25600, 5400);

    -- Get artist IDs for beats (use LIMIT 1 to ensure single row)
    SELECT id INTO artist1_uuid FROM public.artists WHERE user_id = user1_uuid LIMIT 1;
    SELECT id INTO artist2_uuid FROM public.artists WHERE user_id = user2_uuid LIMIT 1;
    SELECT id INTO artist3_uuid FROM public.artists WHERE user_id = admin_uuid LIMIT 1;

    -- Create beats
    INSERT INTO public.beats (id, artist_id, title, description, genre, bpm, key, price, is_free, tags, featured, plays_count, likes_count)
    VALUES
        (gen_random_uuid(), artist1_uuid, 'Midnight Vibes', 'Dark atmospheric trap beat with heavy 808s and melodic synths. Perfect for introspective rap verses.', 'trap'::public.beat_genre, 140, 'C Minor', 49.99, false, ARRAY['dark', 'trap', 'melodic', '808'], true, 2340, 456),
        (gen_random_uuid(), artist1_uuid, 'Summer Bounce', 'Upbeat hip-hop instrumental with catchy piano melodies and punchy drums. Great for party anthems.', 'hip_hop'::public.beat_genre, 128, 'G Major', 39.99, false, ARRAY['upbeat', 'piano', 'party', 'summer'], false, 1820, 312),
        (gen_random_uuid(), artist3_uuid, 'Soul Searching', 'Smooth R&B beat with lush pads and vintage drum breaks. Ideal for emotional storytelling.', 'rnb'::public.beat_genre, 85, 'A Minor', 0.00, true, ARRAY['rnb', 'soul', 'smooth', 'free'], true, 5670, 892),
        (gen_random_uuid(), artist2_uuid, 'Drill Time', 'Hard-hitting UK drill beat with sliding 808s and aggressive hi-hats. Ready for street anthems.', 'drill'::public.beat_genre, 145, 'D Minor', 59.99, false, ARRAY['drill', 'uk', 'hard', 'aggressive'], false, 3210, 567),
        (gen_random_uuid(), artist3_uuid, 'Afro Fusion', 'Vibrant afrobeat instrumental blending traditional percussion with modern production.', 'afrobeat'::public.beat_genre, 112, 'E Minor', 44.99, false, ARRAY['afrobeat', 'fusion', 'percussion', 'world'], true, 4120, 723);

    -- Create blog posts
    INSERT INTO public.blog_posts (id, author_id, title, slug, content, excerpt, category, tags, status, views_count, likes_count, published_at)
    VALUES
        (gen_random_uuid(), admin_uuid, 'The Evolution of Hip-Hop Production in 2026', 'evolution-hip-hop-production-2026', 
         'Hip-hop production has undergone a massive transformation in 2026. From AI-assisted beat making to virtual reality studio sessions, the landscape has changed dramatically. In this article, we explore the key trends shaping modern hip-hop production and what it means for independent artists.\n\nThe rise of AI tools has democratized music production, allowing bedroom producers to compete with major studios. However, the human touch remains irreplaceable when it comes to creating authentic, emotionally resonant music.\n\nBlaccTop Entertainment has been at the forefront of this revolution, providing artists with cutting-edge tools while preserving the soul of hip-hop culture.',
         'Exploring how AI and technology are reshaping hip-hop production in 2026, and what it means for independent artists.',
         'Production', ARRAY['hip-hop', 'production', 'AI', 'technology'], 'published'::public.post_status, 3420, 287, now() - INTERVAL '2 days'),
        (gen_random_uuid(), user1_uuid, '5 Essential Tips for Selling Beats Online', '5-tips-selling-beats-online',
         'Selling beats online can be challenging, but with the right strategy, you can build a sustainable income. Here are five essential tips from a producer who has sold over 1000 beats.\n\n1. Build Your Brand: Create a unique sound and visual identity\n2. Use Multiple Platforms: Do not rely on just one marketplace\n3. Engage Your Audience: Social media is your best friend\n4. Offer Free Downloads: Build your email list with free beats\n5. Collaborate: Network with other producers and artists\n\nRemember, consistency is key. Keep creating, keep marketing, and keep improving your craft.',
         'Learn the top 5 strategies for successfully selling your beats online and building a sustainable music production business.',
         'Business', ARRAY['beats', 'business', 'marketing', 'tips'], 'published'::public.post_status, 2150, 198, now() - INTERVAL '5 days'),
        (gen_random_uuid(), user2_uuid, 'Finding Your Voice as an Independent Artist', 'finding-your-voice-independent-artist',
         'In a saturated music industry, finding your unique voice is more important than ever. This journey is personal and challenging, but incredibly rewarding.\n\nStart by exploring different genres and styles. Do not be afraid to experiment. Your influences will naturally blend into something unique to you.\n\nAuthenticity resonates with audiences. Share your real stories, your struggles, and your triumphs. People connect with honesty, not perfection.\n\nBlaccTop Entertainment believes in empowering artists to find and amplify their authentic voices.',
         'A guide for independent artists on discovering and developing their unique artistic voice in a competitive industry.',
         'Artist Development', ARRAY['independent', 'artist', 'creativity', 'authenticity'], 'published'::public.post_status, 1870, 156, now() - INTERVAL '1 week');

    -- Create collaborations
    INSERT INTO public.collaborations (id, creator_id, title, description, project_type, required_skills, status, max_collaborators, current_collaborators, deadline)
    VALUES
        (gen_random_uuid(), user1_uuid, 'Looking for Rapper for Trap EP', 
         'I have 5 fire trap beats ready to go and I am looking for a talented rapper to collaborate on a full EP. Looking for someone with a unique flow and professional recording setup. This could be the start of a long-term partnership!',
         'EP/Album', ARRAY['Rap', 'Vocals', 'Songwriting'], 'open'::public.collaboration_status, 2, 0, now() + INTERVAL '30 days'),
        (gen_random_uuid(), user2_uuid, 'Need Producer for R&B Singles',
         'Singer/songwriter looking for an R&B producer to work on 3 singles. I have the melodies and lyrics ready, need someone who can create smooth, modern R&B production. Open to profit sharing or upfront payment.',
         'Single', ARRAY['Production', 'R&B', 'Mixing'], 'open'::public.collaboration_status, 1, 0, now() + INTERVAL '45 days'),
        (gen_random_uuid(), admin_uuid, 'BlaccTop Compilation Album - Open Call',
         'BlaccTop Entertainment is putting together a compilation album featuring emerging artists. We are looking for rappers, singers, and producers to submit their best work. Selected artists will receive promotion and distribution support.',
         'Compilation', ARRAY['All Genres', 'Original Music'], 'open'::public.collaboration_status, 20, 3, now() + INTERVAL '60 days');

END $$;