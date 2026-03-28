import React from 'react';
import { FolderOpen, Users, Share2, Mail } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const ProjectStats = ({ totalProjects, ownedProjects, sharedProjects, pendingInvites, onShowInvites }) => {
  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: FolderOpen,
      color: 'cyan'
    },
    {
      label: 'Owned by Me',
      value: ownedProjects,
      icon: Users,
      color: 'yellow'
    },
    {
      label: 'Shared with Me',
      value: sharedProjects,
      icon: Share2,
      color: 'blue'
    },
    {
      label: 'Pending Invites',
      value: pendingInvites,
      icon: Mail,
      color: 'purple',
      onClick: onShowInvites,
      clickable: pendingInvites > 0
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: 'bg-cyan-500/20 text-cyan-500',
      yellow: 'bg-yellow-500/20 text-yellow-500',
      blue: 'bg-blue-500/20 text-blue-500',
      purple: 'bg-purple-500/20 text-purple-500'
    };
    return colors?.[color] || colors?.cyan;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats?.map((stat) => {
        const Icon = stat?.icon;
        const isClickable = stat?.clickable;
        return (
          <div
            key={stat?.label}
            onClick={isClickable ? stat?.onClick : undefined}
            className={`bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg p-6 ${
              isClickable ? 'cursor-pointer hover:border-cyan-500/50 transition-all duration-300' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(stat?.color)}`}>
                <Icon className="h-6 w-6" />
              </div>
              {isClickable && (
                <span className="px-2 py-1 text-xs font-bold bg-red-500/20 text-red-500 rounded animate-pulse">
                  New
                </span>
              )}
            </div>
            <p className="text-3xl font-black text-white mb-1">{stat?.value}</p>
            <p className="text-sm text-gray-400">{stat?.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectStats;
