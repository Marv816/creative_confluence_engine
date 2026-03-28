import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentSidebar = ({ 
  documents, 
  activeDocumentId, 
  onSelectDocument, 
  onDeleteDocument,
  onNewDocument,
  isOpen,
  onToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documents?.filter(doc =>
    doc?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 glass-card border-r-0 rounded-r-lg p-3 hover:bg-muted/50 transition-colors lg:hidden"
        aria-label="Open Documents"
      >
        <Icon name="FileText" size={20} />
      </button>
    );
  }

  return (
    <div className="w-full lg:w-64 glass-card border-r border-white/10 flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="FolderOpen" size={20} />
            Documents
          </h3>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors lg:hidden"
            aria-label="Close Documents"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {filteredDocuments?.length > 0 ? (
          <div className="space-y-1">
            {filteredDocuments?.map((doc) => (
              <div
                key={doc?.id}
                className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                  activeDocumentId === doc?.id
                    ? 'bg-primary/20 border border-primary/30' :'hover:bg-muted/30'
                }`}
                onClick={() => onSelectDocument(doc?.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate mb-1">
                      {doc?.title || 'Untitled'}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{doc?.wordCount} words</span>
                      <span>{doc?.lastModified}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      onDeleteDocument(doc?.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 transition-all"
                    aria-label="Delete document"
                  >
                    <Icon name="Trash2" size={14} className="text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No documents found</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-white/10">
        <Button
          variant="default"
          fullWidth
          iconName="FilePlus"
          iconPosition="left"
          onClick={onNewDocument}
        >
          New Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentSidebar;