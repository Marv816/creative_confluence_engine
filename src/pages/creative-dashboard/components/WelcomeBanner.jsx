import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeBanner = ({ userName = 'Creative' }) => {
  const currentHour = new Date()?.getHours();
  let greeting = 'Good evening';
  
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  }

  return (
    <div className="glass-card p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-primary opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Ready to create something amazing today? Your creative workspace awaits.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
                <Icon name="Zap" size={20} className="text-generator-cyan" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Streak</p>
                  <p className="text-sm font-semibold text-foreground">7 days</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
                <Icon name="FileText" size={20} className="text-generator-purple" />
                <div>
                  <p className="text-xs text-muted-foreground">Words Written</p>
                  <p className="text-sm font-semibold text-foreground">12,847</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
                <Icon name="Award" size={20} className="text-generator-amber" />
                <div>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                  <p className="text-sm font-semibold text-foreground">23 earned</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center w-32 h-32 rounded-full bg-gradient-primary p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <Icon name="Sparkles" size={48} className="text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;