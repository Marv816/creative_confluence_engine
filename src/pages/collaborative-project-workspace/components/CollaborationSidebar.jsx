import React, { useState } from 'react';
import { Activity, Users, Crown, Edit, Eye, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { projectPermissionService } from '../../../services/collaborationService';
import Icon from '../../../components/AppIcon';


const CollaborationSidebar = ({ project, activity, activeUsers, isOwner, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('activity');
  const [removingPermission, setRemovingPermission] = useState(null);

  const handleRemoveCollaborator = async (permissionId) => {
    if (!confirm('Remove this collaborator from the project?')) return;
    
    try {
      setRemovingPermission(permissionId);
      await projectPermissionService?.removeCollaborator(permissionId);
      onRefresh();
    } catch (error) {
      console.error('Remove collaborator error:', error);
      alert(error?.message || 'Failed to remove collaborator');
    } finally {
      setRemovingPermission(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'editor':
        return <Edit className="h-3 w-3" />;
      case 'viewer':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'editor':
        return 'bg-cyan-500/20 text-cyan-500';
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getActivityIcon = (type) => {
    return <Activity className="h-4 w-4" />;
  };

  const formatActivityMessage = (activityItem) => {
    const userName = activityItem?.user?.full_name || 'Someone';
    switch (activityItem?.activityType) {
      case 'created':
        return `${userName} created the project`;
      case 'updated':
        return `${userName} updated the content`;
      case 'shared':
        return `${userName} shared the project`;
      case 'invited':
        return `${userName} invited a collaborator`;
      case 'joined':
        return `${userName} joined the project`;
      case 'left':
        return `${userName} left the project`;
      case 'permission_changed':
        return `${userName} changed permissions`;
      case 'comment_added':
        return `${userName} added a comment`;
      default:
        return `${userName} made changes`;
    }
  };

  const tabs = [
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'members', label: 'Members', icon: Users }
  ];

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
      {/* Tabs */}
      <div className="flex items-center border-b border-white/10 bg-black/30">
        {tabs?.map((tab) => {
          const Icon = tab?.icon;
          return (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold transition-all duration-300 ${
                activeTab === tab?.id
                  ? 'bg-cyan-500 text-black' :'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab?.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {activity?.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No activity yet</p>
              </div>
            ) : (
              activity?.map((item) => (
                <div
                  key={item?.id}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    {getActivityIcon(item?.activityType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      {formatActivityMessage(item)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(item?.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-3">
            {/* Owner */}
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={project?.owner?.avatar_url || '/assets/images/no_image.png'}
                    alt={project?.owner?.full_name || 'Owner'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {activeUsers?.some(u => u?.userId === project?.ownerId) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {project?.owner?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {project?.owner?.email}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded ${getRoleColor('owner')}`}>
                  {getRoleIcon('owner')}
                  Owner
                </span>
              </div>
            </div>

            {/* Collaborators */}
            {project?.permissions?.map((perm) => (
              <div key={perm?.id} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={perm?.user?.avatar_url || '/assets/images/no_image.png'}
                      alt={perm?.user?.full_name || 'Collaborator'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {activeUsers?.some(u => u?.userId === perm?.user?.id) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {perm?.user?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {perm?.user?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded ${getRoleColor(perm?.role)}`}>
                      {getRoleIcon(perm?.role)}
                      {perm?.role}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(perm?.id)}
                        disabled={removingPermission === perm?.id}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                        title="Remove collaborator"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {project?.permissions?.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No collaborators yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationSidebar;
