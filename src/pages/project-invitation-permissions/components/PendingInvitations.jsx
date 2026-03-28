import React, { useState } from 'react';
import { projectCollaborationService } from '../../../services/projectCollaborationService';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { format, isPast } from 'date-fns';

const PendingInvitations = ({ invitations, isOwner, onInvitationAction }) => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const getStatusBadge = (invitation) => {
    const isExpired = isPast(new Date(invitation?.expiresAt));
    
    if (isExpired) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-xs font-medium">
          <Icon name="Clock" size={12} />
          Expired
        </span>
      );
    }

    switch (invitation?.status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-medium">
            <Icon name="Clock" size={12} />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/30 rounded-full text-xs font-medium">
            <Icon name="CheckCircle" size={12} />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-xs font-medium">
            <Icon name="XCircle" size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-500';
      case 'editor':
        return 'bg-cyan-500/20 text-cyan-500';
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleResend = async (invitationId) => {
    try {
      setLoading(invitationId);
      setError(null);
      await projectCollaborationService?.resendInvitation(invitationId);
      if (onInvitationAction) {
        onInvitationAction();
      }
    } catch (err) {
      setError(err?.message || 'Failed to resend invitation');
    } finally {
      setLoading(null);
    }
  };

  const pendingInvitations = invitations?.filter(inv => inv?.status === 'pending') || [];
  const otherInvitations = invitations?.filter(inv => inv?.status !== 'pending') || [];

  if (!invitations || invitations?.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Mail" size={32} className="text-gray-500" />
        </div>
        <p className="text-gray-400">No invitations sent yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invitations */}
      {pendingInvitations?.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Pending Invitations</h2>
              <p className="text-sm text-gray-400">{pendingInvitations?.length} awaiting response</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
              <Icon name="AlertCircle" size={20} className="text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {pendingInvitations?.map(invitation => {
              const isExpired = isPast(new Date(invitation?.expiresAt));
              
              return (
                <div
                  key={invitation?.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold truncate">{invitation?.inviteeEmail}</h3>
                        {getStatusBadge(invitation)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className={`px-2 py-1 rounded ${getRoleBadgeColor(invitation?.role)}`}>
                          {invitation?.role}
                        </span>
                        <span>Sent {format(new Date(invitation?.createdAt), 'MMM d, yyyy')}</span>
                        <span>Expires {format(new Date(invitation?.expiresAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {invitation?.message && (
                    <div className="bg-white/5 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-300 italic">"{invitation?.message}"</p>
                    </div>
                  )}

                  {isOwner && isExpired && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResend(invitation?.id)}
                      disabled={loading === invitation?.id}
                      className="text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/10"
                      iconName="RefreshCw"
                      iconPosition="left"
                    >
                      Resend Invitation
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Invitations (Accepted/Rejected) */}
      {otherInvitations?.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
              <Icon name="Archive" size={20} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Invitation History</h2>
              <p className="text-sm text-gray-400">{otherInvitations?.length} completed</p>
            </div>
          </div>

          <div className="space-y-4">
            {otherInvitations?.map(invitation => (
              <div
                key={invitation?.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold truncate">{invitation?.inviteeEmail}</h3>
                      {getStatusBadge(invitation)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className={`px-2 py-1 rounded ${getRoleBadgeColor(invitation?.role)}`}>
                        {invitation?.role}
                      </span>
                      <span>Sent {format(new Date(invitation?.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingInvitations;