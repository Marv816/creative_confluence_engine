import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Music2, Waves, Copy } from 'lucide-react';
import { generateBeatBlueprint } from '../../services/beatBlueprintService';
import { useCancellableRequest } from '../../hooks/useCancellableRequest';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function BeatBlueprint() {
  const [vibe, setVibe] = useState('');
  const [blueprint, setBlueprint] = useState(null);
  const [error, setError] = useState('');
  
  const {
    startRequest,
    cancelRequest,
    isProcessing,
    processingStage,
    processingProgress
  } = useCancellableRequest();

  const handleGenerate = async (e) => {
    e?.preventDefault();
    
    if (!vibe?.trim()) {
      setError('Please describe the vibe or genre for the beat.');
      return;
    }

    setError('');
    setBlueprint(null);
    
    try {
      const result = await startRequest(async () => {
        return await generateBeatBlueprint(vibe);
      });
      
      setBlueprint(result);
    } catch (err) {
      setError(err?.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <>
      <Helmet>
        <title>Beat Blueprint Architect - Lyrical Metaverse</title>
        <meta name="description" content="Generate professional beat blueprints powered by Keylow Keyz music production methodology" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music2 className="w-12 h-12 text-indigo-400" />
              <h1 className="text-5xl font-bold text-white">Beat Blueprint Architect</h1>
              <Waves className="w-12 h-12 text-indigo-400" />
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powered by Keylow Keyz Logic. Generate professional beat blueprints with music theory, 
              rhythm patterns, and AI-optimized prompts for Suno/Udio.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleGenerate} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe Your Beat Vibe
                </label>
                <Input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e?.target?.value)}
                  placeholder="e.g., dark trap with 808s, smooth G-Funk, neo-soul with live drums"
                  className="w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isProcessing || !vibe?.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                {isProcessing ? 'Generating Blueprint...' : 'Generate Beat Blueprint'}
              </Button>
            </div>
          </form>

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">{processingStage}</span>
                <span className="text-sm text-indigo-400">{processingProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              
              <Button
                onClick={cancelRequest}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Cancel Generation
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Blueprint Display */}
          {blueprint && (
            <div className="space-y-6">
              {/* Technical Specs */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">Technical Specs</h3>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-200 whitespace-pre-wrap">{blueprint?.technical_specs}</p>
                </div>
              </div>

              {/* Theory Insight */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">Theory Insight</h3>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-200 whitespace-pre-wrap">{blueprint?.theory_insight}</p>
                </div>
              </div>

              {/* Rhythmic Guide */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">Rhythmic Guide</h3>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-200 whitespace-pre-wrap">{blueprint?.rhythmic_guide}</p>
                </div>
              </div>

              {/* Suno/AI Prompt */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-amber-400">🚀 Copy for Suno/AI</h3>
                  <Button
                    onClick={() => copyToClipboard(blueprint?.suno_prompt)}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Prompt
                  </Button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-200 whitespace-pre-wrap font-mono text-sm">
                    {blueprint?.suno_prompt}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!blueprint && !isProcessing && (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 flex flex-col items-center justify-center text-center">
              <Music2 className="w-20 h-20 text-gray-600 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">Ready to Architect</h3>
              <p className="text-gray-500">Describe your beat vibe and generate a professional blueprint</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}