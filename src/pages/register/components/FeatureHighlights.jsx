import React from 'react';
import Icon from '../../../components/AppIcon';

const FeatureHighlights = () => {
  const features = [
    {
      icon: 'Lightbulb',
      title: 'Concept Explorer',
      description: 'Generate creative word webs from seed concepts',
      color: 'text-generator-indigo'
    },
    {
      icon: 'Music',
      title: 'Lyrical Prompts',
      description: 'AI-powered writing prompts for your next hit',
      color: 'text-generator-purple'
    },
    {
      icon: 'PenTool',
      title: 'Writing Workspace',
      description: 'Real-time collaboration and AI assistance',
      color: 'text-generator-cyan'
    },
    {
      icon: 'Zap',
      title: 'Beat Architect',
      description: 'Music theory-based beat recipe generation',
      color: 'text-generator-amber'
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <h3 className="text-sm font-semibold text-center mb-6 text-muted-foreground uppercase tracking-wider">
        What You'll Get
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features?.map((feature, index) => (
          <div
            key={index}
            className="glass-card p-4 rounded-lg hover:bg-card/80 transition-all duration-200 lift-hover"
          >
            <div className="flex items-start gap-3">
              <div className={`${feature?.color} mt-1`}>
                <Icon name={feature?.icon} size={20} />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">{feature?.title}</h4>
                <p className="text-xs text-muted-foreground">{feature?.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHighlights;