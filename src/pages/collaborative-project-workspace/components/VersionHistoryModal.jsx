import React from 'react';
import { X, History, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const VersionHistoryModal = ({ projectId, versions, onClose, onRestore }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Version History</h2>
            <p className="text-sm text-gray-400 mt-1">
              {versions?.length} {versions?.length === 1 ? 'version' : 'versions'} saved
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {versions?.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <History className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Version History</h3>
              <p className="text-gray-400 text-sm">
                Versions will appear here as you make changes to the project
              </p>
            </div>
          ) : (
            versions?.map((version) => (
              <div
                key={version?.id}
                className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 text-sm font-bold bg-cyan-500/20 text-cyan-500 rounded">
                        Version {version?.versionNumber}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(version?.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-white font-bold mb-1">
                      {version?.changeSummary || 'Content updated'}
                    </p>
                    {version?.user && (
                      <p className="text-sm text-gray-400">
                        by {version?.user?.full_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRestore(version)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 font-bold rounded-lg hover:bg-cyan-500/30 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
