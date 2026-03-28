import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import ToolContextBreadcrumb from '../../components/navigation/ToolContextBreadcrumb';
import WorkspaceFloatingButton from '../../components/navigation/WorkspaceFloatingButton';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ThemeSelector from './components/ThemeSelector';
import GenreSelector from './components/GenreSelector';
import EmotionalIntensityControl from './components/EmotionalIntensityControl';
import PromptTypeSelector from './components/PromptTypeSelector';
import PromptCard from './components/PromptCard';
import PromptFilters from './components/PromptFilters';
import PromptHistory from './components/PromptHistory';

const LyricalPromptMachine = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [intensity, setIntensity] = useState(2);
  const [selectedTypes, setSelectedTypes] = useState(['story-starter']);
  const [prompts, setPrompts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState({
    mood: 'all',
    complexity: 'all',
    sort: 'recent',
  });

  const mockPrompts = [
    {
      id: 1,
      title: "The Last Train Home",
      content: "Write about a character who misses the last train home and encounters someone from their past at the empty station. Explore the emotions of regret, nostalgia, and unexpected connection.",
      difficulty: "intermediate",
      estimatedTime: 15,
      challengeLevel: 3,
      context: "This prompt works well for introspective hip-hop or R&B tracks focusing on personal growth and reflection.",
      suggestedApproach: "Start with the physical setting of the empty station, then transition into internal dialogue as memories surface. Use the train as a metaphor for missed opportunities.",
      constraints: ["Use at least 3 metaphors", "Include dialogue", "End with a resolution"],
      isFavorite: false,
      isCompleted: false,
      type: "story-starter",
      mood: "melancholic",
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      title: "Crown of Thorns",
      content: "Create a narrative about someone who achieves success but realizes the cost was their authenticity. Explore the internal conflict between public persona and private truth.",
      difficulty: "advanced",
      estimatedTime: 25,
      challengeLevel: 5,
      context: "Perfect for conscious rap or introspective pop exploring themes of fame, identity, and self-betrayal.",
      suggestedApproach: "Contrast the external celebration with internal emptiness. Use imagery of masks, mirrors, and crowns to symbolize the duality.",
      constraints: ["Minimum 16 bars", "Include a perspective shift", "Use extended metaphor"],
      isFavorite: true,
      isCompleted: false,
      type: "conflict",
      mood: "aggressive",
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: 3,
      title: "Neon Dreams",
      content: "Describe a character chasing their dreams in a city that never sleeps. Focus on the contrast between ambition and loneliness, bright lights and dark moments.",
      difficulty: "beginner",
      estimatedTime: 10,
      challengeLevel: 2,
      context: "Great for upbeat pop or electronic tracks with urban themes and aspirational messaging.",
      suggestedApproach: "Use vivid sensory details of the city at night. Balance optimism with realistic struggles. Create a hook around the \'neon dreams\' concept.",
      constraints: ["Include city imagery", "Use present tense", "Create a memorable hook"],
      isFavorite: false,
      isCompleted: true,
      type: "character",
      mood: "uplifting",
      timestamp: new Date(Date.now() - 10800000)
    },
    {
      id: 4,
      title: "Echoes in Silence",
      content: "Write about the space between words in a relationship that\'s falling apart. Explore what\'s left unsaid and the weight of silence.",
      difficulty: "intermediate",
      estimatedTime: 20,
      challengeLevel: 4,
      context: "Ideal for emotional ballads or acoustic tracks focusing on relationship dynamics and communication breakdown.",
      suggestedApproach: "Focus on subtle moments and gestures. Use silence as an active element in the narrative. Build tension through what\'s not said.",
      constraints: ["Avoid direct confrontation", "Use subtle imagery", "Include a turning point"],
      isFavorite: true,
      isCompleted: false,
      type: "abstract",
      mood: "melancholic",
      timestamp: new Date(Date.now() - 14400000)
    },
    {
      id: 5,
      title: "Phoenix Rising",
      content: "Tell the story of rebuilding after complete destruction. Focus on the transformation process and finding strength in vulnerability.",
      difficulty: "intermediate",
      estimatedTime: 18,
      challengeLevel: 3,
      context: "Perfect for motivational hip-hop or rock tracks about overcoming adversity and personal transformation.",
      suggestedApproach: "Structure the narrative in three acts: destruction, struggle, and rebirth. Use fire and phoenix imagery throughout.",
      constraints: ["Show progression", "Include a moment of doubt", "End with empowerment"],
      isFavorite: false,
      isCompleted: false,
      type: "story-starter",
      mood: "uplifting",
      timestamp: new Date(Date.now() - 18000000)
    },
    {
      id: 6,
      title: "Midnight Confessions",
      content: "Create a scene where someone reveals their deepest secret to a stranger at 3 AM. Explore vulnerability, trust, and the freedom of anonymity.",
      difficulty: "beginner",
      estimatedTime: 12,
      challengeLevel: 2,
      context: "Works well for intimate R&B or indie tracks focusing on human connection and emotional honesty.",
      suggestedApproach: "Set the scene with atmospheric details. Build intimacy through dialogue. Focus on the emotional release of confession.",
      constraints: ["Use dialogue", "Create atmosphere", "Include a revelation"],
      isFavorite: false,
      isCompleted: false,
      type: "character",
      mood: "mysterious",
      timestamp: new Date(Date.now() - 21600000)
    }
  ];

  const stats = {
    totalPrompts: 24,
    completed: 8,
    favorites: 5,
    avgTime: 16,
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleThemeToggle = (themeId) => {
    setSelectedThemes((prev) =>
      prev?.includes(themeId)
        ? prev?.filter((id) => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleTypeToggle = (typeId, checked) => {
    setSelectedTypes((prev) =>
      checked ? [...prev, typeId] : prev?.filter((id) => id !== typeId)
    );
  };

  const handleGenerate = () => {
    if (selectedThemes?.length === 0 || !selectedGenre || selectedTypes?.length === 0) {
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setPrompts(mockPrompts);
      setIsGenerating(false);
    }, 2000);
  };

  const handleFavorite = (promptId) => {
    setPrompts((prev) =>
      prev?.map((prompt) =>
        prompt?.id === promptId
          ? { ...prompt, isFavorite: !prompt?.isFavorite }
          : prompt
      )
    );
  };

  const handleComplete = (promptId) => {
    setPrompts((prev) =>
      prev?.map((prompt) =>
        prompt?.id === promptId
          ? { ...prompt, isCompleted: !prompt?.isCompleted }
          : prompt
      )
    );
  };

  const handleCopyToWorkspace = (prompt) => {
    localStorage.setItem('workspaceContent', prompt?.content);
    navigate('/writing-workspace');
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      mood: 'all',
      complexity: 'all',
      sort: 'recent',
    });
  };

  const handleClearAll = () => {
    setSelectedThemes([]);
    setSelectedGenre('');
    setIntensity(2);
    setSelectedTypes(['story-starter']);
    setPrompts([]);
  };

  const filteredPrompts = prompts?.filter((prompt) => {
    if (filters?.mood !== 'all' && prompt?.mood !== filters?.mood) return false;
    if (filters?.complexity !== 'all' && prompt?.difficulty !== filters?.complexity) return false;
    return true;
  });

  const sortedPrompts = [...filteredPrompts]?.sort((a, b) => {
    switch (filters?.sort) {
      case 'difficulty-asc':
        return a?.challengeLevel - b?.challengeLevel;
      case 'difficulty-desc':
        return b?.challengeLevel - a?.challengeLevel;
      case 'time-asc':
        return a?.estimatedTime - b?.estimatedTime;
      case 'time-desc':
        return b?.estimatedTime - a?.estimatedTime;
      default:
        return b?.timestamp - a?.timestamp;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation
        isAuthenticated={isAuthenticated}
        onAuthClick={() => navigate('/login')}
        onLogout={() => {
          localStorage.removeItem('isAuthenticated');
          setIsAuthenticated(false);
          navigate('/login');
        }}
      />
      <ToolContextBreadcrumb />
      <WorkspaceFloatingButton />
      <main className="main-content">
        <div className="content-container">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-generator-purple to-generator-indigo p-2.5 flex items-center justify-center">
                <Icon name="Music" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Lyrical Prompt Machine</h1>
                <p className="text-muted-foreground">
                  Generate targeted writing prompts and creative challenges
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Icon name="Settings" size={20} />
                    Prompt Configuration
                  </h2>
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded px-2 py-1"
                  >
                    Clear All
                  </button>
                </div>

                <ThemeSelector
                  selectedThemes={selectedThemes}
                  onThemeToggle={handleThemeToggle}
                />

                <GenreSelector
                  selectedGenre={selectedGenre}
                  onGenreChange={setSelectedGenre}
                />

                <EmotionalIntensityControl
                  intensity={intensity}
                  onIntensityChange={setIntensity}
                />

                <PromptTypeSelector
                  selectedTypes={selectedTypes}
                  onTypeToggle={handleTypeToggle}
                />

                <Button
                  variant="default"
                  size="lg"
                  fullWidth
                  loading={isGenerating}
                  iconName="Sparkles"
                  iconPosition="left"
                  onClick={handleGenerate}
                  disabled={selectedThemes?.length === 0 || !selectedGenre || selectedTypes?.length === 0}
                >
                  {isGenerating ? 'Generating Prompts...' : 'Generate Prompts'}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <PromptHistory stats={stats} />
            </div>
          </div>

          {prompts?.length > 0 && (
            <div className="space-y-6">
              <PromptFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Generated Prompts ({sortedPrompts?.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedPrompts?.map((prompt) => (
                  <PromptCard
                    key={prompt?.id}
                    prompt={prompt}
                    onFavorite={handleFavorite}
                    onComplete={handleComplete}
                    onCopyToWorkspace={handleCopyToWorkspace}
                  />
                ))}
              </div>
            </div>
          )}

          {prompts?.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Prompts Generated Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Configure your preferences above and click "Generate Prompts" to get started
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LyricalPromptMachine;