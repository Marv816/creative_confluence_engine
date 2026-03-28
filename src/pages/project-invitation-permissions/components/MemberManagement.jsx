import React, { useState } from 'react';
import { projectCollaborationService } from '../../../services/projectCollaborationService';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { format } from 'date-fns';

const MemberManagement = ({ projectId, members, isOwner, currentUserId, onMemberUpdated }) => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'editor':
        return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30';
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return 'Crown';
      case 'editor':
        return 'Edit';
      case 'viewer':
        return 'Eye';
      default:
        return 'User';
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    if (!isOwner) {
      setError('Only project owners can change member roles');
      return;
    }

    try {
      setLoading(memberId);
      setError(null);
      await projectCollaborationService?.updateMemberRole(memberId, newRole);
      if (onMemberUpdated) {
        onMemberUpdated();
      }
    } catch (err) {
      setError(err?.message || 'Failed to update member role');
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!isOwner) {
      setError('Only project owners can remove members');
      return;
    }

    if (!confirm(`Remove ${memberName} from this project?`)) {
      return;
    }

    try {
      setLoading(memberId);
      setError(null);
      await projectCollaborationService?.removeMember(memberId);
      if (onMemberUpdated) {
        onMemberUpdated();
      }
    } catch (err) {
      setError(err?.message || 'Failed to remove member');
    } finally {
      setLoading(null);
    }
  };

  if (!members || members?.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Users" size={32} className="text-gray-500" />
        </div>
        <p className="text-gray-400">No members yet. Send invitations to add collaborators.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
          <Icon name="Users" size={20} className="text-cyan-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Active Members</h2>
          <p className="text-sm text-gray-400">{members?.length} collaborator{members?.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
          <Icon name="AlertCircle" size={20} className="text-red-500" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {members?.map(member => (
          <div
            key={member?.id}
            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Member Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {member?.user?.avatarUrl ? (
                    <img
                      src={member?.user?.avatarUrl}
                      alt={member?.user?.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {member?.user?.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">{member?.user?.fullName}</h3>
                    {member?.userId === currentUserId && (
                      <span className="text-xs text-cyan-500 font-medium">(You)</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{member?.user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {format(new Date(member?.joinedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Role Badge & Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {isOwner && member?.userId !== currentUserId ? (
                  <select
                    value={member?.role}
                    onChange={(e) => handleRoleChange(member?.id, e?.target?.value)}
                    disabled={loading === member?.id}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="viewer" className="bg-gray-900">Viewer</option>
                    <option value="editor" className="bg-gray-900">Editor</option>
                    <option value="owner" className="bg-gray-900">Owner</option>
                  </select>
                ) : (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRoleBadgeColor(member?.role)}`}>
                    <Icon name={getRoleIcon(member?.role)} size={14} />
                    <span className="text-sm font-medium capitalize">{member?.role}</span>
                  </div>
                )}

                {isOwner && member?.userId !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member?.id, member?.user?.fullName)}
                    disabled={loading === member?.id}
                    className="text-red-500 hover:bg-red-500/10"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberManagement;