import { supabase } from '../lib/supabase';

// Artists Service
export const artistsService = {
  async getAll() {
    const { data, error } = await supabase?.from('artists')?.select('*, user_profiles(full_name, avatar_url)')?.order('featured', { ascending: false })?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getFeatured() {
    const { data, error } = await supabase?.from('artists')?.select('*, user_profiles(full_name, avatar_url)')?.eq('featured', true)?.eq('status', 'featured')?.order('followers_count', { ascending: false })?.limit(6);
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase?.from('artists')?.select('*, user_profiles(full_name, avatar_url, email)')?.eq('id', id)?.single();
    
    if (error) throw error;
    return data;
  }
};

// Beats Service
export const beatsService = {
  async getAll(filters = {}) {
    let query = supabase?.from('beats')?.select('*, artists(stage_name, avatar_url)')?.order('featured', { ascending: false })?.order('created_at', { ascending: false });

    if (filters?.genre) {
      query = query?.eq('genre', filters?.genre);
    }

    if (filters?.isFree !== undefined) {
      query = query?.eq('is_free', filters?.isFree);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getFeatured() {
    const { data, error } = await supabase?.from('beats')?.select('*, artists(stage_name, avatar_url)')?.eq('featured', true)?.order('plays_count', { ascending: false })?.limit(8);
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase?.from('beats')?.select('*, artists(stage_name, avatar_url, bio)')?.eq('id', id)?.single();
    
    if (error) throw error;
    return data;
  },

  async incrementPlays(id) {
    const { error } = await supabase?.rpc('increment_beat_plays', { beat_id: id });
    if (error) console.error('Error incrementing plays:', error);
  }
};

// Blog Service
export const blogService = {
  async getAll() {
    const { data, error } = await supabase?.from('blog_posts')?.select('*, user_profiles(full_name, avatar_url)')?.eq('status', 'published')?.order('published_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase?.from('blog_posts')?.select('*, user_profiles(full_name, avatar_url, bio)')?.eq('slug', slug)?.eq('status', 'published')?.single();
    
    if (error) throw error;
    return data;
  },

  async incrementViews(id) {
    const { error } = await supabase?.rpc('increment_post_views', { post_id: id });
    if (error) console.error('Error incrementing views:', error);
  }
};

// Collaborations Service
export const collaborationsService = {
  async getAll(filters = {}) {
    let query = supabase?.from('collaborations')?.select('*, user_profiles(full_name, avatar_url)')?.order('created_at', { ascending: false });

    if (filters?.status) {
      query = query?.eq('status', filters?.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase?.from('collaborations')?.select('*, user_profiles(full_name, avatar_url, email), collaboration_members(*, user_profiles(full_name, avatar_url))')?.eq('id', id)?.single();
    
    if (error) throw error;
    return data;
  },

  async join(collaborationId, userId) {
    const { data, error } = await supabase?.from('collaboration_members')?.insert({ collaboration_id: collaborationId, user_id: userId })?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  async leave(collaborationId, userId) {
    const { error } = await supabase?.from('collaboration_members')?.delete()?.eq('collaboration_id', collaborationId)?.eq('user_id', userId);
    
    if (error) throw error;
  }
};