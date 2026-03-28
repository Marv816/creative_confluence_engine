import React from 'react';
import { X, Mail, Check, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const InvitationsPanel = ({ invitations, onClose, onAccept, onDecline }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'text-yellow-500';
      case 'editor':
        return 'text-cyan-500';
      case 'viewer':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Collaboration Invitations</h2>
            <p className="text-sm text-gray-400 mt-1">
              {invitations?.length} pending {invitations?.length === 1 ? 'invitation' : 'invitations'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Invitations List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {invitations?.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Mail className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Pending Invitations</h3>
              <p className="text-gray-400 text-sm">
                You will see collaboration invitations here when someone invites you to their project
              </p>
            </div>
          ) : (
            invitations?.map((invite) => (
              <div
                key={invite?.id}
                className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-cyan-500/30 transition-all duration-300"
              >
                {/* Inviter Info */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={invite?.inviter?.avatar_url || '/assets/images/no_image.png'}
                    alt={invite?.inviter?.full_name || 'Inviter'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold">
                      {invite?.inviter?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-400">
                      invited you to collaborate as{' '}
                      <span className={`font-bold ${getRoleColor(invite?.role)}`}>
                        {invite?.role}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(invite?.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-bold text-white mb-2">
                    {invite?.project?.title}
                  </h4>
                  {invite?.project?.description && (
                    <p className="text-sm text-gray-400 mb-3">
                      {invite?.project?.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-bold bg-cyan-500/20 text-cyan-500 rounded">
                      {invite?.project?.project_type?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Message */}
                {invite?.message && (
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-300 italic">
                      "{invite?.message}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onAccept(invite?.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300"
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => onDecline(invite?.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-500 transition-all duration-300"
                  >
                    <XCircle className="h-4 w-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationsPanel;
