import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import FeatureShowcase from './components/FeatureShowcase';
import CallToAction from './components/CallToAction';
import Icon from '../../components/AppIcon';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleEnterDashboard = () => {
    navigate('/creative-dashboard');
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-[1000] glass-card border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/landing-page')}>
            <div className="w-8 h-8 rounded-lg gradient-primary p-1.5 flex items-center justify-center">
              <Icon name="Sparkles" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Lyrical Metaverse
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSignIn}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 rounded-lg focus-ring"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="px-4 py-2 text-sm font-medium text-white gradient-primary rounded-lg lift-hover focus-ring"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection 
          onGetStarted={handleGetStarted}
          onSignIn={handleSignIn}
        />
        <FeatureShowcase />
        <CallToAction onEnterDashboard={handleEnterDashboard} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-card/30 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary p-1.5 flex items-center justify-center">
                  <Icon name="Sparkles" size={20} className="text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  Lyrical Metaverse
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered creative tools for lyricists, songwriters, and creative minds.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Poetic Vernacular
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Soulful MasterVerse
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    808 Back Beat Boulevard
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Creative Tools
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Community</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Lyrical Metaverse by BlackTop Entertainment. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;