import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';


export default function StickyNotepad({ onSave }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    if (user && autoSaveEnabled && content) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [content, user, autoSaveEnabled]);

  const handleAutoSave = async () => {
    if (!content?.trim()) return;

    try {
      setSaveStatus('Saving...');
      onSave?.(content);
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('Save failed');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all notepad content?')) {
      setContent('');
      onSave?.('');
    }
  };

  const addToNotepad = (text) => {
    const separator = content?.length > 0 && !content?.endsWith('\n') ? '\n\n' : '';
    setContent(prev => prev + separator + text);
  };

  // Expose method to parent
  useEffect(() => {
    if (window) {
      window.addToNotepad = addToNotepad;
    }
  }, [content]);

  return (
    <div className="sticky top-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">✍️ Writing Notepad</h2>
        <Button
          size="xs"
          onClick={handleClear}
          className="bg-red-600 hover:bg-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e?.target?.value)}
        className="flex-1 w-full bg-gray-900/50 rounded-lg p-4 text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
        placeholder={user ? 'Your work is saved automatically...' : 'Sign in to save your work...'}
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {saveStatus || (user ? 'Auto-save enabled' : 'Sign in to save')}
        </span>
        {user && (
          <Button
            size="xs"
            onClick={handleAutoSave}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-3 h-3 mr-1" />
            Save Now
          </Button>
        )}
      </div>
    </div>
  );
}
