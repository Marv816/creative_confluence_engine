import { Upload, X, FileAudio, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';

export default function FileUploadZone({ accept, onFileSelect, file, preview, label, description }) {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const droppedFile = e?.dataTransfer?.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e?.target?.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = accept?.includes('image');
  const isAudio = accept?.includes('audio');

  return (
    <div>
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef?.current?.click()}
          className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all"
        >
          <div className="flex flex-col items-center gap-4">
            {isImage ? (
              <ImageIcon className="h-12 w-12 text-gray-500" />
            ) : (
              <FileAudio className="h-12 w-12 text-gray-500" />
            )}
            <div>
              <p className="text-white font-medium mb-1">{label}</p>
              <p className="text-gray-500 text-sm">{description}</p>
            </div>
            <Upload className="h-6 w-6 text-purple-500" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : isAudio ? (
                <div className="w-16 h-16 bg-purple-500/20 rounded flex items-center justify-center">
                  <FileAudio className="h-8 w-8 text-purple-500" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-purple-500/20 rounded flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-purple-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file?.name}</p>
                <p className="text-gray-500 text-sm">
                  {(file?.size / 1024 / 1024)?.toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}