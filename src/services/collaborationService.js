import { supabase } from '../lib/supabase';

/**
 * Service for managing collaborative projects
 */
export const collaborativeProjectService = {
  /**
   * Get all projects accessible to the current user
   */
  async getAll(options = {}) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        ?.from('collaborative_projects')
        ?.select(`
          *,
          owner:user_profiles!owner_id(id, full_name, avatar_url, email),
          permissions:project_permissions(role, user_id, user_profiles(full_name, avatar_url)),
          activity:project_activity(activity_type, created_at, user_profiles(full_name))
        `)
        ?.order('updated_at', { ascending: false });

      if (options?.projectType) {
        query = query?.eq('project_type', options?.projectType);
      }

      if (options?.isActive !== undefined) {
        query = query?.eq('is_active', options?.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(row => ({
        id: row?.id,
        ownerId: row?.owner_id,
        owner: row?.owner,
        title: row?.title,
        description: row?.description,
        projectType: row?.project_type,
        content: row?.content,
        metadata: row?.metadata,
        isActive: row?.is_active,
        permissions: row?.permissions?.map(p => ({
          role: p?.role,
          userId: p?.user_id,
          user: p?.user_profiles
        })),
        recentActivity: row?.activity?.slice(0, 5),
        createdAt: row?.created_at,
        updatedAt: row?.updated_at
      }));
    } catch (error) {
      console.error('[Collaborative Project Service] Get all error:', error);
      throw error;
    }
  },

  /**
   * Get a single project by ID
   */
  async getById(id) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('collaborative_projects')
        ?.select(`
          *,
          owner:user_profiles!owner_id(id, full_name, avatar_url, email),
          permissions:project_permissions(
            id, role, granted_at,
            user:user_profiles!user_id(id, full_name, avatar_url, email)
          ),
          versions:project_versions(id, version_number, change_summary, created_at, user_profiles(full_name)),
          comments:project_comments(
            id, content, content_reference, is_resolved, created_at,
            user:user_profiles!user_id(full_name, avatar_url),
            replies:project_comments!parent_id(id, content, created_at, user_profiles(full_name))
          )
        `)
        ?.eq('id', id)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        ownerId: data?.owner_id,
        owner: data?.owner,
        title: data?.title,
        description: data?.description,
        projectType: data?.project_type,
        content: data?.content,
        metadata: data?.metadata,
        isActive: data?.is_active,
        permissions: data?.permissions?.map(p => ({
          id: p?.id,
          role: p?.role,
          grantedAt: p?.granted_at,
          user: p?.user
        })),
        versions: data?.versions?.map(v => ({
          id: v?.id,
          versionNumber: v?.version_number,
          changeSummary: v?.change_summary,
          createdAt: v?.created_at,
          user: v?.user_profiles
        })),
        comments: data?.comments?.filter(c => !c?.parent_id)?.map(c => ({
          id: c?.id,
          content: c?.content,
          contentReference: c?.content_reference,
          isResolved: c?.is_resolved,
          createdAt: c?.created_at,
          user: c?.user,
          replies: c?.replies
        })),
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('[Collaborative Project Service] Get by ID error:', error);
      throw error;
    }
  },

  /**
   * Create a new collaborative project
   */
  async create(projectData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('collaborative_projects')
        ?.insert({
          owner_id: user?.id,
          title: projectData?.title,
          description: projectData?.description,
          project_type: projectData?.projectType || 'mixed',
          content: projectData?.content || {},
          metadata: projectData?.metadata || {}
        })
        ?.select(`
          *,
          owner:user_profiles!owner_id(id, full_name, avatar_url, email)
        `)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        ownerId: data?.owner_id,
        owner: data?.owner,
        title: data?.title,
        description: data?.description,
        projectType: data?.project_type,
        content: data?.content,
        metadata: data?.metadata,
        isActive: data?.is_active,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('[Collaborative Project Service] Create error:', error);
      throw error;
    }
  },

  /**
   * Update a project
   */
  async update(id, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {};
      if (updates?.title !== undefined) updateData.title = updates?.title;
      if (updates?.description !== undefined) updateData.description = updates?.description;
      if (updates?.content !== undefined) updateData.content = updates?.content;
      if (updates?.metadata !== undefined) updateData.metadata = updates?.metadata;
      if (updates?.isActive !== undefined) updateData.is_active = updates?.isActive;

      const { data, error } = await supabase
        ?.from('collaborative_projects')
        ?.update(updateData)
        ?.eq('id', id)
        ?.select()
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        ownerId: data?.owner_id,
        title: data?.title,
        description: data?.description,
        projectType: data?.project_type,
        content: data?.content,
        metadata: data?.metadata,
        isActive: data?.is_active,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('[Collaborative Project Service] Update error:', error);
      throw error;
    }
  },

  /**
   * Delete a project
   */
  async delete(id) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('collaborative_projects')
        ?.delete()
        ?.eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('[Collaborative Project Service] Delete error:', error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time changes for a project
   */
  subscribeToProject(projectId, callback) {
    const channel = supabase
      ?.channel(`project_${projectId}`)
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborative_projects',
          filter: `id=eq.${projectId}`
        },
        (payload) => {
          callback({ type: 'project', payload });
        }
      )
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_activity',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          callback({ type: 'activity', payload });
        }
      )
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_presence',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          callback({ type: 'presence', payload });
        }
      )
      ?.subscribe();

    return channel;
  },

  /**
   * Unsubscribe from real-time changes
   */
  unsubscribe(channel) {
    if (channel) {
      supabase?.removeChannel(channel);
    }
  }
};

/**
 * Service for managing project permissions
 */
export const projectPermissionService = {
  /**
   * Add a collaborator to a project
   */
  async addCollaborator(projectId, userId, role = 'editor') {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('project_permissions')
        ?.insert({
          project_id: projectId,
          user_id: userId,
          role,
          granted_by: user?.id
        })
        ?.select(`
          *,
          user:user_profiles!user_id(id, full_name, avatar_url, email)
        `)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        projectId: data?.project_id,
        userId: data?.user_id,
        user: data?.user,
        role: data?.role,
        grantedAt: data?.granted_at
      };
    } catch (error) {
      console.error('[Project Permission Service] Add collaborator error:', error);
      throw error;
    }
  },

  /**
   * Update collaborator role
   */
  async updateRole(permissionId, newRole) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('project_permissions')
        ?.update({ role: newRole })
        ?.eq('id', permissionId)
        ?.select()
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        projectId: data?.project_id,
        userId: data?.user_id,
        role: data?.role,
        grantedAt: data?.granted_at
      };
    } catch (error) {
      console.error('[Project Permission Service] Update role error:', error);
      throw error;
    }
  },

  /**
   * Remove a collaborator from a project
   */
  async removeCollaborator(permissionId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('project_permissions')
        ?.delete()
        ?.eq('id', permissionId);

      if (error) throw error;
    } catch (error) {
      console.error('[Project Permission Service] Remove collaborator error:', error);
      throw error;
    }
  }
};

/**
 * Service for managing collaboration invitations
 */
export const collaborationInviteService = {
  /**
   * Create an invitation
   */
  async create(inviteData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const inviteToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))?.map(b => b?.toString(16)?.padStart(2, '0'))?.join('');

      const { data, error } = await supabase
        ?.from('collaboration_invites')
        ?.insert({
          project_id: inviteData?.projectId,
          inviter_id: user?.id,
          invitee_email: inviteData?.inviteeEmail,
          role: inviteData?.role || 'editor',
          invite_token: inviteToken,
          message: inviteData?.message
        })
        ?.select(`
          *,
          project:collaborative_projects(title),
          inviter:user_profiles!inviter_id(full_name, avatar_url)
        `)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        projectId: data?.project_id,
        project: data?.project,
        inviterId: data?.inviter_id,
        inviter: data?.inviter,
        inviteeEmail: data?.invitee_email,
        role: data?.role,
        status: data?.status,
        inviteToken: data?.invite_token,
        message: data?.message,
        expiresAt: data?.expires_at,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('[Collaboration Invite Service] Create error:', error);
      throw error;
    }
  },

  /**
   * Get invitations for current user
   */
  async getMyInvites() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('email')
        ?.eq('id', user?.id)
        ?.single();

      const { data, error } = await supabase
        ?.from('collaboration_invites')
        ?.select(`
          *,
          project:collaborative_projects(id, title, description, project_type),
          inviter:user_profiles!inviter_id(full_name, avatar_url)
        `)
        ?.eq('invitee_email', profile?.email)
        ?.eq('status', 'pending')
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(row => ({
        id: row?.id,
        projectId: row?.project_id,
        project: row?.project,
        inviterId: row?.inviter_id,
        inviter: row?.inviter,
        inviteeEmail: row?.invitee_email,
        role: row?.role,
        status: row?.status,
        message: row?.message,
        expiresAt: row?.expires_at,
        createdAt: row?.created_at
      }));
    } catch (error) {
      console.error('[Collaboration Invite Service] Get my invites error:', error);
      throw error;
    }
  },

  /**
   * Accept an invitation
   */
  async accept(inviteId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update invite status
      const { data: invite, error: inviteError } = await supabase
        ?.from('collaboration_invites')
        ?.update({
          status: 'accepted',
          invitee_id: user?.id,
          responded_at: new Date()?.toISOString()
        })
        ?.eq('id', inviteId)
        ?.select()
        ?.single();

      if (inviteError) throw inviteError;

      // Add permission
      const { error: permError } = await supabase
        ?.from('project_permissions')
        ?.insert({
          project_id: invite?.project_id,
          user_id: user?.id,
          role: invite?.role,
          granted_by: invite?.inviter_id
        });

      if (permError) throw permError;

      return invite;
    } catch (error) {
      console.error('[Collaboration Invite Service] Accept error:', error);
      throw error;
    }
  },

  /**
   * Decline an invitation
   */
  async decline(inviteId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('collaboration_invites')
        ?.update({
          status: 'declined',
          invitee_id: user?.id,
          responded_at: new Date()?.toISOString()
        })
        ?.eq('id', inviteId);

      if (error) throw error;
    } catch (error) {
      console.error('[Collaboration Invite Service] Decline error:', error);
      throw error;
    }
  }
};

/**
 * Service for managing project activity
 */
export const projectActivityService = {
  /**
   * Get activity for a project
   */
  async getActivity(projectId, limit = 50) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('project_activity')
        ?.select(`
          *,
          user:user_profiles!user_id(full_name, avatar_url)
        `)
        ?.eq('project_id', projectId)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return data?.map(row => ({
        id: row?.id,
        projectId: row?.project_id,
        userId: row?.user_id,
        user: row?.user,
        activityType: row?.activity_type,
        contentType: row?.content_type,
        contentId: row?.content_id,
        changes: row?.changes,
        metadata: row?.metadata,
        createdAt: row?.created_at
      }));
    } catch (error) {
      console.error('[Project Activity Service] Get activity error:', error);
      throw error;
    }
  },

  /**
   * Log custom activity
   */
  async logActivity(activityData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('project_activity')
        ?.insert({
          project_id: activityData?.projectId,
          user_id: user?.id,
          activity_type: activityData?.activityType,
          content_type: activityData?.contentType,
          content_id: activityData?.contentId,
          changes: activityData?.changes || {},
          metadata: activityData?.metadata || {}
        })
        ?.select()
        ?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[Project Activity Service] Log activity error:', error);
      throw error;
    }
  }
};

/**
 * Service for managing real-time presence
 */
export const projectPresenceService = {
  /**
   * Update user presence in a project
   */
  async updatePresence(projectId, cursorPosition = null) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('project_presence')
        ?.upsert({
          project_id: projectId,
          user_id: user?.id,
          cursor_position: cursorPosition,
          is_active: true,
          last_seen: new Date()?.toISOString()
        }, {
          onConflict: 'project_id,user_id'
        })
        ?.select()
        ?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[Project Presence Service] Update presence error:', error);
      throw error;
    }
  },

  /**
   * Get active users in a project
   */
  async getActiveUsers(projectId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)?.toISOString();

      const { data, error } = await supabase
        ?.from('project_presence')
        ?.select(`
          *,
          user:user_profiles!user_id(id, full_name, avatar_url)
        `)
        ?.eq('project_id', projectId)
        ?.eq('is_active', true)
        ?.gte('last_seen', fiveMinutesAgo);

      if (error) throw error;

      return data?.map(row => ({
        userId: row?.user_id,
        user: row?.user,
        cursorPosition: row?.cursor_position,
        lastSeen: row?.last_seen
      }));
    } catch (error) {
      console.error('[Project Presence Service] Get active users error:', error);
      throw error;
    }
  },

  /**
   * Leave project (mark as inactive)
   */
  async leave(projectId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('project_presence')
        ?.update({ is_active: false })
        ?.eq('project_id', projectId)
        ?.eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('[Project Presence Service] Leave error:', error);
      throw error;
    }
  }
};
