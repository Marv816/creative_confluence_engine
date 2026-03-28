import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import WorkspaceFloatingButton from '../../components/navigation/WorkspaceFloatingButton';
import { useAuth } from '../../contexts/AuthContext';
import { marketplaceService } from '../../services/marketplaceService';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProducerHeader from './components/ProducerHeader';
import SoundCatalog from './components/SoundCatalog';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ReviewsSection from './components/ReviewsSection';
import CollaborationPanel from './components/CollaborationPanel';

const ProducerProfileAnalytics = () => {
  const { producerId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [producer, setProducer] = useState(null);
  const [sounds, setSounds] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadProducerData();
  }, [producerId]);

  const loadProducerData = async () => {
    try {
      setLoading(true);
      const [producerData, soundsData, reviewsData] = await Promise.all([
        marketplaceService?.getProducerProfile(producerId),
        marketplaceService?.getProducerSounds(producerId),
        marketplaceService?.getReviews(producerId)
      ]);

      setProducer(producerData);
      setSounds(soundsData);
      setReviews(reviewsData);

      if (isAuthenticated) {
        const following = await marketplaceService?.isFollowing(producerId);
        setIsFollowing(following);

        const analyticsData = await marketplaceService?.getProducerAnalytics(producerId, 30);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Load producer data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      const result = await marketplaceService?.toggleFollow(producerId);
      setIsFollowing(result?.following);
      setProducer(prev => ({
        ...prev,
        followersCount: prev?.followersCount + (result?.following ? 1 : -1)
      }));
    } catch (error) {
      console.error('Follow toggle error:', error);
    }
  };

  const tabs = [
    { id: 'catalog', label: 'Sound Catalog', icon: 'Music' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' },
    { id: 'reviews', label: 'Reviews', icon: 'Star' },
    { id: 'collaborate', label: 'Collaborate', icon: 'Users' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <HeaderNavigation
          isAuthenticated={isAuthenticated}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={() => {}}
        />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading producer profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <HeaderNavigation
          isAuthenticated={isAuthenticated}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={() => {}}
        />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Producer Not Found</h2>
            <p className="text-muted-foreground mb-6">The producer profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/community-sound-marketplace')}>Back to Marketplace</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <HeaderNavigation
        isAuthenticated={isAuthenticated}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={() => {}}
      />
      <WorkspaceFloatingButton />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ProducerHeader
          producer={producer}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
        />

        <div className="mt-8">
          <div className="glass-card p-2 mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs?.map(tab => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span className="hidden sm:inline">{tab?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'catalog' && (
            <SoundCatalog sounds={sounds} producer={producer} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              analytics={analytics}
              producer={producer}
              isOwner={user?.id === producer?.userId}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsSection
              reviews={reviews}
              producer={producer}
              onReviewAdded={loadProducerData}
            />
          )}

          {activeTab === 'collaborate' && (
            <CollaborationPanel
              producer={producer}
              isAuthenticated={isAuthenticated}
              onAuthRequired={() => setShowAuthModal(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProducerProfileAnalytics;