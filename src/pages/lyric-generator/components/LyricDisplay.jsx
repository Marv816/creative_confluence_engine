import React, { useState } from 'react';
import { Copy, Download, BarChart3, Save } from 'lucide-react';
import Button from '../../../components/ui/Button';
import LyricTTSPanel from './LyricTTSPanel';

export default function LyricDisplay({ lyrics, onCopy, onDownload, onAnalyze, isAnalyzing, onSave, saveStatus, bpm = 90 }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Generated Lyrics</h3>
        
        <div className="flex gap-2">
          <Button
            onClick={onCopy}
            size="sm"
            className="bg-gray-700 hover:bg-gray-600"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onDownload}
            size="sm"
            className="bg-gray-700 hover:bg-gray-600"
            title="Download as text file"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          {onSave && (
            <Button
              onClick={onSave}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              title="Save lyrics"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
          
          <Button
            onClick={onAnalyze}
            size="sm"
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            title="Analyze flow and rhyme schemes"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      {/* TTS Preview Panel */}
      {lyrics && (
        <div className="mb-4">
          <LyricTTSPanel lyrics={lyrics} bpm={bpm} />
        </div>
      )}

      <div className="bg-gray-900/50 rounded-lg p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        <pre className="text-gray-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {lyrics}
        </pre>
      </div>
    </div>
  );
}