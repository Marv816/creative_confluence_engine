import { supabase } from '../lib/supabase';

/**
 * Project Collaboration Service
 * Handles projects, members, invitations, and activity tracking
 */

export const projectCollaborationService = {
  // ============================================================================
  // PROJECTS
  // ============================================================================

  /**
   * Get all projects accessible to the current user
   */
  async getAllProjects() {
    try {
      const { data, error } = await supabase?.from('projects')?.select(`
          *,
          owner:user_profiles!projects_owner_id_fkey(id, full_name, email, avatar_url),
          project_members(count)
        `)?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(project => ({
        id: project?.id,
        ownerId: project?.owner_id,
        name: project?.name,
        description: project?.description,
        projectType: project?.project_type,
        isPublic: project?.is_public,
        metadata: project?.metadata,
        createdAt: project?.created_at,
        updatedAt: project?.updated_at,
        owner: {
          id: project?.owner?.id,
          fullName: project?.owner?.full_name,
          email: project?.owner?.email,
          avatarUrl: project?.owner?.avatar_url
        },
        memberCount: project?.project_members?.[0]?.count || 0
      })) || [];
    } catch (error) {
      console.error('[ProjectCollaboration] Get all projects error:', error);
      throw error;
    }
  },

  /**
   * Get project by ID with full details
   */
  async getProjectById(projectId) {
    try {
      const { data, error } = await supabase?.from('projects')?.select(`
          *,
          owner:user_profiles!projects_owner_id_fkey(id, full_name, email, avatar_url),
          project_members(
            id,
            role,
            joined_at,
            user:user_profiles(id, full_name, email, avatar_url)
          )
        `)?.eq('id', projectId)?.single();

      if (error) throw error;

      return {
        id: data?.id,
        ownerId: data?.owner_id,
        name: data?.name,
        description: data?.description,
        projectType: data?.project_type,
        isPublic: data?.is_public,
        metadata: data?.metadata,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        owner: {
          id: data?.owner?.id,
          fullName: data?.owner?.full_name,
          email: data?.owner?.email,
          avatarUrl: data?.owner?.avatar_url
        },
        members: data?.project_members?.map(member => ({
          id: member?.id,
          role: member?.role,
          joinedAt: member?.joined_at,
          user: {
            id: member?.user?.id,
            fullName: member?.user?.full_name,
            email: member?.user?.email,
            avatarUrl: member?.user?.avatar_url
          }
        })) || []
      };
    } catch (error) {
      console.error('[ProjectCollaboration] Get project by ID error:', error);
      throw error;
    }
  },

  /**
   * Create new project
   */
  async createProject(projectData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase?.from('projects')?.insert({
          owner_id: user?.id,
          name: projectData?.name,
          description: projectData?.description,
          project_type: projectData?.projectType || 'music',
          is_public: projectData?.isPublic || false,
          metadata: projectData?.metadata || {}
        })?.select()?.single();

      if (error) throw error;

      // Add owner as project member
      await supabase?.from('project_members')?.insert({
          project_id: data?.id,
          user_id: user?.id,
          role: 'owner'
        });

      // Log activity
      await this.logActivity(data?.id, user?.id, 'project', data?.id, 'created', {
        name: projectData?.name
      });

      return data;
    } catch (error) {
      console.error('[ProjectCollaboration] Create project error:', error);
      throw error;
    }
  },

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase?.from('projects')?.update({
          name: updates?.name,
          description: updates?.description,
          is_public: updates?.isPublic,
          metadata: updates?.metadata
        })?.eq('id', projectId)?.select()?.single();

      if (error) throw error;

      // Log activity
      await this.logActivity(projectId, user?.id, 'project', projectId, 'updated', updates);

      return data;
    } catch (error) {
      console.error('[ProjectCollaboration] Update project error:', error);
      throw error;
    }
  },

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    try {
      const { error } = await supabase?.from('projects')?.delete()?.eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('[ProjectCollaboration] Delete project error:', error);
      throw error;
    }
  },

  // ============================================================================
  // PROJECT MEMBERS
  // ============================================================================

  /**
   * Get project members
   */
  async getProjectMembers(projectId) {
    try {
      const { data, error } = await supabase?.from('project_members')?.select(`
          *,
          user:user_profiles(id, full_name, email, avatar_url)
        `)?.eq('project_id', projectId)?.order('joined_at', { ascending: true });

      if (error) throw error;

      return data?.map(member => ({
        id: member?.id,
        projectId: member?.project_id,
        userId: member?.user_id,
        role: member?.role,
        joinedAt: member?.joined_at,
        user: {
          id: member?.user?.id,
          fullName: member?.user?.full_name,
          email: member?.user?.email,
          avatarUrl: member?.user?.avatar_url
        }
      })) || [];
    } catch (error) {
      console.error('[ProjectCollaboration] Get project members error:', error);
      throw error;
    }
  },

  /**
   * Update member role
   */
  async updateMemberRole(memberId, newRole) {
    try {
      const { data, error } = await supabase?.from('project_members')?.update({ role: newRole })?.eq('id', memberId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[ProjectCollaboration] Update member role error:', error);
      throw error;
    }
  },

  /**
   * Remove member from project
   */
  async removeMember(memberId) {
    try {
      const { error } = await supabase?.from('project_members')?.delete()?.eq('id', memberId);

      if (error) throw error;
    } catch (error) {
      console.error('[ProjectCollaboration] Remove member error:', error);
      throw error;
    }
  },

  // ============================================================================
  // INVITATIONS
  // ============================================================================

  /**
   * Get project invitations
   */
  async getProjectInvitations(projectId) {
    try {
      const { data, error } = await supabase?.from('project_invitations')?.select(`
          *,
          inviter:user_profiles!project_invitations_inviter_id_fkey(id, full_name, email, avatar_url),
          project:projects(id, name)
        `)?.eq('project_id', projectId)?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(invitation => ({
        id: invitation?.id,
        projectId: invitation?.project_id,
        inviterId: invitation?.inviter_id,
        inviteeEmail: invitation?.invitee_email,
        inviteeId: invitation?.invitee_id,
        role: invitation?.role,
        status: invitation?.status,
        message: invitation?.message,
        expiresAt: invitation?.expires_at,
        createdAt: invitation?.created_at,
        updatedAt: invitation?.updated_at,
        inviter: {
          id: invitation?.inviter?.id,
          fullName: invitation?.inviter?.full_name,
          email: invitation?.inviter?.email,
          avatarUrl: invitation?.inviter?.avatar_url
        },
        project: {
          id: invitation?.project?.id,
          name: invitation?.project?.name
        }
      })) || [];
    } catch (error) {
      console.error('[ProjectCollaboration] Get invitations error:', error);
      throw error;
    }
  },

  /**
   * Get user's pending invitations
   */
  async getUserInvitations() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase?.from('user_profiles')?.select('email')?.eq('id', user?.id)?.single();

      const { data, error } = await supabase?.from('project_invitations')?.select(`
          *,
          inviter:user_profiles!project_invitations_inviter_id_fkey(id, full_name, email, avatar_url),
          project:projects(id, name, description)
        `)?.eq('invitee_email', profile?.email)?.eq('status', 'pending')?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(invitation => ({
        id: invitation?.id,
        projectId: invitation?.project_id,
        inviterId: invitation?.inviter_id,
        inviteeEmail: invitation?.invitee_email,
        role: invitation?.role,
        status: invitation?.status,
        message: invitation?.message,
        expiresAt: invitation?.expires_at,
        createdAt: invitation?.created_at,
        inviter: {
          id: invitation?.inviter?.id,
          fullName: invitation?.inviter?.full_name,
          email: invitation?.inviter?.email,
          avatarUrl: invitation?.inviter?.avatar_url
        },
        project: {
          id: invitation?.project?.id,
          name: invitation?.project?.name,
          description: invitation?.project?.description
        }
      })) || [];
    } catch (error) {
      console.error('[ProjectCollaboration] Get user invitations error:', error);
      throw error;
    }
  },

  /**
   * Send invitation
   */
  async sendInvitation(invitationData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase?.from('project_invitations')?.insert({
          project_id: invitationData?.projectId,
          inviter_id: user?.id,
          invitee_email: invitationData?.inviteeEmail,
          role: invitationData?.role || 'viewer',
          message: invitationData?.message
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[ProjectCollaboration] Send invitation error:', error);
      throw error;
    }
  },

  /**
   * Accept invitation
   */
  async acceptInvitation(invitationId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get invitation details
      const { data: invitation, error: invError } = await supabase?.from('project_invitations')?.select('*')?.eq('id', invitationId)?.single();

      if (invError) throw invError;

      // Update invitation status
      const { error: updateError } = await supabase?.from('project_invitations')?.update({ 
          status: 'accepted',
          invitee_id: user?.id
        })?.eq('id', invitationId);

      if (updateError) throw updateError;

      // Add user to project members
      const { error: memberError } = await supabase?.from('project_members')?.insert({
          project_id: invitation?.project_id,
          user_id: user?.id,
          role: invitation?.role
        });

      if (memberError) throw memberError;

      // Log activity
      await this.logActivity(
        invitation?.project_id,
        user?.id,
        'project',
        invitation?.project_id,
        'member_joined',
        { role: invitation?.role }
      );

      return invitation;
    } catch (error) {
      console.error('[ProjectCollaboration] Accept invitation error:', error);
      throw error;
    }
  },

  /**
   * Reject invitation
   */
  async rejectInvitation(invitationId) {
    try {
      const { error } = await supabase?.from('project_invitations')?.update({ status: 'rejected' })?.eq('id', invitationId);

      if (error) throw error;
    } catch (error) {
      console.error('[ProjectCollaboration] Reject invitation error:', error);
      throw error;
    }
  },

  /**
   * Resend invitation
   */
  async resendInvitation(invitationId) {
    try {
      const { error } = await supabase?.from('project_invitations')?.update({ 
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toISOString()
        })?.eq('id', invitationId);

      if (error) throw error;
    } catch (error) {
      console.error('[ProjectCollaboration] Resend invitation error:', error);
      throw error;
    }
  },

  // ============================================================================
  // ACTIVITY LOG
  // ============================================================================

  /**
   * Get project activity
   */
  async getProjectActivity(projectId, limit = 50) {
    try {
      const { data, error } = await supabase?.from('project_activity')?.select(`
          *,
          user:user_profiles(id, full_name, avatar_url)
        `)?.eq('project_id', projectId)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(activity => ({
        id: activity?.id,
        projectId: activity?.project_id,
        userId: activity?.user_id,
        contentType: activity?.content_type,
        contentId: activity?.content_id,
        action: activity?.action,
        changes: activity?.changes,
        createdAt: activity?.created_at,
        user: activity?.user ? {
          id: activity?.user?.id,
          fullName: activity?.user?.full_name,
          avatarUrl: activity?.user?.avatar_url
        } : null
      })) || [];
    } catch (error) {
      console.error('[ProjectCollaboration] Get activity error:', error);
      throw error;
    }
  },

  /**
   * Log activity
   */
  async logActivity(projectId, userId, contentType, contentId, action, changes = {}) {
    try {
      const { error } = await supabase?.from('project_activity')?.insert({
          project_id: projectId,
          user_id: userId,
          content_type: contentType,
          content_id: contentId,
          action,
          changes
        });

      if (error) throw error;
    } catch (error) {
      console.error('[ProjectCollaboration] Log activity error:', error);
      // Don't throw - activity logging should not break main operations
    }
  },

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to project changes
   */
  subscribeToProject(projectId, callback) {
    const channel = supabase?.channel(`project_${projectId}`)?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`
        },
        (payload) => {
          callback({ type: 'project', payload });
        }
      )?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          callback({ type: 'members', payload });
        }
      )?.on(
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
      )?.subscribe();

    return channel;
  },

  /**
   * Subscribe to user invitations
   */
  subscribeToInvitations(callback) {
    const channel = supabase?.channel('user_invitations')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_invitations'
        },
        (payload) => {
          callback(payload);
        }
      )?.subscribe();

    return channel;
  },

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel) {
    if (channel) {
      supabase?.removeChannel(channel);
    }
  }
};