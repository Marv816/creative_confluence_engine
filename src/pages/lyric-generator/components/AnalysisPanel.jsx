import React from 'react';
import { BarChart3, Award } from 'lucide-react';

export default function AnalysisPanel({ analysis }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Flow Analysis</h3>
        <Award className="w-6 h-6 text-yellow-400" />
      </div>

      <div className="bg-gray-900/50 rounded-lg p-6 space-y-4">
        <div className="prose prose-invert max-w-none">
          <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {analysis}
          </pre>
        </div>
      </div>
    </div>
  );
}