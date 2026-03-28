import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentHeader = ({ 
  documentTitle, 
  onTitleChange, 
  wordCount, 
  characterCount, 
  lastSaved,
  onExport,
  onNewDocument,
  onSave
}) => {
  return (
    <div className="glass-card border-b border-white/10 p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onTitleChange(e?.target?.value)}
            className="w-full bg-transparent text-2xl font-semibold text-foreground border-none outline-none focus:ring-0 placeholder:text-muted-foreground"
            placeholder="Untitled Document"
          />
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="FileText" size={16} />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Type" size={16} />
              {characterCount} characters
            </span>
            {lastSaved && (
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={16} />
                Saved {lastSaved}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Save"
            iconPosition="left"
            onClick={onSave}
          >
            <span className="hidden lg:inline">Save</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
          >
            <span className="hidden lg:inline">Export</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="FilePlus"
            iconPosition="left"
            onClick={onNewDocument}
          >
            <span className="hidden lg:inline">New</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;