import React, { useState, useEffect } from 'react';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import WorkspaceFloatingButton from '../../components/navigation/WorkspaceFloatingButton';
import ToolContextBreadcrumb from '../../components/navigation/ToolContextBreadcrumb';
import WelcomeBanner from './components/WelcomeBanner';
import GeneratorCard from './components/GeneratorCard';
import NotepadWidget from './components/NotepadWidget';
import RecentActivityCard from './components/RecentActivityCard';
import ProgressTracker from './components/ProgressTracker';
import SavedConceptsCard from './components/SavedConceptsCard';
import SavedLyricsCard from './components/SavedLyricsCard';
import AuthenticationModal from '../../components/navigation/AuthenticationModal';
import WorkflowProgressTracker from './components/WorkflowProgressTracker';
import Icon from '../../components/AppIcon';


const CreativeDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userName, setUserName] = useState('Creative');

  useEffect(() => {
    const authStatus = localStorage.getItem('creative_auth_status');
    const savedUserName = localStorage.getItem('creative_user_name');
    
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      if (savedUserName) {
        setUserName(savedUserName);
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUserName(userData?.name || 'Creative');
    localStorage.setItem('creative_auth_status', 'authenticated');
    localStorage.setItem('creative_user_name', userData?.name || 'Creative');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('Creative');
    localStorage.removeItem('creative_auth_status');
    localStorage.removeItem('creative_user_name');
  };

  const generators = [
    {
      id: 'concept-explorer',
      title: 'Concept Explorer',
      description: 'Generate word webs and explore creative connections from seed words using AI-powered semantic mapping.',
      icon: 'Lightbulb',
      color: 'indigo',
      route: '/concept-explorer',
      isComingSoon: false
    },
    {
      id: 'lingo-remixer',
      title: 'Lingo Perception Remixer',
      description: 'Transform classic quotes into modern slang and contemporary language styles with cultural context.',
      icon: 'MessageSquare',
      color: 'purple',
      route: null,
      isComingSoon: true
    },
    {
      id: 'mood-generator',
      title: 'Mood & Vibe Generator',
      description: 'Create unique mood names, color palettes, and visual imagery from theme descriptions and emotions.',
      icon: 'Palette',
      color: 'teal',
      route: null,
      isComingSoon: true
    },
    {
      id: 'lyrical-prompt',
      title: 'Lyrical Prompt Machine',
      description: 'Generate creative writing prompts and lyrical themes tailored to your musical style and genre.',
      icon: 'Music',
      color: 'rose',
      route: '/lyrical-prompt-machine',
      isComingSoon: false
    },
    {
      id: 'wordplay-trainer',
      title: 'Interactive Wordplay Trainer',
      description: 'Practice metaphors, similes, and rhyming couplets with interactive exercises and instant feedback.',
      icon: 'Zap',
      color: 'cyan',
      route: null,
      isComingSoon: true
    },
    {
      id: 'beat-architect',
      title: 'Beat Blueprint Architect',
      description: 'Generate music theory-based beat recipes with BPM, key signatures, and production notes.',
      icon: 'Radio',
      color: 'amber',
      route: null,
      isComingSoon: true
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'concept',
      title: 'Explored "Urban Dreams"',
      description: 'Generated 15 related concepts and word associations',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: 2,
      type: 'lyric',
      title: 'Created Lyrical Prompt',
      description: 'Hip-hop theme: "Street wisdom meets digital age"',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: 3,
      type: 'wordplay',
      title: 'Completed Metaphor Exercise',
      description: 'Scored 8/10 on advanced metaphor challenges',
      timestamp: new Date(Date.now() - 86400000)
    }
  ];

  const trainingProgress = [
    {
      id: 1,
      name: 'Metaphor Mastery',
      icon: 'Sparkles',
      completed: 24,
      total: 30,
      achievements: ['Quick Learner']
    },
    {
      id: 2,
      name: 'Simile Skills',
      icon: 'TrendingUp',
      completed: 18,
      total: 30,
      achievements: []
    },
    {
      id: 3,
      name: 'Rhyming Couplets',
      icon: 'Music',
      completed: 12,
      total: 25,
      achievements: []
    }
  ];

  const savedConcepts = [
    {
      id: 1,
      type: 'concept',
      title: 'Midnight Reflections',
      content: 'A concept exploring the intersection of solitude, urban landscapes, and introspective thought patterns during late-night creative sessions.',
      savedAt: new Date(Date.now() - 172800000)
    },
    {
      id: 2,
      type: 'lyric',
      title: 'Digital Nomad Anthem',
      content: 'Write about the freedom and isolation of modern remote work culture, blending technology metaphors with traditional journey narratives.',
      savedAt: new Date(Date.now() - 259200000)
    },
    {
      id: 3,
      type: 'mood',
      title: 'Neon Nostalgia',
      content: 'A mood combining retro 80s aesthetics with futuristic cyberpunk elements, evoking both comfort and excitement.',
      savedAt: new Date(Date.now() - 432000000)
    }
  ];

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
          <WelcomeBanner userName={userName} />

          <div className="space-y-8">
            {/* Workflow Progress Tracker */}
            <WorkflowProgressTracker />

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Icon name="Sparkles" size={28} className="text-primary" />
                BlackTop AI Districts
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <GeneratorCard />
              </div>
            </div>

            <div className="space-y-6">
              <NotepadWidget />
              <RecentActivityCard activities={recentActivities} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProgressTracker exercises={trainingProgress} />
              <SavedLyricsCard />
              <SavedConceptsCard concepts={savedConcepts} />
            </div>
          </div>
        </div>
      </main>
      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default CreativeDashboard;