import React, { useState, useEffect } from 'react';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import ToolContextBreadcrumb from '../../components/navigation/ToolContextBreadcrumb';
import WorkspaceFloatingButton from '../../components/navigation/WorkspaceFloatingButton';
import AuthenticationModal from '../../components/navigation/AuthenticationModal';
import SeedWordInput from './components/SeedWordInput';
import AdvancedOptions from './components/AdvancedOptions';
import WordWebVisualization from './components/WordWebVisualization';
import WordList from './components/WordList';
import EmptyState from './components/EmptyState';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ConceptExplorer = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [seedWord, setSeedWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedData, setGeneratedData] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [advancedOptions, setAdvancedOptions] = useState({
    associationStrength: 70,
    outputQuantity: 25,
    categories: ['synonyms', 'related', 'metaphors', 'emotions']
  });

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const mockWordConnections = [
    {
      word: "liberation",
      strength: 92,
      category: "synonyms",
      partOfSpeech: "noun",
      contextExample: "The liberation of creative expression through music brings profound joy and fulfillment to artists worldwide."
    },
    {
      word: "independence",
      strength: 88,
      category: "synonyms",
      partOfSpeech: "noun",
      contextExample: "True independence in artistic vision allows musicians to craft authentic sounds that resonate with their inner truth."
    },
    {
      word: "constraint",
      strength: 85,
      category: "antonyms",
      partOfSpeech: "noun",
      contextExample: "Breaking free from creative constraint enables artists to explore uncharted territories in their musical journey."
    },
    {
      word: "soaring",
      strength: 82,
      category: "metaphors",
      partOfSpeech: "verb",
      contextExample: "The melody soaring through the air captures the essence of unbounded creative freedom and limitless possibility."
    },
    {
      word: "unbound",
      strength: 79,
      category: "related",
      partOfSpeech: "adjective",
      contextExample: "An unbound spirit in songwriting leads to innovative compositions that challenge conventional musical boundaries."
    },
    {
      word: "euphoria",
      strength: 76,
      category: "emotions",
      partOfSpeech: "noun",
      contextExample: "The euphoria of creative freedom manifests in powerful lyrics that speak to the human experience of liberation."
    },
    {
      word: "emancipation",
      strength: 74,
      category: "synonyms",
      partOfSpeech: "noun",
      contextExample: "Musical emancipation from traditional structures opens doors to experimental sounds and revolutionary artistic expression."
    },
    {
      word: "wings",
      strength: 71,
      category: "metaphors",
      partOfSpeech: "noun",
      contextExample: "Giving wings to creative ideas allows them to fly beyond the limitations of conventional thinking and reach new heights."
    },
    {
      word: "autonomy",
      strength: 68,
      category: "related",
      partOfSpeech: "noun",
      contextExample: "Artistic autonomy empowers creators to make bold choices that define their unique voice in the music industry."
    },
    {
      word: "boundless",
      strength: 65,
      category: "related",
      partOfSpeech: "adjective",
      contextExample: "A boundless imagination in lyric writing produces verses that transcend ordinary expression and touch souls deeply."
    },
    {
      word: "captivity",
      strength: 63,
      category: "antonyms",
      partOfSpeech: "noun",
      contextExample: "Escaping the captivity of self-doubt allows artists to embrace their true creative potential and authentic voice."
    },
    {
      word: "exhilaration",
      strength: 61,
      category: "emotions",
      partOfSpeech: "noun",
      contextExample: "The exhilaration of creative breakthrough moments fuels the passion that drives artists to continue their craft."
    },
    {
      word: "unrestricted",
      strength: 58,
      category: "related",
      partOfSpeech: "adjective",
      contextExample: "Unrestricted creative flow enables musicians to channel raw emotion into powerful performances that captivate audiences."
    },
    {
      word: "breaking-chains",
      strength: 56,
      category: "metaphors",
      partOfSpeech: "phrase",
      contextExample: "Breaking chains of creative limitation reveals new pathways to artistic innovation and personal growth in music."
    },
    {
      word: "liberty",
      strength: 54,
      category: "synonyms",
      partOfSpeech: "noun",
      contextExample: "The liberty to experiment with different musical styles enriches an artist's repertoire and expands their creative horizons."
    },
    {
      word: "openness",
      strength: 52,
      category: "related",
      partOfSpeech: "noun",
      contextExample: "Openness to new influences and perspectives broadens the scope of creative possibilities in songwriting and composition."
    },
    {
      word: "joy",
      strength: 49,
      category: "emotions",
      partOfSpeech: "noun",
      contextExample: "Pure joy radiates through music created from a place of genuine freedom and authentic self-expression."
    },
    {
      word: "flight",
      strength: 47,
      category: "metaphors",
      partOfSpeech: "noun",
      contextExample: "Taking flight in creative endeavors means leaving behind fear and embracing the unknown with courage and confidence."
    },
    {
      word: "release",
      strength: 45,
      category: "related",
      partOfSpeech: "verb",
      contextExample: "The release of pent-up emotions through lyrical expression provides catharsis for both artist and listener alike."
    },
    {
      word: "oppression",
      strength: 43,
      category: "antonyms",
      partOfSpeech: "noun",
      contextExample: "Overcoming creative oppression requires courage to challenge norms and forge new paths in artistic expression."
    },
    {
      word: "wild",
      strength: 41,
      category: "related",
      partOfSpeech: "adjective",
      contextExample: "A wild creative spirit refuses to be tamed by convention and instead celebrates the raw power of authentic artistry."
    },
    {
      word: "hope",
      strength: 39,
      category: "emotions",
      partOfSpeech: "noun",
      contextExample: "Hope springs eternal in the hearts of artists who believe in the transformative power of creative freedom."
    },
    {
      word: "expansion",
      strength: 37,
      category: "related",
      partOfSpeech: "noun",
      contextExample: "Creative expansion occurs when artists push beyond their comfort zones to explore uncharted musical territories."
    },
    {
      word: "horizon",
      strength: 35,
      category: "metaphors",
      partOfSpeech: "noun",
      contextExample: "New horizons in music emerge when creators embrace freedom to experiment with unconventional sounds and structures."
    },
    {
      word: "inspiration",
      strength: 33,
      category: "emotions",
      partOfSpeech: "noun",
      contextExample: "True inspiration flows freely when artists give themselves permission to create without judgment or limitation."
    }
  ];

  const handleGenerate = () => {
    if (!seedWord?.trim()) {
      setError('Please enter a seed word');
      return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const filteredConnections = mockWordConnections?.filter(word => 
        advancedOptions?.categories?.some(cat => word?.category === cat)
      )?.slice(0, advancedOptions?.outputQuantity);

      setGeneratedData({
        seedWord: seedWord,
        connections: filteredConnections,
        timestamp: new Date()?.toISOString()
      });
      setIsLoading(false);
      showToast('Concept map generated successfully!');
    }, 2000);
  };

  const handleClear = () => {
    setSeedWord('');
    setGeneratedData(null);
    setError('');
  };

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    showToast('Logged out successfully');
  };

  const handleCopyWord = (word) => {
    showToast(`"${word}" copied to clipboard`);
  };

  const handleSaveToWorkspace = (word) => {
    const savedWords = JSON.parse(localStorage.getItem('savedWords') || '[]');
    savedWords?.push({
      word: word?.word,
      context: word?.contextExample,
      timestamp: new Date()?.toISOString()
    });
    localStorage.setItem('savedWords', JSON.stringify(savedWords));
    showToast(`"${word?.word}" saved to workspace`);
  };

  const handleTransferAll = () => {
    if (generatedData) {
      const allWords = generatedData?.connections?.map(word => ({
        word: word?.word,
        context: word?.contextExample,
        timestamp: new Date()?.toISOString()
      }));
      localStorage.setItem('savedWords', JSON.stringify(allWords));
      showToast('All words transferred to workspace');
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation
        isAuthenticated={isAuthenticated}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
      <ToolContextBreadcrumb />
      <main className="main-content">
        <div className="content-container">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 p-2.5 flex items-center justify-center">
                  <Icon name="Lightbulb" size={28} color="white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Concept Explorer
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Discover semantic connections and creative associations
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <SeedWordInput
                  seedWord={seedWord}
                  onSeedWordChange={setSeedWord}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  error={error}
                />

                <AdvancedOptions
                  options={advancedOptions}
                  onOptionsChange={setAdvancedOptions}
                />

                {generatedData && (
                  <div className="glass-card p-4">
                    <Button
                      variant="outline"
                      fullWidth
                      iconName="RotateCcw"
                      iconPosition="left"
                      onClick={handleClear}
                    >
                      Clear & Start New
                    </Button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-6">
                {!generatedData && !isLoading && <EmptyState />}

                {isLoading && (
                  <div className="glass-card p-12 text-center">
                    <div className="loading-border w-16 h-16 mx-auto mb-6 rounded-full" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Generating Concept Map...
                    </h3>
                    <p className="text-muted-foreground">
                      Analyzing semantic relationships for "{seedWord}"
                    </p>
                  </div>
                )}

                {generatedData && !isLoading && (
                  <>
                    <WordWebVisualization
                      seedWord={generatedData?.seedWord}
                      connections={generatedData?.connections}
                      onCopyToClipboard={handleCopyWord}
                      onWordClick={handleCopyWord}
                    />

                    <WordList
                      words={generatedData?.connections}
                      onCopyWord={handleCopyWord}
                      onSaveToWorkspace={handleSaveToWorkspace}
                      onTransferAll={handleTransferAll}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <WorkspaceFloatingButton />
      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
        onAuthSuccess={handleAuthSuccess}
      />
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-[2100] animate-slide-up">
          <div className="glass-card px-6 py-4 rounded-lg border border-success/50 shadow-lg flex items-center gap-3">
            <Icon name="CheckCircle" size={20} className="text-success" />
            <span className="text-sm font-medium text-foreground">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptExplorer;