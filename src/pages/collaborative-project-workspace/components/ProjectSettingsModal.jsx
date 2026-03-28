import React, { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { collaborativeProjectService } from '../../../services/collaborationService';
import { useNavigate } from 'react-router-dom';

const ProjectSettingsModal = ({ project, onClose, onUpdate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    isActive: project?.isActive !== false
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData?.title?.trim()) {
      alert('Please enter a project title');
      return;
    }

    try {
      setLoading(true);
      const updated = await collaborativeProjectService?.update(project?.id, {
        title: formData?.title,
        description: formData?.description,
        isActive: formData?.isActive
      });
      onUpdate(updated);
    } catch (error) {
      console.error('Update project error:', error);
      alert(error?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await collaborativeProjectService?.delete(project?.id);
      alert('Project deleted successfully');
      navigate('/project-collaboration-hub');
    } catch (error) {
      console.error('Delete project error:', error);
      alert(error?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Project Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData?.title}
              onChange={(e) => setFormData({ ...formData, title: e?.target?.value })}
              placeholder="Project title"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Description
            </label>
            <textarea
              value={formData?.description}
              onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
              placeholder="Project description"
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-bold">Active Status</p>
              <p className="text-sm text-gray-400 mt-1">
                Inactive projects are hidden from collaborators
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData?.isActive })}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                formData?.isActive ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData?.isActive ? 'transform translate-x-7' : ''
                }`}
              />
            </button>
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
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="p-6 border-t border-white/10">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-400 mb-4">
              Once you delete a project, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-500 font-bold rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;
