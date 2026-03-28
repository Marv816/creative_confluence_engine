import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import WorkspaceFloatingButton from '../../components/navigation/WorkspaceFloatingButton';
import ToolContextBreadcrumb from '../../components/navigation/ToolContextBreadcrumb';
import AuthenticationModal from '../../components/navigation/AuthenticationModal';
import DocumentHeader from './components/DocumentHeader';
import WritingEditor from './components/WritingEditor';
import AIAssistancePanel from './components/AIAssistancePanel';
import DocumentSidebar from './components/DocumentSidebar';
import ExportModal from './components/ExportModal';
import FlowAnalysisModal from './components/FlowAnalysisModal';

const WritingWorkspace = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Midnight Reflections",
      content: "In the silence of the night, thoughts dance like shadows\nWhispers of dreams untold, painting stories in the dark\nEvery heartbeat echoes, a rhythm of the soul\nSearching for meaning in the spaces between stars\n\nThe moon becomes my witness, to secrets I confide\nWords flow like rivers, carving paths through my mind\nIn this moment of creation, I find my truest self\nWhere imagination meets reality, and magic comes alive",
      wordCount: 72,
      characterCount: 398,
      lastModified: "2 hours ago",
      createdAt: "2025-12-17"
    },
    {
      id: 2,
      title: "Urban Symphony",
      content: "City lights flicker like fireflies in concrete jungles\nSirens sing their urgent songs through crowded streets\nFootsteps create percussion on rain-soaked pavements\nThis is the soundtrack of survival, the beat of the brave",
      wordCount: 35,
      characterCount: 219,
      lastModified: "Yesterday",
      createdAt: "2025-12-16"
    },
    {
      id: 3,
      title: "Untitled Draft",
      content: "",
      wordCount: 0,
      characterCount: 0,
      lastModified: "Just now",
      createdAt: "2025-12-18"
    }
  ]);

  const [activeDocumentId, setActiveDocumentId] = useState(1);
  const [documentTitle, setDocumentTitle] = useState("Midnight Reflections");
  const [content, setContent] = useState(documents?.[0]?.content);
  const [wordCount, setWordCount] = useState(72);
  const [characterCount, setCharacterCount] = useState(398);
  const [lastSaved, setLastSaved] = useState("2 hours ago");
  const [selectedText, setSelectedText] = useState("");
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [isDocSidebarOpen, setIsDocSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFlowAnalysis, setShowFlowAnalysis] = useState(false);

  const [flowAnalysisData, setFlowAnalysisData] = useState(null);

  const [aiSuggestions, setAiSuggestions] = useState([
    {
      text: "Continue with a metaphor about time passing like sand through fingers",
      type: "Continuation"
    },
    {
      text: "Add internal rhyme: 'In the glow of the moon, I find my tune'",
      type: "Rhyme Enhancement"
    },
    {
      text: "Strengthen imagery: Replace \'thoughts dance\' with \'thoughts pirouette'",
      type: "Word Choice"
    }
  ]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('user');
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const words = content?.trim()?.split(/\s+/)?.filter(word => word?.length > 0);
    setWordCount(words?.length);
    setCharacterCount(content?.length);
  }, [content]);

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, documentTitle]);

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSave = useCallback(() => {
    const now = new Date();
    const timeString = now?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setLastSaved(`at ${timeString}`);

    setDocuments(prev => prev?.map(doc => 
      doc?.id === activeDocumentId 
        ? { ...doc, title: documentTitle, content, wordCount, characterCount, lastModified: 'Just now' }
        : doc
    ));
  }, [activeDocumentId, documentTitle, content, wordCount, characterCount]);

  const handleNewDocument = () => {
    const newDoc = {
      id: Date.now(),
      title: "Untitled Document",
      content: "",
      wordCount: 0,
      characterCount: 0,
      lastModified: "Just now",
      createdAt: new Date()?.toISOString()?.split('T')?.[0]
    };
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocumentId(newDoc?.id);
    setDocumentTitle(newDoc?.title);
    setContent(newDoc?.content);
    setWordCount(0);
    setCharacterCount(0);
    setLastSaved("Just now");
  };

  const handleSelectDocument = (docId) => {
    const doc = documents?.find(d => d?.id === docId);
    if (doc) {
      setActiveDocumentId(doc?.id);
      setDocumentTitle(doc?.title);
      setContent(doc?.content);
      setWordCount(doc?.wordCount);
      setCharacterCount(doc?.characterCount);
      setLastSaved(doc?.lastModified);
    }
    setIsDocSidebarOpen(false);
  };

  const handleDeleteDocument = (docId) => {
    if (documents?.length === 1) {
      alert("Cannot delete the last document");
      return;
    }
    setDocuments(prev => prev?.filter(doc => doc?.id !== docId));
    if (activeDocumentId === docId) {
      const remainingDocs = documents?.filter(doc => doc?.id !== docId);
      handleSelectDocument(remainingDocs?.[0]?.id);
    }
  };

  const handleGenerateContinuation = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const continuations = [
        "\n\nTime slips through my fingers like grains of sand\nEach moment precious, impossible to hold\nYet in this fleeting dance, I understand\nThat beauty lives in stories yet untold",
        "\n\nThe rhythm of my heartbeat writes the score\nOf melodies that only I can hear\nIn every word I write, I find much more\nThan simple verses - I find purpose clear",
        "\n\nBeneath the surface of these written lines\nLies truth that waits for those who dare to see\nIn metaphors and carefully crafted rhymes\nI discover who I'm meant to be"
      ];
      const randomContinuation = continuations?.[Math.floor(Math.random() * continuations?.length)];
      setContent(prev => prev + randomContinuation);
      setIsGenerating(false);
    }, 2000);
  };

  const handleAnalyzeFlow = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setFlowAnalysisData({
        overallScore: 85,
        pacing: { score: 88, feedback: "Good rhythm and flow throughout" },
        imagery: { score: 90, feedback: "Strong visual elements" },
        emotionalImpact: { score: 82, feedback: "Effective emotional resonance" },
        suggestions: [
          "Consider varying sentence length for more dynamic pacing",
          "The metaphors are strong - maintain this consistency"
        ]
      });
      setShowFlowAnalysis(true);
    }, 1500);
  };

  const handleCalibrateStyle = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("Style calibration complete! AI has learned your writing patterns.");
    }, 2000);
  };

  const handleApplySuggestion = (suggestion) => {
    setContent(prev => prev + "\n\n" + suggestion?.text);
  };

  const handleSelectionChange = (text, start, end) => {
    setSelectedText(text);
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
        <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex">
          <DocumentSidebar
            documents={documents}
            activeDocumentId={activeDocumentId}
            onSelectDocument={handleSelectDocument}
            onDeleteDocument={handleDeleteDocument}
            onNewDocument={handleNewDocument}
            isOpen={isDocSidebarOpen}
            onToggle={() => setIsDocSidebarOpen(!isDocSidebarOpen)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <DocumentHeader
              documentTitle={documentTitle}
              onTitleChange={setDocumentTitle}
              wordCount={wordCount}
              characterCount={characterCount}
              lastSaved={lastSaved}
              onExport={() => setShowExportModal(true)}
              onNewDocument={handleNewDocument}
              onSave={handleSave}
            />

            <div className="flex-1 flex min-h-0">
              <WritingEditor
                content={content}
                onChange={setContent}
                onSelectionChange={handleSelectionChange}
                placeholder="Start writing your masterpiece..."
              />

              <AIAssistancePanel
                isOpen={isAIPanelOpen}
                onToggle={() => setIsAIPanelOpen(!isAIPanelOpen)}
                onGenerateContinuation={handleGenerateContinuation}
                onAnalyzeFlow={handleAnalyzeFlow}
                onCalibrateStyle={handleCalibrateStyle}
                isGenerating={isGenerating}
                suggestions={aiSuggestions}
                onApplySuggestion={handleApplySuggestion}
              />
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

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        documentTitle={documentTitle}
        content={content}
        wordCount={wordCount}
      />

      <FlowAnalysisModal
        isOpen={showFlowAnalysis}
        onClose={() => setShowFlowAnalysis(false)}
        analysis={flowAnalysisData}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default WritingWorkspace;