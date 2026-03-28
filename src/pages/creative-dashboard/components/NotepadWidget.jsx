import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotepadWidget = () => {
  const navigate = useNavigate();
  const [noteContent, setNoteContent] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedNote = localStorage.getItem('creative_notepad_content');
    const savedTime = localStorage.getItem('creative_notepad_last_saved');
    
    if (savedNote) {
      setNoteContent(savedNote);
    }
    if (savedTime) {
      setLastSaved(new Date(savedTime));
    }
  }, []);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (noteContent?.trim()) {
        setIsSaving(true);
        localStorage.setItem('creative_notepad_content', noteContent);
        const now = new Date();
        localStorage.setItem('creative_notepad_last_saved', now?.toISOString());
        setLastSaved(now);
        
        setTimeout(() => {
          setIsSaving(false);
        }, 500);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [noteContent]);

  const handleOpenWorkspace = () => {
    navigate('/writing-workspace');
  };

  const wordCount = noteContent?.trim()?.split(/\s+/)?.filter(word => word?.length > 0)?.length;

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved yet';
    
    const now = new Date();
    const diffMs = now - lastSaved;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return lastSaved?.toLocaleDateString();
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary p-2 flex items-center justify-center">
            <Icon name="PenTool" size={20} color="white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Notepad</h3>
            <p className="text-xs text-muted-foreground">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <Icon name="Loader2" size={12} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                <span>Last saved: {formatLastSaved()}</span>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="Maximize2"
          onClick={handleOpenWorkspace}
          aria-label="Open full workspace"
        />
      </div>
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e?.target?.value)}
        placeholder="Start writing your ideas here...\n\nYour content auto-saves as you type."
        className="w-full h-40 bg-muted/30 border border-white/10 rounded-lg p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 resize-none"
        aria-label="Quick notepad content"
      />
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="FileText" size={14} />
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Type" size={14} />
            {noteContent?.length} characters
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          iconName="ExternalLink"
          iconPosition="right"
          onClick={handleOpenWorkspace}
        >
          Full Workspace
        </Button>
      </div>
    </div>
  );
};

export default NotepadWidget;