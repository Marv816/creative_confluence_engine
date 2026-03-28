import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const WorkflowProgressTracker = () => {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('workflow_progress');
    if (savedProgress) {
      setCompletedSteps(JSON.parse(savedProgress));
    }
  }, []);

  const steps = [
    {
      id: 1,
      title: '808 Back Beat Boulevard',
      description: 'Create drum patterns',
      icon: 'Radio',
      color: 'from-purple-500 to-indigo-600',
      route: '/drum-generator',
      available: true
    },
    {
      id: 2,
      title: 'Soulful MasterVerse',
      description: 'Generate chord progressions',
      icon: 'Music',
      color: 'from-blue-500 to-cyan-600',
      route: '/lyric-generator',
      available: true
    },
    {
      id: 3,
      title: 'Poetic Vernacular',
      description: 'Write lyrics',
      icon: 'FileText',
      color: 'from-teal-500 to-green-600',
      route: '/lyric-generator',
      available: true
    },
    {
      id: 4,
      title: 'MASTER PROMPT Engine',
      description: 'Final Suno.ai prompt',
      icon: 'Sparkles',
      color: 'from-amber-500 to-orange-600',
      route: '/master-prompt-engine',
      available: true
    }
  ];

  const handleStepClick = (step) => {
    if (step?.available && step?.route) {
      navigate(step?.route);
    }
  };

  const toggleStepCompletion = (stepId) => {
    const newCompleted = completedSteps?.includes(stepId)
      ? completedSteps?.filter(id => id !== stepId)
      : [...completedSteps, stepId];
    
    setCompletedSteps(newCompleted);
    localStorage.setItem('workflow_progress', JSON.stringify(newCompleted));
  };

  const getStepStatus = (stepId) => {
    if (completedSteps?.includes(stepId)) return 'completed';
    if (stepId === 1 || completedSteps?.includes(stepId - 1)) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Icon name="Workflow" size={24} className="text-primary" />
            Production Workflow
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your music production journey step-by-step
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {completedSteps?.length}/{steps?.length}
          </div>
          <div className="text-xs text-muted-foreground">Steps Complete</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${(completedSteps?.length / steps?.length) * 100}%` }}
          />
        </div>
      </div>
      {/* Workflow Steps */}
      <div className="space-y-4">
        {steps?.map((step, index) => {
          const status = getStepStatus(step?.id);
          const isCompleted = completedSteps?.includes(step?.id);
          const isCurrent = status === 'current' && !isCompleted;

          return (
            <div key={step?.id}>
              <div
                className={`relative group transition-all duration-300 ${
                  step?.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
              >
                {/* Step Card */}
                <div
                  onClick={() => handleStepClick(step)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'bg-primary/10 border-primary shadow-md'
                      : isCurrent
                      ? 'bg-accent/10 border-accent shadow-md animate-pulse'
                      : 'bg-card border-border hover:border-muted-foreground/30'
                  } ${
                    step?.available ? 'hover:shadow-lg hover:scale-[1.02]' : ''
                  }`}
                >
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${step?.color} flex items-center justify-center shadow-lg`}
                    >
                      {isCompleted ? (
                        <Icon name="Check" size={32} className="text-white" />
                      ) : (
                        <Icon name={step?.icon} size={32} className="text-white" />
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        STEP {step?.id}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                          CURRENT
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-1">
                      {step?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step?.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        toggleStepCompletion(step?.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                          : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                      }`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <Icon name={isCompleted ? 'CheckCircle2' : 'Circle'} size={20} />
                    </button>
                    {step?.available && (
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleStepClick(step);
                        }}
                        className="p-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
                        title="Go to tool"
                      >
                        <Icon name="ArrowRight" size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* Arrow Connector */}
              {index < steps?.length - 1 && (
                <div className="flex justify-center py-2">
                  <Icon
                    name="ArrowDown"
                    size={24}
                    className={`${
                      completedSteps?.includes(step?.id)
                        ? 'text-primary' :'text-muted-foreground/30'
                    } transition-colors`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Final Step - Export to Suno.ai */}
      <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-600/10 border-2 border-amber-500/30 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Icon name="Rocket" size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-foreground">Ready to Launch?</h4>
            <p className="text-sm text-muted-foreground">
              Export your final prompt to Suno.ai and create your hit song!
            </p>
          </div>
          {completedSteps?.length === steps?.length && (
            <Icon name="PartyPopper" size={32} className="text-amber-500 animate-bounce" />
          )}
        </div>
      </div>
      {/* Workflow Guide */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Icon name="Info" size={16} className="text-primary" />
          Workflow Guide
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Click any step to navigate to that tool</li>
          <li>• Mark steps complete as you finish each stage</li>
          <li>• Follow the arrows to progress through your production</li>
          <li>• Your progress is automatically saved</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkflowProgressTracker;