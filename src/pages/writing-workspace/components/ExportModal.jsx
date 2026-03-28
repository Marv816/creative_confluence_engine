import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportModal = ({ isOpen, onClose, documentTitle, content, wordCount }) => {
  const [exportFormat, setExportFormat] = useState('txt');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { value: 'txt', label: 'Plain Text (.txt)', icon: 'FileText' },
    { value: 'md', label: 'Markdown (.md)', icon: 'FileCode' },
    { value: 'pdf', label: 'PDF Document (.pdf)', icon: 'FileType' },
    { value: 'docx', label: 'Word Document (.docx)', icon: 'FileText' }
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle || 'document'}.${exportFormat}`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="auth-modal-content modal-enter-active max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary p-2 flex items-center justify-center">
              <Icon name="Download" size={20} color="white" />
            </div>
            <h2 className="text-2xl font-semibold">Export Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors focus-ring"
            aria-label="Close modal"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Document Info</h3>
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Title:</span>
                <span className="text-sm font-medium">{documentTitle || 'Untitled'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Word Count:</span>
                <span className="text-sm font-medium">{wordCount} words</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Characters:</span>
                <span className="text-sm font-medium">{content?.length}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Export Format</h3>
            <div className="space-y-2">
              {exportFormats?.map((format) => (
                <button
                  key={format?.value}
                  onClick={() => setExportFormat(format?.value)}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    exportFormat === format?.value
                      ? 'border-primary bg-primary/10' :'border-white/10 hover:border-white/20 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={format?.icon} size={20} />
                    <span className="text-sm font-medium">{format?.label}</span>
                    {exportFormat === format?.value && (
                      <Icon name="Check" size={16} className="ml-auto text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Checkbox
            label="Include metadata (title, word count, date)"
            checked={includeMetadata}
            onChange={(e) => setIncludeMetadata(e?.target?.checked)}
          />

          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              fullWidth
              iconName="Download"
              iconPosition="left"
              onClick={handleExport}
              loading={isExporting}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;