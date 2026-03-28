import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, Edit, Eye, Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ProjectCard = ({ project, isOwner, viewMode, onRefresh }) => {
  const navigate = useNavigate();

  const getRoleBadge = () => {
    if (isOwner) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-yellow-500/20 text-yellow-500 rounded">
          <Crown className="h-3 w-3" />
          Owner
        </span>
      );
    }
    const userPermission = project?.permissions?.find(p => p?.userId === project?.ownerId);
    if (userPermission?.role === 'editor') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-cyan-500/20 text-cyan-500 rounded">
          <Edit className="h-3 w-3" />
          Editor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-gray-500/20 text-gray-400 rounded">
        <Eye className="h-3 w-3" />
        Viewer
      </span>
    );
  };

  const getProjectTypeColor = (type) => {
    switch (type) {
      case 'lyric':
        return 'bg-purple-500/20 text-purple-500';
      case 'chord_progression':
        return 'bg-blue-500/20 text-blue-500';
      case 'drum_pattern':
        return 'bg-orange-500/20 text-orange-500';
      case 'mixed':
        return 'bg-cyan-500/20 text-cyan-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatProjectType = (type) => {
    return type?.replace('_', ' ')?.split(' ')?.map(w => w?.charAt(0)?.toUpperCase() + w?.slice(1))?.join(' ');
  };

  const collaboratorCount = (project?.permissions?.length || 0) + 1;
  const recentActivityCount = project?.recentActivity?.length || 0;

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => navigate(`/collaborative-project-workspace?id=${project?.id}`)}
        className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {getRoleBadge()}
              <span className={`px-2 py-1 text-xs font-bold rounded ${getProjectTypeColor(project?.projectType)}`}>
                {formatProjectType(project?.projectType)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-500 transition-colors">
              {project?.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {project?.description || 'No description provided'}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{collaboratorCount} {collaboratorCount === 1 ? 'member' : 'members'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>{recentActivityCount} activities</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDistanceToNow(new Date(project?.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <div className="flex -space-x-2">
            {project?.owner && (
              <img
                src={project?.owner?.avatar_url || '/assets/images/no_image.png'}
                alt={project?.owner?.full_name || 'Owner'}
                className="w-10 h-10 rounded-full border-2 border-black object-cover"
                title={project?.owner?.full_name}
              />
            )}
            {project?.permissions?.slice(0, 3)?.map((perm, idx) => (
              <img
                key={idx}
                src={perm?.user?.avatar_url || '/assets/images/no_image.png'}
                alt={perm?.user?.full_name || 'Collaborator'}
                className="w-10 h-10 rounded-full border-2 border-black object-cover"
                title={perm?.user?.full_name}
              />
            ))}
            {collaboratorCount > 4 && (
              <div className="w-10 h-10 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                +{collaboratorCount - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/collaborative-project-workspace?id=${project?.id}`)}
      className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {getRoleBadge()}
        <span className={`px-2 py-1 text-xs font-bold rounded ${getProjectTypeColor(project?.projectType)}`}>
          {formatProjectType(project?.projectType)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-500 transition-colors">
        {project?.title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
        {project?.description || 'No description provided'}
      </p>

      {/* Collaborators */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          {project?.owner && (
            <img
              src={project?.owner?.avatar_url || '/assets/images/no_image.png'}
              alt={project?.owner?.full_name || 'Owner'}
              className="w-8 h-8 rounded-full border-2 border-black object-cover"
              title={project?.owner?.full_name}
            />
          )}
          {project?.permissions?.slice(0, 2)?.map((perm, idx) => (
            <img
              key={idx}
              src={perm?.user?.avatar_url || '/assets/images/no_image.png'}
              alt={perm?.user?.full_name || 'Collaborator'}
              className="w-8 h-8 rounded-full border-2 border-black object-cover"
              title={perm?.user?.full_name}
            />
          ))}
          {collaboratorCount > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-xs font-bold text-white">
              +{collaboratorCount - 3}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {collaboratorCount} {collaboratorCount === 1 ? 'member' : 'members'}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/10">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(project?.updatedAt), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span>{recentActivityCount} activities</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
