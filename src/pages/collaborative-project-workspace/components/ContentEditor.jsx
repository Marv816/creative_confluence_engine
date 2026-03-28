import React, { useState } from 'react';
import { FileText, Music, Drum, Plus, Trash2 } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const ContentEditor = ({ content, projectType, canEdit, onChange, activeUsers }) => {
  const [activeTab, setActiveTab] = useState('lyrics');

  const handleAddItem = (type) => {
    const newContent = { ...content };
    if (!newContent?.[type]) newContent[type] = [];
    
    const newItem = {
      id: Date.now()?.toString(),
      content: '',
      author: null,
      createdAt: new Date()?.toISOString()
    };
    
    newContent[type] = [...newContent?.[type], newItem];
    onChange(newContent);
  };

  const handleUpdateItem = (type, itemId, newValue) => {
    const newContent = { ...content };
    const itemIndex = newContent?.[type]?.findIndex(item => item?.id === itemId);
    if (itemIndex !== -1) {
      newContent[type][itemIndex] = {
        ...newContent?.[type]?.[itemIndex],
        content: newValue,
        updatedAt: new Date()?.toISOString()
      };
      onChange(newContent);
    }
  };

  const handleDeleteItem = (type, itemId) => {
    const newContent = { ...content };
    newContent[type] = newContent?.[type]?.filter(item => item?.id !== itemId);
    onChange(newContent);
  };

  const tabs = [
    { id: 'lyrics', label: 'Lyrics', icon: FileText, visible: ['lyric', 'mixed']?.includes(projectType) },
    { id: 'chords', label: 'Chords', icon: Music, visible: ['chord_progression', 'mixed']?.includes(projectType) },
    { id: 'drums', label: 'Drums', icon: Drum, visible: ['drum_pattern', 'mixed']?.includes(projectType) }
  ]?.filter(tab => tab?.visible);

  const renderContent = () => {
    const items = content?.[activeTab] || [];

    return (
      <div className="space-y-4">
        {items?.map((item, index) => (
          <div
            key={item?.id}
            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-sm font-bold text-gray-400">
                {activeTab === 'lyrics' ? `Verse ${index + 1}` : `Section ${index + 1}`}
              </span>
              {canEdit && (
                <button
                  onClick={() => handleDeleteItem(activeTab, item?.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              )}
            </div>
            <textarea
              value={item?.content}
              onChange={(e) => handleUpdateItem(activeTab, item?.id, e?.target?.value)}
              disabled={!canEdit}
              placeholder={`Enter ${activeTab} content...`}
              rows={activeTab === 'lyrics' ? 8 : 4}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        ))}

        {canEdit && (
          <button
            onClick={() => handleAddItem(activeTab)}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:border-cyan-500/50 hover:text-cyan-500 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            Add {activeTab === 'lyrics' ? 'Verse' : 'Section'}
          </button>
        )}

        {items?.length === 0 && !canEdit && (
          <div className="text-center py-12">
            <p className="text-gray-500">No {activeTab} content yet</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-black/30">
        {tabs?.map((tab) => {
          const Icon = tab?.icon;
          return (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
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

      {/* Content Area */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ContentEditor;
