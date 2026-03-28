import React, { useState } from 'react';
import { projectCollaborationService } from '../../../services/projectCollaborationService';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const InvitationForm = ({ projectId, isOwner, onInvitationSent }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!isOwner) {
      setError('Only project owners can send invitations');
      return;
    }

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await projectCollaborationService?.sendInvitation({
        projectId,
        inviteeEmail: email,
        role,
        message
      });

      setSuccess(true);
      setEmail('');
      setMessage('');
      setRole('viewer');
      
      if (onInvitationSent) {
        onInvitationSent();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <div className="flex items-center gap-3 text-yellow-500">
          <Icon name="Lock" size={24} />
          <p className="text-lg">Only project owners can send invitations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
          <Icon name="Mail" size={20} className="text-cyan-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Send Invitation</h2>
          <p className="text-sm text-gray-400">Invite collaborators to join your project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e?.target?.value)}
            placeholder="collaborator@example.com"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Role *
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e?.target?.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="viewer" className="bg-gray-900">Viewer - Can view project content</option>
            <option value="editor" className="bg-gray-900">Editor - Can edit and contribute</option>
            <option value="owner" className="bg-gray-900">Owner - Full control (transfer ownership)</option>
          </select>
        </div>

        {/* Custom Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Personal Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e?.target?.value)}
            placeholder="Add a personal message to your invitation..."
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <Icon name="AlertCircle" size={20} className="text-red-500" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Icon name="CheckCircle" size={20} className="text-green-500" />
            <p className="text-green-500 text-sm">Invitation sent successfully!</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
          iconName="Send"
          iconPosition="right"
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </form>
    </div>
  );
};

export default InvitationForm;