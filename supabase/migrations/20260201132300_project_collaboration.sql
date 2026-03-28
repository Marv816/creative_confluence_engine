-- Location: supabase/migrations/20260201132300_project_collaboration.sql
-- Purpose: Add project collaboration system with real-time co-production capabilities

-- ============================================================================
-- TYPES
-- ============================================================================

DROP TYPE IF EXISTS public.project_role CASCADE;
CREATE TYPE public.project_role AS ENUM ('owner', 'editor', 'viewer');

DROP TYPE IF EXISTS public.invitation_status CASCADE;
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

DROP TYPE IF EXISTS public.project_content_type CASCADE;
CREATE TYPE public.project_content_type AS ENUM ('lyric', 'chord', 'drum_pattern', 'project');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT DEFAULT 'music',
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Project Members (Junction Table with Roles)
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.project_role DEFAULT 'viewer'::public.project_role,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Project Invitations
CREATE TABLE IF NOT EXISTS public.project_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    invitee_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    role public.project_role DEFAULT 'viewer'::public.project_role,
    status public.invitation_status DEFAULT 'pending'::public.invitation_status,
    message TEXT,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Project Activity Log
CREATE TABLE IF NOT EXISTS public.project_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    content_type public.project_content_type,
    content_id UUID,
    action TEXT NOT NULL,
    changes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON public.project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_invitee_email ON public.project_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON public.project_invitations(status);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON public.project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON public.project_activity(created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user has project access with specific role
CREATE OR REPLACE FUNCTION public.has_project_access(project_uuid UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.projects p
        LEFT JOIN public.project_members pm ON p.id = pm.project_id
        WHERE p.id = project_uuid
        AND (
            p.owner_id = auth.uid()
            OR (pm.user_id = auth.uid() AND (
                CASE required_role
                    WHEN 'owner' THEN pm.role = 'owner'::public.project_role
                    WHEN 'editor' THEN pm.role IN ('owner'::public.project_role, 'editor'::public.project_role)
                    WHEN 'viewer' THEN pm.role IN ('owner'::public.project_role, 'editor'::public.project_role, 'viewer'::public.project_role)
                    ELSE false
                END
            ))
        )
    );
$$;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Projects Policies
DROP POLICY IF EXISTS "users_view_accessible_projects" ON public.projects;
CREATE POLICY "users_view_accessible_projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid()
    OR is_public = true
    OR EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = id AND pm.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_create_own_projects" ON public.projects;
CREATE POLICY "users_create_own_projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "owners_update_projects" ON public.projects;
CREATE POLICY "owners_update_projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "owners_delete_projects" ON public.projects;
CREATE POLICY "owners_delete_projects"
ON public.projects
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Project Members Policies
DROP POLICY IF EXISTS "users_view_project_members" ON public.project_members;
CREATE POLICY "users_view_project_members"
ON public.project_members
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id
        AND (
            p.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.project_members pm2
                WHERE pm2.project_id = p.id AND pm2.user_id = auth.uid()
            )
        )
    )
);

DROP POLICY IF EXISTS "owners_manage_project_members" ON public.project_members;
CREATE POLICY "owners_manage_project_members"
ON public.project_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
);

-- Project Invitations Policies
DROP POLICY IF EXISTS "users_view_own_invitations" ON public.project_invitations;
CREATE POLICY "users_view_own_invitations"
ON public.project_invitations
FOR SELECT
TO authenticated
USING (
    inviter_id = auth.uid()
    OR invitee_id = auth.uid()
    OR invitee_email IN (
        SELECT email FROM public.user_profiles WHERE id = auth.uid()
    )
);

DROP POLICY IF EXISTS "owners_create_invitations" ON public.project_invitations;
CREATE POLICY "owners_create_invitations"
ON public.project_invitations
FOR INSERT
TO authenticated
WITH CHECK (
    inviter_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_update_own_invitations" ON public.project_invitations;
CREATE POLICY "users_update_own_invitations"
ON public.project_invitations
FOR UPDATE
TO authenticated
USING (
    inviter_id = auth.uid()
    OR invitee_id = auth.uid()
    OR invitee_email IN (
        SELECT email FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    inviter_id = auth.uid()
    OR invitee_id = auth.uid()
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
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        LEFT JOIN public.project_members pm ON p.id = pm.project_id
        WHERE p.id = project_id
        AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "users_create_project_activity" ON public.project_activity;
CREATE POLICY "users_create_project_activity"
ON public.project_activity
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.projects p
        LEFT JOIN public.project_members pm ON p.id = pm.project_id
        WHERE p.id = project_id
        AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
    )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at on invitations
DROP TRIGGER IF EXISTS update_project_invitations_updated_at ON public.project_invitations;
CREATE TRIGGER update_project_invitations_updated_at
BEFORE UPDATE ON public.project_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- MOCK DATA
-- ============================================================================

DO $$
DECLARE
    existing_user_id UUID;
    project_id_1 UUID := gen_random_uuid();
    project_id_2 UUID := gen_random_uuid();
BEGIN
    -- Get existing user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample projects
        INSERT INTO public.projects (id, owner_id, name, description, project_type, is_public)
        VALUES 
            (project_id_1, existing_user_id, 'Summer Vibes EP', 'Collaborative project for summer-themed tracks with tropical beats and uplifting lyrics', 'music', false),
            (project_id_2, existing_user_id, 'Underground Mixtape', 'Raw hip-hop collaboration focusing on street narratives and boom-bap production', 'music', true)
        ON CONFLICT (id) DO NOTHING;
        
        -- Create sample project member (owner is automatically a member)
        INSERT INTO public.project_members (project_id, user_id, role)
        VALUES 
            (project_id_1, existing_user_id, 'owner'::public.project_role)
        ON CONFLICT (project_id, user_id) DO NOTHING;
        
        -- Create sample invitation
        INSERT INTO public.project_invitations (project_id, inviter_id, invitee_email, role, message, status)
        VALUES 
            (project_id_1, existing_user_id, 'collaborator@example.com', 'editor'::public.project_role, 'Join me on this summer project! Looking forward to creating some fire tracks together.', 'pending'::public.invitation_status)
        ON CONFLICT (id) DO NOTHING;
        
        -- Create sample activity
        INSERT INTO public.project_activity (project_id, user_id, content_type, action, changes)
        VALUES 
            (project_id_1, existing_user_id, 'project'::public.project_content_type, 'created', jsonb_build_object('name', 'Summer Vibes EP')),
            (project_id_2, existing_user_id, 'project'::public.project_content_type, 'created', jsonb_build_object('name', 'Underground Mixtape'))
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Mock collaboration data created successfully for user: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No existing users found. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;