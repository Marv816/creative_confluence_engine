import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { collaborationInviteService } from '../../../services/collaborationService';

const InviteCollaboratorModal = ({ projectId, projectTitle, onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    inviteeEmail: '',
    role: 'editor',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData?.inviteeEmail?.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      await collaborationInviteService?.create({
        projectId,
        inviteeEmail: formData?.inviteeEmail,
        role: formData?.role,
        message: formData?.message
      });
      alert('Invitation sent successfully!');
      onInvite();
    } catch (error) {
      console.error('Send invite error:', error);
      alert(error?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Invite Collaborator</h2>
            <p className="text-sm text-gray-400 mt-1">{projectTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                value={formData?.inviteeEmail}
                onChange={(e) => setFormData({ ...formData, inviteeEmail: e?.target?.value })}
                placeholder="collaborator@example.com"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Role *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'editor' })}
                className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                  formData?.role === 'editor' ?'border-cyan-500 bg-cyan-500/10 text-cyan-500' :'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <p className="font-bold">Editor</p>
                <p className="text-xs mt-1">Can edit content</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'viewer' })}
                className={`p-3 border-2 rounded-lg transition-all duration-300 ${
                  formData?.role === 'viewer' ?'border-cyan-500 bg-cyan-500/10 text-cyan-500' :'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <p className="font-bold">Viewer</p>
                <p className="text-xs mt-1">Can only view</p>
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={formData?.message}
              onChange={(e) => setFormData({ ...formData, message: e?.target?.value })}
              placeholder="Add a personal message to your invitation..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteCollaboratorModal;
