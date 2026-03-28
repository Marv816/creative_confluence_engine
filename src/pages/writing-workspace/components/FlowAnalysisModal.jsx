import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FlowAnalysisModal = ({ isOpen, onClose, analysis }) => {
  if (!isOpen) return null;

  const mockAnalysis = {
    rhythmScore: 85,
    rhymeScheme: "AABB CCDD",
    syllablePattern: "8-8-8-8",
    suggestions: [
      "Strong consistent rhythm throughout verses",
      "Consider varying syllable count in bridge for dynamic contrast",
      "Excellent use of internal rhymes in lines 3-4"
    ],
    structure: {
      verses: 2,
      chorus: 1,
      bridge: 0,
      recommendation: "Add a bridge section after second chorus for emotional depth"
    }
  };

  const data = analysis || mockAnalysis;

  return (
    <div className="auth-modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="auth-modal-content modal-enter-active max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary p-2 flex items-center justify-center">
              <Icon name="BarChart3" size={20} color="white" />
            </div>
            <h2 className="text-2xl font-semibold">Lyrical Flow Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors focus-ring"
            aria-label="Close modal"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Activity" size={20} className="text-primary" />
                <span className="text-sm font-medium">Rhythm Score</span>
              </div>
              <p className="text-3xl font-bold text-primary">{data?.rhythmScore}%</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Repeat" size={20} className="text-secondary" />
                <span className="text-sm font-medium">Rhyme Scheme</span>
              </div>
              <p className="text-2xl font-bold text-secondary">{data?.rhymeScheme}</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Hash" size={20} className="text-accent" />
                <span className="text-sm font-medium">Syllable Pattern</span>
              </div>
              <p className="text-2xl font-bold text-accent">{data?.syllablePattern}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Icon name="Lightbulb" size={16} />
              AI Suggestions
            </h3>
            <div className="space-y-2">
              {data?.suggestions?.map((suggestion, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 flex items-start gap-3">
                  <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Icon name="Layers" size={16} />
              Song Structure
            </h3>
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Verses</p>
                  <p className="text-2xl font-bold">{data?.structure?.verses}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Chorus</p>
                  <p className="text-2xl font-bold">{data?.structure?.chorus}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bridge</p>
                  <p className="text-2xl font-bold">{data?.structure?.bridge}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-sm text-foreground flex items-start gap-2">
                  <Icon name="AlertCircle" size={16} className="text-warning mt-0.5 flex-shrink-0" />
                  {data?.structure?.recommendation}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="default"
            fullWidth
            onClick={onClose}
          >
            Close Analysis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlowAnalysisModal;