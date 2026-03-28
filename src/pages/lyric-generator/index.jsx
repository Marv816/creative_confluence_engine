import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Music, FileText, Guitar, Headphones } from 'lucide-react';
import { generateLyrics, streamLyrics, analyzeLyrics } from '../../services/lyricGeneration';
import { lyricsService, generatorHistoryService, userPreferencesService } from '../../services/lyricsService';
import { useAuth } from '../../contexts/AuthContext';
import { useCancellableRequest } from '../../hooks/useCancellableRequest';
import GenerationForm from './components/GenerationForm';
import LyricDisplay from './components/LyricDisplay';
import AnalysisPanel from './components/AnalysisPanel';
import ContentCreationTab from './components/ContentCreationTab';
import MusicTheoryTab from './components/MusicTheoryTab';
import ProductionWorkflowTab from './components/ProductionWorkflowTab';
import StickyNotepad from './components/StickyNotepad';

export default function LyricGenerator() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('content');
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentLyricId, setCurrentLyricId] = useState(null);
  const [lastFormData, setLastFormData] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');
  const [notepadContent, setNotepadContent] = useState('');
  
  const {
    startRequest,
    cancelRequest,
    isProcessing,
    processingStage,
    processingProgress
  } = useCancellableRequest();

  // Load user preferences on mount
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  // Auto-save lyrics when they change
  useEffect(() => {
    if (generatedLyrics && autoSaveEnabled && user && lastFormData) {
      const timeoutId = setTimeout(() => {
        autoSaveLyrics();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [generatedLyrics, autoSaveEnabled, user, lastFormData]);

  const loadUserPreferences = async () => {
    try {
      const prefs = await userPreferencesService?.get();
      setAutoSaveEnabled(prefs?.autoSaveEnabled);
    } catch (err) {
      console.error('[Lyric Generator] Failed to load preferences:', err);
    }
  };

  const autoSaveLyrics = async () => {
    if (!generatedLyrics || !lastFormData) return;

    try {
      setSaveStatus('Saving...');
      
      const lyricData = {
        title: `${lastFormData?.subject || 'Untitled'} - ${new Date()?.toLocaleDateString()}`,
        content: generatedLyrics,
        genre: lastFormData?.genre,
        subject: lastFormData?.subject,
        tone: lastFormData?.tone,
        artistStyles: lastFormData?.artistStyles,
        section: lastFormData?.section,
        bars: lastFormData?.bars,
        status: 'draft',
        analysis: analysis
      };

      if (currentLyricId) {
        await lyricsService?.update(currentLyricId, lyricData);
      } else {
        const created = await lyricsService?.create(lyricData);
        setCurrentLyricId(created?.id);
      }

      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('[Lyric Generator] Auto-save failed:', err);
      setSaveStatus('Save failed');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const handleCopyToNotepad = (text) => {
    const separator = notepadContent?.length > 0 && !notepadContent?.endsWith('\n') ? '\n\n' : '';
    setNotepadContent(prev => prev + separator + text);
    showFeedback('Added to notepad!', 'success');
  };

  const handleNotepadSave = (content) => {
    setNotepadContent(content);
  };

  const handleGenerate = async (formData) => {
    setError('');
    setGeneratedLyrics('');
    setAnalysis(null);
    setCurrentLyricId(null);
    setLastFormData(formData);
    
    console.log('[Lyric Generator Page] Starting generation with form data:', formData);
    
    try {
      const result = await startRequest(async () => {
        return await generateLyrics(formData);
      });
      
      if (!result) {
        console.error('[Lyric Generator Page] No result returned from generateLyrics');
        throw new Error('No response received. Please try again.');
      }

      if (!result?.lyrics) {
        console.error('[Lyric Generator Page] Result missing lyrics property:', result);
        throw new Error('Invalid response format. Please try again.');
      }

      console.log('[Lyric Generator Page] Successfully generated lyrics');
      setGeneratedLyrics(result?.lyrics);

      // Add to generator history if user is logged in
      if (user) {
        try {
          await generatorHistoryService?.addEntry({
            genre: formData?.genre,
            subject: formData?.subject,
            tone: formData?.tone,
            artistStyles: formData?.artistStyles,
            section: formData?.section,
            bars: formData?.bars,
            generationMethod: 'standard',
            success: true
          });
        } catch (historyErr) {
          console.error('[Lyric Generator] Failed to save history:', historyErr);
        }
      }
    } catch (err) {
      console.error('[Lyric Generator Page] Generation error:', err);
      
      // Provide detailed error message to user
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      
      // Log additional debugging info
      if (err?.stack) {
        console.error('[Lyric Generator Page] Error stack:', err?.stack);
      }

      // Save failed generation to history if user is logged in
      if (user) {
        try {
          await generatorHistoryService?.addEntry({
            genre: formData?.genre,
            subject: formData?.subject,
            tone: formData?.tone,
            artistStyles: formData?.artistStyles,
            section: formData?.section,
            bars: formData?.bars,
            generationMethod: 'standard',
            success: false,
            errorMessage: errorMessage
          });
        } catch (historyErr) {
          console.error('[Lyric Generator] Failed to save history:', historyErr);
        }
      }
    }
  };

  const handleStreamGenerate = async (formData) => {
    setError('');
    setGeneratedLyrics('');
    setAnalysis(null);
    setCurrentLyricId(null);
    setLastFormData(formData);
    
    console.log('[Lyric Generator Page] Starting streaming generation with form data:', formData);
    
    try {
      await streamLyrics(formData, (chunk) => {
        setGeneratedLyrics(prev => prev + chunk);
      });
      
      console.log('[Lyric Generator Page] Streaming completed successfully');

      // Add to generator history if user is logged in
      if (user) {
        try {
          await generatorHistoryService?.addEntry({
            genre: formData?.genre,
            subject: formData?.subject,
            tone: formData?.tone,
            artistStyles: formData?.artistStyles,
            section: formData?.section,
            bars: formData?.bars,
            generationMethod: 'streaming',
            success: true
          });
        } catch (historyErr) {
          console.error('[Lyric Generator] Failed to save history:', historyErr);
        }
      }
    } catch (err) {
      console.error('[Lyric Generator Page] Streaming error:', err);
      
      // Provide detailed error message to user
      const errorMessage = err?.message || 'Streaming failed. Please try again.';
      setError(errorMessage);
      
      // Log additional debugging info
      if (err?.stack) {
        console.error('[Lyric Generator Page] Error stack:', err?.stack);
      }

      // Save failed generation to history if user is logged in
      if (user) {
        try {
          await generatorHistoryService?.addEntry({
            genre: formData?.genre,
            subject: formData?.subject,
            tone: formData?.tone,
            artistStyles: formData?.artistStyles,
            section: formData?.section,
            bars: formData?.bars,
            generationMethod: 'streaming',
            success: false,
            errorMessage: errorMessage
          });
        } catch (historyErr) {
          console.error('[Lyric Generator] Failed to save history:', historyErr);
        }
      }
    }
  };

  const handleAnalyze = async () => {
    if (!generatedLyrics) {
      setError('No lyrics to analyze. Generate lyrics first.');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    console.log('[Lyric Generator Page] Starting analysis');
    
    try {
      const result = await analyzeLyrics(generatedLyrics);
      
      if (!result) {
        console.error('[Lyric Generator Page] No result returned from analyzeLyrics');
        throw new Error('No analysis received. Please try again.');
      }

      if (!result?.analysis) {
        console.error('[Lyric Generator Page] Result missing analysis property:', result);
        throw new Error('Invalid analysis format. Please try again.');
      }

      console.log('[Lyric Generator Page] Successfully analyzed lyrics');
      setAnalysis(result?.analysis);

      // Update saved lyric with analysis if auto-save is enabled
      if (currentLyricId && autoSaveEnabled && user) {
        try {
          await lyricsService?.update(currentLyricId, { analysis: result?.analysis });
        } catch (updateErr) {
          console.error('[Lyric Generator] Failed to update analysis:', updateErr);
        }
      }
    } catch (err) {
      console.error('[Lyric Generator Page] Analysis error:', err);
      
      // Provide detailed error message to user
      const errorMessage = err?.message || 'Analysis failed. Please try again.';
      setError(errorMessage);
      
      // Log additional debugging info
      if (err?.stack) {
        console.error('[Lyric Generator Page] Error stack:', err?.stack);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(generatedLyrics);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLyrics], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lyrics-${Date.now()}.txt`;
    link?.click();
    URL.revokeObjectURL(url);
  };

  const handleManualSave = async () => {
    if (!generatedLyrics || !lastFormData) {
      setError('No lyrics to save');
      return;
    }

    try {
      setSaveStatus('Saving...');
      
      const lyricData = {
        title: `${lastFormData?.subject || 'Untitled'} - ${new Date()?.toLocaleDateString()}`,
        content: generatedLyrics,
        genre: lastFormData?.genre,
        subject: lastFormData?.subject,
        tone: lastFormData?.tone,
        artistStyles: lastFormData?.artistStyles,
        section: lastFormData?.section,
        bars: lastFormData?.bars,
        status: 'completed',
        analysis: analysis
      };

      if (currentLyricId) {
        await lyricsService?.update(currentLyricId, { ...lyricData, status: 'completed' });
      } else {
        const created = await lyricsService?.create(lyricData);
        setCurrentLyricId(created?.id);
      }

      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('[Lyric Generator] Manual save failed:', err);
      setError('Failed to save lyrics: ' + err?.message);
      setSaveStatus('');
    }
  };

  return (
    <>
      <Helmet>
        <title>Lyrical Metaverse | BlackTop Entertainment</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-2">
            Lyrical Metaverse
          </h1>
          <p className="text-lg text-gray-300">Your AI-powered platform for music, lyrics & creativity</p>
        </header>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            feedbackType === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white font-semibold animate-fade-in`}>
            {feedbackMessage}
          </div>
        )}

        {/* Main Layout: Tabs (left) + Sticky Notepad (right) */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tabbed Content (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-purple-500/30">
              <nav className="flex gap-2 border-b-2 border-purple-500/20 pb-3 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all border-b-3 whitespace-nowrap ${
                    activeTab === 'content' ?'text-purple-300 border-purple-500' :'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Content Creation
                </button>
                <button
                  onClick={() => setActiveTab('music')}
                  className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all border-b-3 whitespace-nowrap ${
                    activeTab === 'music' ?'text-purple-300 border-purple-500' :'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Guitar className="w-4 h-4" />
                  Music Theory
                </button>
                <button
                  onClick={() => setActiveTab('workflow')}
                  className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all border-b-3 whitespace-nowrap ${
                    activeTab === 'workflow' ?'text-purple-300 border-purple-500' :'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  Production Workflow
                </button>
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all border-b-3 whitespace-nowrap ${
                    activeTab === 'generator' ?'text-purple-300 border-purple-500' :'text-gray-400 border-transparent hover:text-gray-200'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  Lyric Generator
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'content' && (
                <ContentCreationTab
                  onCopyToNotepad={handleCopyToNotepad}
                  onShowFeedback={showFeedback}
                />
              )}

              {activeTab === 'music' && (
                <MusicTheoryTab
                  onCopyToNotepad={handleCopyToNotepad}
                  onShowFeedback={showFeedback}
                />
              )}

              {activeTab === 'workflow' && <ProductionWorkflowTab />}

              {activeTab === 'generator' && (
                <>
                  <GenerationForm
                    onGenerate={handleGenerate}
                    onStreamGenerate={handleStreamGenerate}
                    isProcessing={isProcessing}
                    onCancel={cancelRequest}
                  />

                  {error && (
                    <div className="bg-red-900/50 backdrop-blur-sm border border-red-500/50 rounded-xl p-4">
                      <p className="text-red-200">{error}</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                      <div className="flex items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        <div>
                          <p className="text-white font-semibold">{processingStage}</p>
                          {processingProgress > 0 && (
                            <div className="w-64 bg-gray-700 rounded-full h-2 mt-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${processingProgress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {generatedLyrics && (
                    <LyricDisplay
                      lyrics={generatedLyrics}
                      onCopy={() => {
                        navigator?.clipboard?.writeText(generatedLyrics);
                        showFeedback('Copied to clipboard!', 'success');
                      }}
                      onDownload={() => {
                        const blob = new Blob([generatedLyrics], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `lyrics-${Date.now()}.txt`;
                        a?.click();
                        URL.revokeObjectURL(url);
                        showFeedback('Downloaded!', 'success');
                      }}
                      onAnalyze={handleAnalyze}
                      isAnalyzing={isAnalyzing}
                      onSave={autoSaveLyrics}
                      saveStatus={saveStatus}
                    />
                  )}

                  {analysis && <AnalysisPanel analysis={analysis} />}
                </>
              )}
            </div>
          </div>

          {/* Right: Sticky Notepad (1/3 width) */}
          <div className="lg:col-span-1">
            <StickyNotepad onSave={handleNotepadSave} />
          </div>
        </main>
      </div>
    </>
  );
}