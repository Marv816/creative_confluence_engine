import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeedSidebar = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      lyric: 'FileText',
      chord: 'Music',
      preset: 'Bookmark',
      concept: 'Lightbulb',
      wordplay: 'Zap'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      lyric: 'text-primary',
      chord: 'text-accent',
      preset: 'text-secondary',
      concept: 'text-yellow-400',
      wordplay: 'text-cyan-400'
    };
    return colors?.[type] || 'text-muted-foreground';
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
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return activityTime?.toLocaleDateString();
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-accent p-2 flex items-center justify-center">
          <Icon name="Activity" size={20} color="white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">{activities?.length} items</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Inbox" size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          activities?.map((activity) => (
            <div
              key={activity?.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg bg-muted/50 p-1.5 flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity?.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {activity?.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {formatTimestamp(activity?.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeedSidebar;