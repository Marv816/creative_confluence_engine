import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIAssistancePanel = ({ 
  isOpen, 
  onToggle, 
  onGenerateContinuation, 
  onAnalyzeFlow,
  onCalibrateStyle,
  isGenerating,
  suggestions,
  onApplySuggestion
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 glass-card border-l-0 rounded-l-lg p-3 hover:bg-muted/50 transition-colors"
        aria-label="Open AI Assistance"
      >
        <Icon name="Sparkles" size={20} />
      </button>
    );
  }

  return (
    <div className="w-full lg:w-80 glass-card border-l border-white/10 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={20} className="text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          aria-label="Close AI Assistance"
        >
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'suggestions' ?'text-foreground border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Suggestions
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'analysis' ?'text-foreground border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'style' ?'text-foreground border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Style
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <Button
              variant="outline"
              fullWidth
              iconName="Wand2"
              iconPosition="left"
              onClick={onGenerateContinuation}
              loading={isGenerating}
            >
              Generate Continuation
            </Button>

            {suggestions?.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">AI Suggestions:</p>
                {suggestions?.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => onApplySuggestion(suggestion)}
                  >
                    <p className="text-sm text-foreground mb-2">{suggestion?.text}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{suggestion?.type}</span>
                      <Icon name="Plus" size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="Lightbulb" size={48} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Start writing to receive AI suggestions
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <Button
              variant="outline"
              fullWidth
              iconName="BarChart3"
              iconPosition="left"
              onClick={onAnalyzeFlow}
              loading={isGenerating}
            >
              Analyze Lyrical Flow
            </Button>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Music" size={16} className="text-primary" />
                  <span className="text-sm font-medium">Rhythm Analysis</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Write at least 50 words to analyze rhythm patterns
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Repeat" size={16} className="text-secondary" />
                  <span className="text-sm font-medium">Rhyme Scheme</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rhyme detection will appear after analysis
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Layers" size={16} className="text-accent" />
                  <span className="text-sm font-medium">Structure</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Song structure suggestions available after analysis
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            <Button
              variant="outline"
              fullWidth
              iconName="Palette"
              iconPosition="left"
              onClick={onCalibrateStyle}
              loading={isGenerating}
            >
              Calibrate Writing Style
            </Button>

            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="User" size={16} className="text-primary" />
                <span className="text-sm font-medium">Your Writing Voice</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI learns from your existing content to match your unique style and tone
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Formality</span>
                  <span className="text-foreground">Casual</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Complexity</span>
                  <span className="text-foreground">Moderate</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Creativity</span>
                  <span className="text-foreground">High</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistancePanel;