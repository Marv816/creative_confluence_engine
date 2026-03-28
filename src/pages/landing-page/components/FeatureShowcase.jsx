import React from 'react';
import Icon from '../../../components/AppIcon';

const FeatureShowcase = () => {
  const features = [
    {
      id: 'concept-explorer',
      icon: 'Lightbulb',
      title: 'Concept Explorer',
      description: 'Generate intricate word webs and semantic connections from any seed word. Discover hidden relationships and expand your creative vocabulary with AI-powered mapping.',
      color: 'indigo',
      highlights: ['AI-Powered Mapping', 'Semantic Networks', 'Creative Discovery'],
      district: 'Poetic Vernacular'
    },
    {
      id: 'beat-blueprint',
      icon: 'Radio',
      title: 'Beat Blueprint Architect',
      description: 'Create professional music production recipes with BPM, key signatures, chord progressions, and production notes. Perfect for collaboration with producers.',
      color: 'amber',
      highlights: ['Music Theory', 'Production Ready', 'Suno Compatible'],
      district: 'Soulful MasterVerse'
    },
    {
      id: 'lyric-generator',
      icon: 'Sparkles',
      title: 'AI Lyric Generation',
      description: 'Generate powerful lyrics mixing styles like Kendrick Lamar, Jay-Z, and more. Blend multiple artist influences to create your unique voice.',
      color: 'purple',
      highlights: ['Style Blending', 'Multi-Artist Mix', 'Creative Output'],
      district: 'Poetic Vernacular'
    },
    {
      id: 'wordplay-trainer',
      icon: 'Zap',
      title: 'Interactive Wordplay Trainer',
      description: 'Master metaphors, similes, and rhyme schemes with interactive exercises. Get instant feedback and track your progress as you level up your skills.',
      color: 'cyan',
      highlights: ['Skill Building', 'Progress Tracking', 'Instant Feedback'],
      district: 'Poetic Vernacular'
    },
    {
      id: 'lyrical-prompt',
      icon: 'Music',
      title: 'Lyrical Prompt Machine',
      description: 'Generate endless creative prompts tailored to your genre and style. Break through writer\'s block with AI-curated themes and concepts.',
      color: 'rose',
      highlights: ['Genre-Specific', 'Theme Generation', 'Writer\'s Aid'],
      district: 'Poetic Vernacular'
    },
    {
      id: 'mood-generator',
      icon: 'Palette',
      title: 'Mood & Vibe Generator',
      description: 'Create unique mood names, color palettes, and visual imagery from your themes. Perfect for album artwork and creative direction.',
      color: 'teal',
      highlights: ['Visual Creation', 'Mood Naming', 'Color Theory'],
      district: 'Vernacular District'
    }
  ];

  return (
    <section id="features" className="py-24 px-4 lg:px-6 bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass-card rounded-full">
            <Icon name="Sparkles" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              BlackTop AI Districts
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Navigate Your Creative Boulevard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore BlackTop Entertainment's AI-powered creative districts. From Poetic Vernacular to Soulful MasterVerse—your street to success.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features?.map((feature) => (
            <div
              key={feature?.id}
              className={`glass-card p-6 rounded-xl lift-hover group`}
            >
              {/* District Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Icon name="MapPin" size={12} />
                  {feature?.district}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg gradient-${feature?.color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={feature?.icon} size={24} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {feature?.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {feature?.description}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2">
                {feature?.highlights?.map((highlight, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-card border border-border text-muted-foreground"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;