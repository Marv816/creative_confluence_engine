import React from 'react';
import Icon from '../../../components/AppIcon';

const HeroSection = ({ onGetStarted, onSignIn }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 lg:px-6 py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] animate-pulse delay-2000" />
      </div>
      <div className="max-w-6xl mx-auto text-center">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass-card rounded-full">
          <Icon name="Zap" size={16} className="text-accent" />
          <span className="text-sm font-medium text-foreground">
            AI-Powered Creative Tools
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
          Unleash Your
          <span className="block gradient-primary bg-clip-text text-transparent">
            Creative Genius
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in">
          Transform your ideas into powerful lyrics with AI-driven word webs, beat blueprints, 
          and interactive wordplay training. The ultimate creative toolkit for lyricists and songwriters.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white gradient-primary rounded-lg lift-hover focus-ring shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              Get Started Free
              <Icon name="ArrowRight" size={20} />
            </span>
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-foreground glass-card rounded-lg lift-hover focus-ring"
          >
            Sign In
          </button>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto animate-fade-in">
          {[
            { icon: 'Lightbulb', title: 'Word Web', color: 'indigo' },
            { icon: 'Music', title: 'Beat Blueprint', color: 'rose' },
            { icon: 'Zap', title: 'Wordplay Trainer', color: 'cyan' },
            { icon: 'Sparkles', title: 'AI Lyric Gen', color: 'amber' }
          ]?.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 rounded-xl lift-hover cursor-pointer border-l-4"
              style={{ borderColor: `var(--color-generator-${feature?.color})` }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto"
                style={{ backgroundColor: `var(--color-generator-${feature?.color})20` }}
              >
                <Icon 
                  name={feature?.icon} 
                  size={24} 
                  style={{ color: `var(--color-generator-${feature?.color})` }}
                />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {feature?.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;