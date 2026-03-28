import React from 'react';
import Icon from '../../../components/AppIcon';

const StatisticsPanel = ({ statistics }) => {
  const stats = [
    {
      id: 'lyrics',
      label: 'Total Lyrics',
      value: statistics?.totalLyrics || 0,
      icon: 'FileText',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'chords',
      label: 'Chord Progressions',
      value: statistics?.totalChords || 0,
      icon: 'Music',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'presets',
      label: 'Saved Presets',
      value: statistics?.totalPresets || 0,
      icon: 'Bookmark',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 'streak',
      label: 'Creative Streak',
      value: `${statistics?.creativeStreak || 0} days`,
      icon: 'Flame',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    }
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary p-2 flex items-center justify-center">
          <Icon name="BarChart3" size={20} color="white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Statistics</h3>
          <p className="text-xs text-muted-foreground">Your creative metrics</p>
        </div>
      </div>

      <div className="space-y-4">
        {stats?.map((stat) => (
          <div
            key={stat?.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${stat?.bgColor} p-2 flex items-center justify-center`}>
              <Icon name={stat?.icon} size={18} className={stat?.color} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{stat?.label}</p>
              <p className="text-lg font-bold text-foreground">{stat?.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Productivity</span>
          <span className="text-sm font-semibold text-foreground">85%</span>
        </div>
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-primary rounded-full" style={{ width: '85%' }} />
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;