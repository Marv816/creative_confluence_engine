import React, { useState } from 'react';
import { X, Music, FileText, Drum, Layers } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const CreateProjectModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: 'mixed'
  });
  const [loading, setLoading] = useState(false);

  const projectTypes = [
    { value: 'lyric', label: 'Lyrics', icon: FileText, color: 'purple' },
    { value: 'chord_progression', label: 'Chord Progression', icon: Music, color: 'blue' },
    { value: 'drum_pattern', label: 'Drum Pattern', icon: Drum, color: 'orange' },
    { value: 'mixed', label: 'Mixed Project', icon: Layers, color: 'cyan' }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData?.title?.trim()) {
      alert('Please enter a project title');
      return;
    }
    setLoading(true);
    try {
      await onCreate(formData);
    } catch (error) {
      console.error('Create project error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (color) => {
    const colors = {
      purple: 'border-purple-500 bg-purple-500/10 text-purple-500',
      blue: 'border-blue-500 bg-blue-500/10 text-blue-500',
      orange: 'border-orange-500 bg-orange-500/10 text-orange-500',
      cyan: 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
    };
    return colors?.[color] || colors?.cyan;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Create Collaborative Project</h2>
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
              placeholder="Summer Vibes Collaboration"
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
              placeholder="Describe your project and what you want to create together..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-bold text-white mb-3">
              Project Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {projectTypes?.map((type) => {
                const Icon = type?.icon;
                const isSelected = formData?.projectType === type?.value;
                return (
                  <button
                    key={type?.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: type?.value })}
                    className={`p-4 border-2 rounded-lg transition-all duration-300 ${
                      isSelected
                        ? getTypeColor(type?.color)
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-bold">{type?.label}</span>
                  </button>
                );
              })}
            </div>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
