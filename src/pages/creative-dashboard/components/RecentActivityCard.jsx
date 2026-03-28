import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivityCard = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      concept: 'Lightbulb',
      lyric: 'Music',
      wordplay: 'Zap',
      beat: 'Radio',
      mood: 'Palette',
      lingo: 'MessageSquare'
    };
    return icons?.[type] || 'FileText';
  };

  const getActivityColor = (type) => {
    const colors = {
      concept: 'text-generator-indigo',
      lyric: 'text-generator-rose',
      wordplay: 'text-generator-cyan',
      beat: 'text-generator-amber',
      mood: 'text-generator-teal',
      lingo: 'text-generator-purple'
    };
    return colors?.[type] || 'text-primary';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return activityTime?.toLocaleDateString();
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-accent p-2 flex items-center justify-center">
          <Icon name="Activity" size={20} color="white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="space-y-4">
        {activities?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Inbox" size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No recent activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start using generators to see your history</p>
          </div>
        ) : (
          activities?.map((activity) => (
            <div
              key={activity?.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg bg-muted/50 p-1.5 flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity?.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity?.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{formatTimestamp(activity?.timestamp)}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;