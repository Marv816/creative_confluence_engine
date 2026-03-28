import React from 'react';
import Icon from '../../../components/AppIcon';

const PromptHistory = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Prompts',
      value: stats?.totalPrompts,
      icon: 'FileText',
      color: 'indigo',
    },
    {
      label: 'Completed',
      value: stats?.completed,
      icon: 'CheckCircle2',
      color: 'teal',
    },
    {
      label: 'Favorites',
      value: stats?.favorites,
      icon: 'Heart',
      color: 'rose',
    },
    {
      label: 'Avg. Time',
      value: `${stats?.avgTime} min`,
      icon: 'Clock',
      color: 'amber',
    },
  ];

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Icon name="BarChart3" size={20} />
        Your Progress
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems?.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg bg-muted/30 border border-generator-${item?.color}/20`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon name={item?.icon} size={20} color={`var(--color-generator-${item?.color})`} />
              <span className="text-sm text-muted-foreground">{item?.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{item?.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptHistory;