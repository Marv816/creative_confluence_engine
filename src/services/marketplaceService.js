import { supabase } from '../lib/supabase';

/**
 * Community Sound Marketplace Service
 * Handles producer profiles, sounds, purchases, reviews, and analytics
 */

export const marketplaceService = {
  // ============================================================================
  // PRODUCER PROFILES
  // ============================================================================

  async getProducerProfile(producerId) {
    try {
      const { data, error } = await supabase?.from('producer_profiles')?.select(`
          *,
          user:user_profiles!producer_profiles_user_id_fkey(id, full_name, email, avatar_url)
        `)?.eq('id', producerId)?.single();

      if (error) throw error;

      return {
        id: data?.id,
        userId: data?.user_id,
        stageName: data?.stage_name,
        bio: data?.bio,
        bannerUrl: data?.banner_url,
        location: data?.location,
        socialLinks: data?.social_links,
        totalSales: data?.total_sales,
        totalRevenue: data?.total_revenue,
        rating: data?.rating,
        totalReviews: data?.total_reviews,
        followersCount: data?.followers_count,
        soundsCount: data?.sounds_count,
        isVerified: data?.is_verified,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        user: data?.user
      };
    } catch (error) {
      console.error('[Marketplace] Get producer profile error:', error);
      throw error;
    }
  },

  async createProducerProfile(profileData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('producer_profiles')?.insert({
          user_id: user?.id,
          stage_name: profileData?.stageName,
          bio: profileData?.bio,
          banner_url: profileData?.bannerUrl,
          location: profileData?.location,
          social_links: profileData?.socialLinks || {}
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Marketplace] Create producer profile error:', error);
      throw error;
    }
  },

  async updateProducerProfile(producerId, updates) {
    try {
      const { data, error } = await supabase?.from('producer_profiles')?.update({
          stage_name: updates?.stageName,
          bio: updates?.bio,
          banner_url: updates?.bannerUrl,
          location: updates?.location,
          social_links: updates?.socialLinks,
          updated_at: new Date()?.toISOString()
        })?.eq('id', producerId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Marketplace] Update producer profile error:', error);
      throw error;
    }
  },

  // ============================================================================
  // MARKETPLACE SOUNDS
  // ============================================================================

  async getSounds(filters = {}) {
    try {
      let query = supabase?.from('marketplace_sounds')?.select(`
          *,
          producer:producer_profiles(*),
          licenses:sound_licenses(*)
        `)?.eq('is_active', true);

      if (filters?.genre) query = query?.eq('genre', filters?.genre);
      if (filters?.soundType) query = query?.eq('sound_type', filters?.soundType);
      if (filters?.minBpm) query = query?.gte('bpm', filters?.minBpm);
      if (filters?.maxBpm) query = query?.lte('bpm', filters?.maxBpm);
      if (filters?.key) query = query?.eq('key', filters?.key);
      if (filters?.isFeatured) query = query?.eq('is_featured', true);
      if (filters?.search) query = query?.ilike('title', `%${filters?.search}%`);

      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder === 'asc';
      query = query?.order(sortBy, { ascending: sortOrder });

      if (filters?.limit) query = query?.limit(filters?.limit);

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(sound => ({
        id: sound?.id,
        producerId: sound?.producer_id,
        title: sound?.title,
        description: sound?.description,
        soundType: sound?.sound_type,
        genre: sound?.genre,
        bpm: sound?.bpm,
        key: sound?.key,
        audioUrl: sound?.audio_url,
        coverImageUrl: sound?.cover_image_url,
        waveformData: sound?.waveform_data,
        tags: sound?.tags,
        isFeatured: sound?.is_featured,
        isActive: sound?.is_active,
        playsCount: sound?.plays_count,
        downloadsCount: sound?.downloads_count,
        likesCount: sound?.likes_count,
        createdAt: sound?.created_at,
        updatedAt: sound?.updated_at,
        producer: sound?.producer,
        licenses: sound?.licenses
      })) || [];
    } catch (error) {
      console.error('[Marketplace] Get sounds error:', error);
      throw error;
    }
  },

  async getProducerSounds(producerId) {
    try {
      const { data, error } = await supabase?.from('marketplace_sounds')?.select(`
          *,
          licenses:sound_licenses(*)
        `)?.eq('producer_id', producerId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Marketplace] Get producer sounds error:', error);
      throw error;
    }
  },

  async createSound(soundData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get producer profile
      const { data: profile } = await supabase?.from('producer_profiles')?.select('id')?.eq('user_id', user?.id)?.single();

      if (!profile) throw new Error('Producer profile not found');

      const { data, error } = await supabase?.from('marketplace_sounds')?.insert({
          producer_id: profile?.id,
          title: soundData?.title,
          description: soundData?.description,
          sound_type: soundData?.soundType,
          genre: soundData?.genre,
          bpm: soundData?.bpm,
          key: soundData?.key,
          audio_url: soundData?.audioUrl,
          cover_image_url: soundData?.coverImageUrl,
          tags: soundData?.tags
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Marketplace] Create sound error:', error);
      throw error;
    }
  },

  async incrementPlayCount(soundId) {
    try {
      const { error } = await supabase?.rpc('increment', {
        table_name: 'marketplace_sounds',
        row_id: soundId,
        column_name: 'plays_count'
      });

      if (error) {
        // Fallback if RPC doesn't exist
        const { data: sound } = await supabase?.from('marketplace_sounds')?.select('plays_count')?.eq('id', soundId)?.single();

        if (sound) {
          await supabase?.from('marketplace_sounds')?.update({ plays_count: (sound?.plays_count || 0) + 1 })?.eq('id', soundId);
        }
      }
    } catch (error) {
      console.error('[Marketplace] Increment play count error:', error);
    }
  },

  // ============================================================================
  // LICENSES
  // ============================================================================

  async getLicenses(soundId) {
    try {
      const { data, error } = await supabase
        ?.from('marketplace_licenses')
        ?.select('*')
        ?.eq('sound_id', soundId)
        ?.eq('is_available', true)
        ?.order('price', { ascending: true });

      if (error) throw error;

      return data?.map(license => ({
        id: license?.id,
        soundId: license?.sound_id,
        licenseType: license?.license_type,
        price: parseFloat(license?.price || 0),
        revenueSharePercentage: parseFloat(license?.revenue_share_percentage || 0),
        usageTerms: license?.usage_terms,
        distributionLimit: license?.distribution_limit,
        streamingLimit: license?.streaming_limit,
        allowsRadio: license?.allows_radio,
        allowsMusicVideo: license?.allows_music_video,
        allowsProfitPerformances: license?.allows_profit_performances,
        contractDurationDays: license?.contract_duration_days,
        isAvailable: license?.is_available,
        createdAt: license?.created_at,
        updatedAt: license?.updated_at
      })) || [];
    } catch (error) {
      console.error('[Marketplace] Get licenses error:', error);
      throw error;
    }
  },

  // ============================================================================
  // LIKES
  // ============================================================================

  async toggleLike(soundId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already liked
      const { data: existing } = await supabase?.from('sound_likes')?.select('id')?.eq('sound_id', soundId)?.eq('user_id', user?.id)?.single();

      if (existing) {
        // Unlike
        const { error } = await supabase?.from('sound_likes')?.delete()?.eq('id', existing?.id);

        if (error) throw error;
        return { liked: false };
      } else {
        // Like
        const { error } = await supabase?.from('sound_likes')?.insert({ sound_id: soundId, user_id: user?.id });

        if (error) throw error;
        return { liked: true };
      }
    } catch (error) {
      console.error('[Marketplace] Toggle like error:', error);
      throw error;
    }
  },

  async getUserLikes() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return [];

      const { data, error } = await supabase?.from('sound_likes')?.select('sound_id')?.eq('user_id', user?.id);

      if (error) throw error;
      return data?.map(like => like?.sound_id) || [];
    } catch (error) {
      console.error('[Marketplace] Get user likes error:', error);
      return [];
    }
  },

  // ============================================================================
  // FOLLOWERS
  // ============================================================================

  async toggleFollow(producerId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase?.from('producer_followers')?.select('id')?.eq('producer_id', producerId)?.eq('follower_id', user?.id)?.single();

      if (existing) {
        const { error } = await supabase?.from('producer_followers')?.delete()?.eq('id', existing?.id);

        if (error) throw error;
        return { following: false };
      } else {
        const { error } = await supabase?.from('producer_followers')?.insert({ producer_id: producerId, follower_id: user?.id });

        if (error) throw error;
        return { following: true };
      }
    } catch (error) {
      console.error('[Marketplace] Toggle follow error:', error);
      throw error;
    }
  },

  async isFollowing(producerId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return false;

      const { data } = await supabase?.from('producer_followers')?.select('id')?.eq('producer_id', producerId)?.eq('follower_id', user?.id)?.single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  // ============================================================================
  // REVIEWS
  // ============================================================================

  async getReviews(producerId) {
    try {
      const { data, error } = await supabase?.from('sound_reviews')?.select(`
          *,
          reviewer:user_profiles!sound_reviews_reviewer_id_fkey(full_name, avatar_url),
          sound:marketplace_sounds(title)
        `)?.eq('producer_id', producerId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Marketplace] Get reviews error:', error);
      throw error;
    }
  },

  async createReview(reviewData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('sound_reviews')?.insert({
          sound_id: reviewData?.soundId,
          producer_id: reviewData?.producerId,
          reviewer_id: user?.id,
          purchase_id: reviewData?.purchaseId,
          rating: reviewData?.rating,
          review_text: reviewData?.reviewText,
          is_verified_purchase: !!reviewData?.purchaseId
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Marketplace] Create review error:', error);
      throw error;
    }
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getProducerAnalytics(producerId, days = 30) {
    try {
      const startDate = new Date();
      startDate?.setDate(startDate?.getDate() - days);

      const { data, error } = await supabase?.from('producer_analytics')?.select('*')?.eq('producer_id', producerId)?.gte('date', startDate?.toISOString()?.split('T')?.[0])?.order('date', { ascending: true });

      if (error) throw error;

      return data?.map(item => ({
        date: item?.date,
        plays: item?.plays,
        downloads: item?.downloads,
        sales: item?.sales,
        revenue: item?.revenue,
        newFollowers: item?.new_followers,
        metadata: item?.metadata
      })) || [];
    } catch (error) {
      console.error('[Marketplace] Get analytics error:', error);
      throw error;
    }
  },

  async getAnalyticsSummary(producerId) {
    try {
      const analytics = await this.getProducerAnalytics(producerId, 30);

      const summary = analytics?.reduce(
        (acc, day) => ({
          totalPlays: acc?.totalPlays + (day?.plays || 0),
          totalDownloads: acc?.totalDownloads + (day?.downloads || 0),
          totalSales: acc?.totalSales + (day?.sales || 0),
          totalRevenue: acc?.totalRevenue + parseFloat(day?.revenue || 0),
          totalNewFollowers: acc?.totalNewFollowers + (day?.newFollowers || 0)
        }),
        {
          totalPlays: 0,
          totalDownloads: 0,
          totalSales: 0,
          totalRevenue: 0,
          totalNewFollowers: 0
        }
      );

      return summary;
    } catch (error) {
      console.error('[Marketplace] Get analytics summary error:', error);
      throw error;
    }
  },

  // ============================================================================
  // COLLABORATION REQUESTS
  // ============================================================================

  async createCollaborationRequest(producerId, message, revenueSplit) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('collaboration_requests')?.insert({
          requester_id: user?.id,
          producer_id: producerId,
          message,
          revenue_split: revenueSplit
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Marketplace] Create collaboration request error:', error);
      throw error;
    }
  },

  async getCollaborationRequests(producerId) {
    try {
      const { data, error } = await supabase?.from('collaboration_requests')?.select(`
          *,
          requester:user_profiles!collaboration_requests_requester_id_fkey(full_name, email, avatar_url)
        `)?.eq('producer_id', producerId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Marketplace] Get collaboration requests error:', error);
      throw error;
    }
  }
};

export default marketplaceService;
function marketplacePurchasesService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: marketplacePurchasesService is not implemented yet.', args);
  return null;
}

export { marketplacePurchasesService };
function marketplaceSoundsService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: marketplaceSoundsService is not implemented yet.', args);
  return null;
}

export { marketplaceSoundsService };
function producerProfilesService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: producerProfilesService is not implemented yet.', args);
  return null;
}

export { producerProfilesService };
function marketplaceLicensesService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: marketplaceLicensesService is not implemented yet.', args);
  return null;
}

export { marketplaceLicensesService };
function marketplaceStorageService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: marketplaceStorageService is not implemented yet.', args);
  return null;
}

export { marketplaceStorageService };