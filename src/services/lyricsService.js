import { supabase } from '../lib/supabase';

/**
 * Service for managing user lyrics with Supabase
 */
export const lyricsService = {
  /**
   * Get all lyrics for the current user
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of lyrics
   */
  async getAll(options = {}) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase?.from('user_lyrics')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false });

      if (options?.status) {
        query = query?.eq('status', options?.status);
      }

      if (options?.limit) {
        query = query?.limit(options?.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(row => ({
        id: row?.id,
        userId: row?.user_id,
        title: row?.title,
        content: row?.content,
        genre: row?.genre,
        subject: row?.subject,
        tone: row?.tone,
        artistStyles: row?.artist_styles,
        section: row?.section,
        bars: row?.bars,
        status: row?.status,
        analysis: row?.analysis,
        metadata: row?.metadata,
        createdAt: row?.created_at,
        updatedAt: row?.updated_at
      }));
    } catch (error) {
      console.error('[Lyrics Service] Get all error:', error);
      throw error;
    }
  },

  /**
   * Get a single lyric by ID
   * @param {string} id - Lyric ID
   * @returns {Promise<Object>} Lyric object
   */
  async getById(id) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('user_lyrics')?.select('*')?.eq('id', id)?.eq('user_id', user?.id)?.single();

      if (error) throw error;

      return {
        id: data?.id,
        userId: data?.user_id,
        title: data?.title,
        content: data?.content,
        genre: data?.genre,
        subject: data?.subject,
        tone: data?.tone,
        artistStyles: data?.artist_styles,
        section: data?.section,
        bars: data?.bars,
        status: data?.status,
        analysis: data?.analysis,
        metadata: data?.metadata,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('[Lyrics Service] Get by ID error:', error);
      throw error;
    }
  },

  /**
   * Create a new lyric
   * @param {Object} lyricData - Lyric data
   * @returns {Promise<Object>} Created lyric
   */
  async create(lyricData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('user_lyrics')?.insert({
          user_id: user?.id,
          title: lyricData?.title,
          content: lyricData?.content,
          genre: lyricData?.genre,
          subject: lyricData?.subject,
          tone: lyricData?.tone,
          artist_styles: lyricData?.artistStyles,
          section: lyricData?.section,
          bars: lyricData?.bars,
          status: lyricData?.status || 'draft',
          analysis: lyricData?.analysis,
          metadata: lyricData?.metadata || {}
        })?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        userId: data?.user_id,
        title: data?.title,
        content: data?.content,
        genre: data?.genre,
        subject: data?.subject,
        tone: data?.tone,
        artistStyles: data?.artist_styles,
        section: data?.section,
        bars: data?.bars,
        status: data?.status,
        analysis: data?.analysis,
        metadata: data?.metadata,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('[Lyrics Service] Create error:', error);
      throw error;
    }
  },

  /**
   * Update an existing lyric
   * @param {string} id - Lyric ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated lyric
   */
  async update(id, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {};
      if (updates?.title !== undefined) updateData.title = updates?.title;
      if (updates?.content !== undefined) updateData.content = updates?.content;
      if (updates?.genre !== undefined) updateData.genre = updates?.genre;
      if (updates?.subject !== undefined) updateData.subject = updates?.subject;
      if (updates?.tone !== undefined) updateData.tone = updates?.tone;
      if (updates?.artistStyles !== undefined) updateData.artist_styles = updates?.artistStyles;
      if (updates?.section !== undefined) updateData.section = updates?.section;
      if (updates?.bars !== undefined) updateData.bars = updates?.bars;
      if (updates?.status !== undefined) updateData.status = updates?.status;
      if (updates?.analysis !== undefined) updateData.analysis = updates?.analysis;
      if (updates?.metadata !== undefined) updateData.metadata = updates?.metadata;

      const { data, error } = await supabase?.from('user_lyrics')?.update(updateData)?.eq('id', id)?.eq('user_id', user?.id)?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        userId: data?.user_id,
        title: data?.title,
        content: data?.content,
        genre: data?.genre,
        subject: data?.subject,
        tone: data?.tone,
        artistStyles: data?.artist_styles,
        section: data?.section,
        bars: data?.bars,
        status: data?.status,
        analysis: data?.analysis,
        metadata: data?.metadata,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('[Lyrics Service] Update error:', error);
      throw error;
    }
  },

  /**
   * Delete a lyric
   * @param {string} id - Lyric ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase?.from('user_lyrics')?.delete()?.eq('id', id)?.eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('[Lyrics Service] Delete error:', error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time changes for user lyrics
   * @param {Function} callback - Callback function for changes
   * @returns {Object} Subscription object
   */
  subscribeToChanges(callback) {
    const channel = supabase?.channel('user_lyrics_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_lyrics'
        },
        (payload) => {
          callback(payload);
        }
      )?.subscribe();

    return channel;
  },

  /**
   * Unsubscribe from real-time changes
   * @param {Object} channel - Channel object
   */
  unsubscribe(channel) {
    if (channel) {
      supabase?.removeChannel(channel);
    }
  }
};

/**
 * Service for managing generator history
 */
export const generatorHistoryService = {
  /**
   * Get generator history for the current user
   * @param {number} limit - Number of records to fetch
   * @returns {Promise<Array>} Array of history records
   */
  async getHistory(limit = 50) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('generator_history')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(row => ({
        id: row?.id,
        userId: row?.user_id,
        lyricsId: row?.lyrics_id,
        genre: row?.genre,
        subject: row?.subject,
        tone: row?.tone,
        artistStyles: row?.artist_styles,
        section: row?.section,
        bars: row?.bars,
        generationMethod: row?.generation_method,
        success: row?.success,
        errorMessage: row?.error_message,
        createdAt: row?.created_at
      }));
    } catch (error) {
      console.error('[Generator History Service] Get history error:', error);
      throw error;
    }
  },

  /**
   * Add a new history entry
   * @param {Object} historyData - History data
   * @returns {Promise<Object>} Created history entry
   */
  async addEntry(historyData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('generator_history')?.insert({
          user_id: user?.id,
          lyrics_id: historyData?.lyricsId,
          genre: historyData?.genre,
          subject: historyData?.subject,
          tone: historyData?.tone,
          artist_styles: historyData?.artistStyles,
          section: historyData?.section,
          bars: historyData?.bars,
          generation_method: historyData?.generationMethod || 'standard',
          success: historyData?.success !== false,
          error_message: historyData?.errorMessage
        })?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        userId: data?.user_id,
        lyricsId: data?.lyrics_id,
        genre: data?.genre,
        subject: data?.subject,
        tone: data?.tone,
        artistStyles: data?.artist_styles,
        section: data?.section,
        bars: data?.bars,
        generationMethod: data?.generation_method,
        success: data?.success,
        errorMessage: data?.error_message,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('[Generator History Service] Add entry error:', error);
      throw error;
    }
  }
};

/**
 * Service for managing user preferences
 */
export const userPreferencesService = {
  /**
   * Get user preferences
   * @returns {Promise<Object>} User preferences
   */
  async get() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('user_preferences')?.select('*')?.eq('user_id', user?.id)?.single();

      if (error) {
        // If preferences don't exist, return defaults
        if (error?.code === 'PGRST116') {
          return {
            defaultGenre: 'Hip-Hop',defaultTone: 'Confident',
            favoriteArtists: [],
            autoSaveEnabled: true,
            realTimeSyncEnabled: true,
            theme: 'dark',
            settings: {}
          };
        }
        throw error;
      }

      return {
        id: data?.id,
        userId: data?.user_id,
        defaultGenre: data?.default_genre,
        defaultTone: data?.default_tone,
        favoriteArtists: data?.favorite_artists,
        autoSaveEnabled: data?.auto_save_enabled,
        realTimeSyncEnabled: data?.real_time_sync_enabled,
        theme: data?.theme,
        settings: data?.settings,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('[User Preferences Service] Get error:', error);
      throw error;
    }
  },

  /**
   * Update user preferences
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated preferences
   */
  async update(updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {};
      if (updates?.defaultGenre !== undefined) updateData.default_genre = updates?.defaultGenre;
      if (updates?.defaultTone !== undefined) updateData.default_tone = updates?.defaultTone;
      if (updates?.favoriteArtists !== undefined) updateData.favorite_artists = updates?.favoriteArtists;
      if (updates?.autoSaveEnabled !== undefined) updateData.auto_save_enabled = updates?.autoSaveEnabled;
      if (updates?.realTimeSyncEnabled !== undefined) updateData.real_time_sync_enabled = updates?.realTimeSyncEnabled;
      if (updates?.theme !== undefined) updateData.theme = updates?.theme;
      if (updates?.settings !== undefined) updateData.settings = updates?.settings;

      const { data, error } = await supabase?.from('user_preferences')?.update(updateData)?.eq('user_id', user?.id)?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        userId: data?.user_id,
        defaultGenre: data?.default_genre,
        defaultTone: data?.default_tone,
        favoriteArtists: data?.favorite_artists,
        autoSaveEnabled: data?.auto_save_enabled,
        realTimeSyncEnabled: data?.real_time_sync_enabled,
        theme: data?.theme,
        settings: data?.settings,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('[User Preferences Service] Update error:', error);
      throw error;
    }
  }
};