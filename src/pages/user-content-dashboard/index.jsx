import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import WorkspaceFloatingButton from '../../components/navigation/WorkspaceFloatingButton';
import ToolContextBreadcrumb from '../../components/navigation/ToolContextBreadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { lyricsService } from '../../services/lyricsService';
import { createLearningPresets } from '../../services/presetService';
import SavedLyricsSection from './components/SavedLyricsSection';
import ChordProgressionsSection from './components/ChordProgressionsSection';
import PresetCollectionsSection from './components/PresetCollectionsSection';
import ActivityFeedSidebar from './components/ActivityFeedSidebar';
import StatisticsPanel from './components/StatisticsPanel';
import SearchFilterBar from './components/SearchFilterBar';
import Icon from '../../components/AppIcon';

const UserContentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lyrics, setLyrics] = useState([]);
  const [presets, setPresets] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [statistics, setStatistics] = useState({
    totalLyrics: 0,
    totalChords: 0,
    totalPresets: 0,
    creativeStreak: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTag, setFilterTag] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [lyricsData] = await Promise.all([
        lyricsService?.getAll()
      ]);
      
      setLyrics(lyricsData || []);
      
      const learningPresets = createLearningPresets();
      setPresets(learningPresets);
      
      const activity = generateRecentActivity(lyricsData, learningPresets);
      setRecentActivity(activity);
      
      setStatistics({
        totalLyrics: lyricsData?.length || 0,
        totalChords: learningPresets?.length || 0,
        totalPresets: learningPresets?.length || 0,
        creativeStreak: calculateStreak(lyricsData)
      });
    } catch (error) {
      console.error('[Dashboard] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (lyricsData, presetsData) => {
    const activities = [];
    
    lyricsData?.slice(0, 5)?.forEach(lyric => {
      activities?.push({
        id: `lyric-${lyric?.id}`,
        type: 'lyric',
        title: `Created "${lyric?.title}"`,
        description: `${lyric?.genre} • ${lyric?.section}`,
        timestamp: new Date(lyric?.createdAt)
      });
    });
    
    presetsData?.slice(0, 3)?.forEach((preset, idx) => {
      activities?.push({
        id: `preset-${idx}`,
        type: 'chord',
        title: `Explored ${preset?.name}`,
        description: `${preset?.progression?.join(' → ')}`,
        timestamp: new Date(Date.now() - (idx + 1) * 3600000)
      });
    });
    
    return activities?.sort((a, b) => b?.timestamp - a?.timestamp)?.slice(0, 10);
  };

  const calculateStreak = (lyricsData) => {
    if (!lyricsData || lyricsData?.length === 0) return 0;
    
    const sortedDates = lyricsData
      ?.map(l => new Date(l?.createdAt)?.toDateString())
      ?.filter((date, idx, arr) => arr?.indexOf(date) === idx)
      ?.sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date()?.toDateString();
    
    for (let i = 0; i < sortedDates?.length; i++) {
      const expectedDate = new Date();
      expectedDate?.setDate(expectedDate?.getDate() - i);
      
      if (sortedDates?.[i] === expectedDate?.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (type, tag) => {
    setFilterType(type);
    setFilterTag(tag);
  };

  const filteredLyrics = lyrics?.filter(lyric => {
    const matchesSearch = !searchQuery || 
      lyric?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      lyric?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      lyric?.genre?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    
    const matchesType = filterType === 'all' || filterType === 'lyrics';
    const matchesTag = !filterTag || lyric?.genre?.toLowerCase() === filterTag?.toLowerCase();
    
    return matchesSearch && matchesType && matchesTag;
  });

  const filteredPresets = presets?.filter(preset => {
    const matchesSearch = !searchQuery || 
      preset?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      preset?.key?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      preset?.mood?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    
    const matchesType = filterType === 'all' || filterType === 'chords';
    const matchesTag = !filterTag || preset?.mood?.toLowerCase() === filterTag?.toLowerCase();
    
    return matchesSearch && matchesType && matchesTag;
  });

  const handleLogout = async () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        <HeaderNavigation
          isAuthenticated={isAuthenticated}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />
        <ToolContextBreadcrumb />
        <WorkspaceFloatingButton />
        <main className="main-content bg-background">
          <div className="content-container">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Icon name="Loader2" size={48} className="mx-auto mb-4 text-primary animate-spin" />
                <p className="text-muted-foreground">Loading your creative content...</p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <HeaderNavigation
        isAuthenticated={isAuthenticated}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
      <ToolContextBreadcrumb />
      <WorkspaceFloatingButton />
      <main className="main-content bg-background">
        <div className="content-container">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary p-2.5 flex items-center justify-center">
                <Icon name="FolderOpen" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Content Dashboard</h1>
                <p className="text-muted-foreground">Organize and manage all your creative work</p>
              </div>
            </div>
          </div>

          <SearchFilterBar
            searchQuery={searchQuery}
            filterType={filterType}
            filterTag={filterTag}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3 space-y-6">
              <SavedLyricsSection lyrics={filteredLyrics} onRefresh={loadDashboardData} />
              <ChordProgressionsSection presets={filteredPresets} />
              <PresetCollectionsSection presets={filteredPresets} />
            </div>

            <div className="space-y-6">
              <StatisticsPanel statistics={statistics} />
              <ActivityFeedSidebar activities={recentActivity} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UserContentDashboard;