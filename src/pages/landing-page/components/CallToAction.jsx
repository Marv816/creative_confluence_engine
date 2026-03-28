import React from 'react';
import Icon from '../../../components/AppIcon';

const CallToAction = ({ onEnterDashboard }) => {
  return (
    <section className="relative py-24 px-4 lg:px-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>
      <div className="max-w-4xl mx-auto text-center">
        {/* Main CTA Card */}
        <div className="glass-card p-12 rounded-2xl border border-white/10">
          {/* Icon Grid */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {['Lightbulb', 'Music', 'Zap', 'Sparkles', 'Radio', 'Palette']?.map((iconName, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-lg gradient-primary p-2 flex items-center justify-center animate-fade-in opacity-90"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon name={iconName} size={20} className="text-white" />
              </div>
            ))}
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your
            <span className="block gradient-primary bg-clip-text text-transparent">
              Creative Process?
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of creators who are using AI-powered tools to unlock their creative potential. 
            Start generating lyrics, beats, and ideas today — completely free.
          </p>

          {/* CTA Button */}
          <button
            onClick={onEnterDashboard}
            className="px-10 py-5 text-lg font-bold text-white gradient-primary rounded-lg lift-hover focus-ring shadow-2xl mb-6"
          >
            <span className="flex items-center justify-center gap-3">
              Enter Creative Dashboard
              <Icon name="ArrowRight" size={24} />
            </span>
          </button>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Check" size={16} className="text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Check" size={16} className="text-success" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Check" size={16} className="text-success" />
              <span>Full feature access</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
          {[
            { number: '10K+', label: 'Active Creators' },
            { number: '50K+', label: 'Lyrics Generated' },
            { number: '95%', label: 'User Satisfaction' }
          ]?.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                {stat?.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat?.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CallToAction;