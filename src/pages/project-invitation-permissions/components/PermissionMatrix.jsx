import React from 'react';
import Icon from '../../../components/AppIcon';

const PermissionMatrix = () => {
  const permissions = [
    {
      category: 'Project Management',
      items: [
        { action: 'View project details', owner: true, editor: true, viewer: true },
        { action: 'Edit project settings', owner: true, editor: false, viewer: false },
        { action: 'Delete project', owner: true, editor: false, viewer: false },
        { action: 'Manage project visibility', owner: true, editor: false, viewer: false }
      ]
    },
    {
      category: 'Content Creation',
      items: [
        { action: 'View lyrics/chords/drums', owner: true, editor: true, viewer: true },
        { action: 'Create new content', owner: true, editor: true, viewer: false },
        { action: 'Edit existing content', owner: true, editor: true, viewer: false },
        { action: 'Delete content', owner: true, editor: true, viewer: false }
      ]
    },
    {
      category: 'Collaboration',
      items: [
        { action: 'Send invitations', owner: true, editor: false, viewer: false },
        { action: 'View member list', owner: true, editor: true, viewer: true },
        { action: 'Modify member roles', owner: true, editor: false, viewer: false },
        { action: 'Remove members', owner: true, editor: false, viewer: false }
      ]
    },
    {
      category: 'Real-Time Features',
      items: [
        { action: 'View live changes', owner: true, editor: true, viewer: true },
        { action: 'Make live edits', owner: true, editor: true, viewer: false },
        { action: 'Comment on content', owner: true, editor: true, viewer: true },
        { action: 'Access version history', owner: true, editor: true, viewer: true }
      ]
    },
    {
      category: 'Sharing & Export',
      items: [
        { action: 'Share project publicly', owner: true, editor: false, viewer: false },
        { action: 'Export content', owner: true, editor: true, viewer: true },
        { action: 'Download MIDI/audio', owner: true, editor: true, viewer: true },
        { action: 'Generate share links', owner: true, editor: true, viewer: false }
      ]
    }
  ];

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

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'text-purple-500';
      case 'editor':
        return 'text-cyan-500';
      case 'viewer':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
          <Icon name="Shield" size={20} className="text-cyan-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Permission Matrix</h2>
          <p className="text-sm text-gray-400">Detailed capabilities for each role level</p>
        </div>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Crown" size={20} className="text-purple-500" />
            <h3 className="text-white font-semibold">Owner</h3>
          </div>
          <p className="text-sm text-gray-400">Full control over project, members, and all content. Can transfer ownership.</p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Edit" size={20} className="text-cyan-500" />
            <h3 className="text-white font-semibold">Editor</h3>
          </div>
          <p className="text-sm text-gray-400">Can create, edit, and delete content. View all project details and members.</p>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Eye" size={20} className="text-gray-400" />
            <h3 className="text-white font-semibold">Viewer</h3>
          </div>
          <p className="text-sm text-gray-400">Read-only access. Can view content, export, and comment but cannot edit.</p>
        </div>
      </div>

      {/* Permission Table */}
      <div className="space-y-6">
        {permissions?.map((category, idx) => (
          <div key={idx} className="bg-white/5 rounded-lg overflow-hidden">
            <div className="bg-white/10 px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold">{category?.category}</h3>
            </div>
            <div className="divide-y divide-white/10">
              {category?.items?.map((item, itemIdx) => (
                <div key={itemIdx} className="px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-1">
                      <p className="text-gray-300 text-sm">{item?.action}</p>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-3 gap-4">
                      {/* Owner */}
                      <div className="flex items-center justify-center">
                        {item?.owner ? (
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle" size={16} className="text-green-500" />
                            <span className="text-xs text-green-500 font-medium">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Icon name="XCircle" size={16} className="text-red-500" />
                            <span className="text-xs text-red-500 font-medium">No</span>
                          </div>
                        )}
                      </div>
                      {/* Editor */}
                      <div className="flex items-center justify-center">
                        {item?.editor ? (
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle" size={16} className="text-green-500" />
                            <span className="text-xs text-green-500 font-medium">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Icon name="XCircle" size={16} className="text-red-500" />
                            <span className="text-xs text-red-500 font-medium">No</span>
                          </div>
                        )}
                      </div>
                      {/* Viewer */}
                      <div className="flex items-center justify-center">
                        {item?.viewer ? (
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle" size={16} className="text-green-500" />
                            <span className="text-xs text-green-500 font-medium">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Icon name="XCircle" size={16} className="text-red-500" />
                            <span className="text-xs text-red-500 font-medium">No</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-cyan-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold mb-2">Permission Notes</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Project owners can transfer ownership to another member</li>
              <li>• Editors have full content creation rights but cannot manage members</li>
              <li>• Viewers can export and download content for personal use</li>
              <li>• All roles can access real-time collaboration features</li>
              <li>• Permission changes take effect immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;