-- Location: supabase/migrations/20260201132300_project_collaboration_system.sql
-- Purpose: Project collaboration system with real-time sync, permissions, and activity tracking

-- ============================================================================
-- TYPES
-- ============================================================================

DROP TYPE IF EXISTS public.project_type CASCADE;
CREATE TYPE public.project_type AS ENUM ('lyric', 'chord_progression', 'drum_pattern', 'mixed');

DROP TYPE IF EXISTS public.permission_role CASCADE;
CREATE TYPE public.permission_role AS ENUM ('owner', 'editor', 'viewer');

DROP TYPE IF EXISTS public.invite_status CASCADE;
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

DROP TYPE IF EXISTS public.activity_type CASCADE;
CREATE TYPE public.activity_type AS ENUM ('created', 'updated', 'deleted', 'shared', 'invited', 'joined', 'left', 'permission_changed', 'comment_added');

DROP TYPE IF EXISTS public.content_type CASCADE;
CREATE TYPE public.content_type AS ENUM ('lyric', 'chord', 'drum', 'note');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Collaborative Projects Table
CREATE TABLE IF NOT EXISTS public.collaborative_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    project_type public.project_type DEFAULT 'mixed'::public.project_type,
    content JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Project Permissions Table
CREATE TABLE IF NOT EXISTS public.project_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.permission_role DEFAULT 'viewer'::public.permission_role,
    granted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Collaboration Invitations Table
CREATE TABLE IF NOT EXISTS public.collaboration_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    invitee_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    role public.permission_role DEFAULT 'editor'::public.permission_role,
    status public.invite_status DEFAULT 'pending'::public.invite_status,
    invite_token TEXT UNIQUE,
    message TEXT,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS public.project_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    activity_type public.activity_type NOT NULL,
    content_type public.content_type,
    content_id UUID,
    changes JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Project Versions Table (for change history)
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    version_number INTEGER NOT NULL,
    content_snapshot JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Real-time Presence Table
CREATE TABLE IF NOT EXISTS public.project_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    cursor_position JSONB,
    last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(project_id, user_id)
);

-- Project Comments Table
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.collaborative_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_reference JSONB,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_collaborative_projects_owner_id ON public.collaborative_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_projects_created_at ON public.collaborative_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaborative_projects_type ON public.collaborative_projects(project_type);
CREATE INDEX IF NOT EXISTS idx_collaborative_projects_active ON public.collaborative_projects(is_active);

CREATE INDEX IF NOT EXISTS idx_project_permissions_project_id ON public.project_permissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_user_id ON public.project_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_role ON public.project_permissions(role);

CREATE INDEX IF NOT EXISTS idx_collaboration_invites_project_id ON public.collaboration_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_invitee_email ON public.collaboration_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_invitee_id ON public.collaboration_invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_status ON public.collaboration_invites(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_token ON public.collaboration_invites(invite_token);

CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON public.project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_user_id ON public.project_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON public.project_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_activity_type ON public.project_activity(activity_type);

CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON public.project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_version_number ON public.project_versions(project_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_project_presence_project_id ON public.project_presence(project_id);
CREATE INDEX IF NOT EXISTS idx_project_presence_active ON public.project_presence(project_id, is_active);

CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON public.project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_parent_id ON public.project_comments(parent_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user has permission to access project
CREATE OR REPLACE FUNCTION public.has_project_access(project_uuid UUID, required_role public.permission_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.collaborative_projects cp
        WHERE cp.id = project_uuid AND cp.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.project_permissions pp
        WHERE pp.project_id = project_uuid 
        AND pp.user_id = auth.uid()
        AND (
            (required_role = 'viewer'::public.permission_role AND pp.role IN ('viewer'::public.permission_role, 'editor'::public.permission_role, 'owner'::public.permission_role))
            OR (required_role = 'editor'::public.permission_role AND pp.role IN ('editor'::public.permission_role, 'owner'::public.permission_role))
            OR (required_role = 'owner'::public.permission_role AND pp.role = 'owner'::public.permission_role)
        )
    );
$$;

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_project_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.project_activity (project_id, user_id, activity_type, changes)
        VALUES (NEW.id, auth.uid(), 'created'::public.activity_type, jsonb_build_object('title', NEW.title));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.project_activity (project_id, user_id, activity_type, changes)
        VALUES (NEW.id, auth.uid(), 'updated'::public.activity_type, 
                jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
    END IF;
    RETURN NEW;
END;
$$;

-- Function to create version snapshot
CREATE OR REPLACE FUNCTION public.create_version_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_version INTEGER;
BEGIN
    IF TG_OP = 'UPDATE' AND (OLD.content IS DISTINCT FROM NEW.content) THEN
        SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
        FROM public.project_versions
        WHERE project_id = NEW.id;
        
        INSERT INTO public.project_versions (project_id, user_id, version_number, content_snapshot, change_summary)
        VALUES (NEW.id, auth.uid(), next_version, NEW.content, 'Content updated');
    END IF;
    RETURN NEW;
END;
$$;

-- Function to update presence timestamp
CREATE OR REPLACE FUNCTION public.update_presence_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.last_seen = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.collaborative_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Collaborative Projects Policies
DROP POLICY IF EXISTS "users_view_accessible_projects" ON public.collaborative_projects;
CREATE POLICY "users_view_accessible_projects"
ON public.collaborative_projects
FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid()
    OR id IN (
        SELECT project_id FROM public.project_permissions
        WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_create_own_projects" ON public.collaborative_projects;
CREATE POLICY "users_create_own_projects"
ON public.collaborative_projects
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "users_update_editable_projects" ON public.collaborative_projects;
CREATE POLICY "users_update_editable_projects"
ON public.collaborative_projects
FOR UPDATE
TO authenticated
USING (public.has_project_access(id, 'editor'::public.permission_role))
WITH CHECK (public.has_project_access(id, 'editor'::public.permission_role));

DROP POLICY IF EXISTS "owners_delete_projects" ON public.collaborative_projects;
CREATE POLICY "owners_delete_projects"
ON public.collaborative_projects
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Project Permissions Policies
DROP POLICY IF EXISTS "users_view_project_permissions" ON public.project_permissions;
CREATE POLICY "users_view_project_permissions"
ON public.project_permissions
FOR SELECT
TO authenticated
USING (public.has_project_access(project_id, 'viewer'::public.permission_role));

DROP POLICY IF EXISTS "owners_manage_permissions" ON public.project_permissions;
CREATE POLICY "owners_manage_permissions"
ON public.project_permissions
FOR ALL
TO authenticated
USING (
    project_id IN (
        SELECT id FROM public.collaborative_projects WHERE owner_id = auth.uid()
    )
)
WITH CHECK (
    project_id IN (
        SELECT id FROM public.collaborative_projects WHERE owner_id = auth.uid()
    )
);

-- Collaboration Invites Policies
DROP POLICY IF EXISTS "users_view_own_invites" ON public.collaboration_invites;
CREATE POLICY "users_view_own_invites"
ON public.collaboration_invites
FOR SELECT
TO authenticated
USING (
    inviter_id = auth.uid()
    OR invitee_id = auth.uid()
    OR invitee_email IN (
        SELECT email FROM public.user_profiles WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "owners_create_invites" ON public.collaboration_invites;
CREATE POLICY "owners_create_invites"
ON public.collaboration_invites
FOR INSERT
TO authenticated
WITH CHECK (
    inviter_id = auth.uid()
    AND project_id IN (
        SELECT id FROM public.collaborative_projects WHERE owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "invitees_update_own_invites" ON public.collaboration_invites;
CREATE POLICY "invitees_update_own_invites"
ON public.collaboration_invites
FOR UPDATE
TO authenticated
USING (
    invitee_id = auth.uid()
    OR invitee_email IN (
        SELECT email FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    invitee_id = auth.uid()
    OR invitee_email IN (
        SELECT email FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Project Activity Policies
DROP POLICY IF EXISTS "users_view_project_activity" ON public.project_activity;
CREATE POLICY "users_view_project_activity"
ON public.project_activity
FOR SELECT
TO authenticated
USING (public.has_project_access(project_id, 'viewer'::public.permission_role));

DROP POLICY IF EXISTS "users_create_activity" ON public.project_activity;
CREATE POLICY "users_create_activity"
ON public.project_activity
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Project Versions Policies
DROP POLICY IF EXISTS "users_view_project_versions" ON public.project_versions;
CREATE POLICY "users_view_project_versions"
ON public.project_versions
FOR SELECT
TO authenticated
USING (public.has_project_access(project_id, 'viewer'::public.permission_role));

DROP POLICY IF EXISTS "system_create_versions" ON public.project_versions;
CREATE POLICY "system_create_versions"
ON public.project_versions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Project Presence Policies
DROP POLICY IF EXISTS "users_view_project_presence" ON public.project_presence;
CREATE POLICY "users_view_project_presence"
ON public.project_presence
FOR SELECT
TO authenticated
USING (public.has_project_access(project_id, 'viewer'::public.permission_role));

DROP POLICY IF EXISTS "users_manage_own_presence" ON public.project_presence;
CREATE POLICY "users_manage_own_presence"
ON public.project_presence
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Project Comments Policies
DROP POLICY IF EXISTS "users_view_project_comments" ON public.project_comments;
CREATE POLICY "users_view_project_comments"
ON public.project_comments
FOR SELECT
TO authenticated
USING (public.has_project_access(project_id, 'viewer'::public.permission_role));

DROP POLICY IF EXISTS "users_create_comments" ON public.project_comments;
CREATE POLICY "users_create_comments"
ON public.project_comments
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND public.has_project_access(project_id, 'viewer'::public.permission_role)
);

DROP POLICY IF EXISTS "users_manage_own_comments" ON public.project_comments;
CREATE POLICY "users_manage_own_comments"
ON public.project_comments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_comments" ON public.project_comments;
CREATE POLICY "users_delete_own_comments"
ON public.project_comments
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_collaborative_projects_updated_at ON public.collaborative_projects;
CREATE TRIGGER update_collaborative_projects_updated_at
BEFORE UPDATE ON public.collaborative_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS log_project_activity_trigger ON public.collaborative_projects;
CREATE TRIGGER log_project_activity_trigger
AFTER INSERT OR UPDATE ON public.collaborative_projects
FOR EACH ROW
EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS create_version_snapshot_trigger ON public.collaborative_projects;
CREATE TRIGGER create_version_snapshot_trigger
AFTER UPDATE ON public.collaborative_projects
FOR EACH ROW
EXECUTE FUNCTION public.create_version_snapshot();

DROP TRIGGER IF EXISTS update_project_comments_updated_at ON public.project_comments;
CREATE TRIGGER update_project_comments_updated_at
BEFORE UPDATE ON public.project_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_presence_timestamp_trigger ON public.project_presence;
CREATE TRIGGER update_presence_timestamp_trigger
BEFORE UPDATE ON public.project_presence
FOR EACH ROW
EXECUTE FUNCTION public.update_presence_timestamp();

-- ============================================================================
-- MOCK DATA
-- ============================================================================

DO $$
DECLARE
    existing_user_id UUID;
    second_user_id UUID;
    project_id_1 UUID := gen_random_uuid();
    project_id_2 UUID := gen_random_uuid();
BEGIN
    -- Get existing users
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO second_user_id FROM public.user_profiles WHERE id != existing_user_id LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample collaborative projects
        INSERT INTO public.collaborative_projects (id, owner_id, title, description, project_type, content)
        VALUES 
            (project_id_1, existing_user_id, 'Summer Vibes Collab', 
             'Collaborative project for creating summer-themed lyrics and beats',
             'mixed'::public.project_type,
             jsonb_build_object(
                 'lyrics', jsonb_build_array(
                     jsonb_build_object('id', gen_random_uuid(), 'content', 'Summer breeze, feeling free', 'author', existing_user_id)
                 ),
                 'chords', jsonb_build_array(),
                 'drums', jsonb_build_array()
             )),
            (project_id_2, existing_user_id, 'Hip-Hop Beat Project',
             'Creating a complete hip-hop track with collaborators',
             'drum_pattern'::public.project_type,
             jsonb_build_object('drums', jsonb_build_array()))
        ON CONFLICT (id) DO NOTHING;
        
        -- Create permissions for second user if exists
        IF second_user_id IS NOT NULL THEN
            INSERT INTO public.project_permissions (project_id, user_id, role, granted_by)
            VALUES 
                (project_id_1, second_user_id, 'editor'::public.permission_role, existing_user_id)
            ON CONFLICT (project_id, user_id) DO NOTHING;
            
            -- Create sample invitation
            INSERT INTO public.collaboration_invites (project_id, inviter_id, invitee_email, invitee_id, role, invite_token, message)
            VALUES 
                (project_id_2, existing_user_id, 'collaborator@example.com', second_user_id, 
                 'editor'::public.permission_role, encode(gen_random_bytes(32), 'hex'),
                 'Join me in creating this amazing track!')
            ON CONFLICT (id) DO NOTHING;
        END IF;
        
        -- Create sample activity
        INSERT INTO public.project_activity (project_id, user_id, activity_type, changes)
        VALUES 
            (project_id_1, existing_user_id, 'created'::public.activity_type, 
             jsonb_build_object('title', 'Summer Vibes Collab')),
            (project_id_1, existing_user_id, 'updated'::public.activity_type,
             jsonb_build_object('field', 'content', 'action', 'added_lyrics'))
        ON CONFLICT (id) DO NOTHING;
        
        -- Create initial version
        INSERT INTO public.project_versions (project_id, user_id, version_number, content_snapshot, change_summary)
        VALUES 
            (project_id_1, existing_user_id, 1, 
             jsonb_build_object('lyrics', jsonb_build_array()),
             'Initial project creation')
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Mock collaboration data created successfully';
    ELSE
        RAISE NOTICE 'No existing users found. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
