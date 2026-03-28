import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WordWebVisualization = ({ seedWord, connections, onWordClick, onCopyToClipboard }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleNodeClick = (word) => {
    setSelectedNode(word);
    if (onWordClick) {
      onWordClick(word);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  };

  const handleCopy = (word) => {
    navigator.clipboard?.writeText(word?.word);
    if (onCopyToClipboard) {
      onCopyToClipboard(word?.word);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength >= 80) return 'from-emerald-500 to-teal-500';
    if (strength >= 60) return 'from-cyan-500 to-blue-500';
    if (strength >= 40) return 'from-indigo-500 to-purple-500';
    return 'from-purple-400 to-pink-500';
  };

  const getStrengthLabel = (strength) => {
    if (strength >= 80) return 'Very Strong';
    if (strength >= 60) return 'Strong';
    if (strength >= 40) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="Network" size={24} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Concept Web</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="ZoomOut"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.6}
          />
          <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconName="ZoomIn"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2}
          />
        </div>
      </div>
      <div className="relative bg-muted/30 rounded-lg p-8 overflow-hidden min-h-[400px] lg:min-h-[500px]">
        <div 
          className="transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative glass-card px-8 py-4 rounded-full border-2 border-primary">
                <span className="text-xl font-bold text-foreground">{seedWord}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl">
              {connections?.map((connection, index) => (
                <div
                  key={index}
                  className="relative group animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <button
                    onClick={() => handleNodeClick(connection)}
                    className={`relative w-full glass-card p-4 rounded-lg border transition-all duration-300 lift-hover focus-ring ${
                      selectedNode?.word === connection?.word
                        ? 'border-primary shadow-lg shadow-primary/20'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground text-left">
                        {connection?.word}
                      </span>
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleCopy(connection);
                        }}
                        className="p-1 rounded hover:bg-muted/50 transition-colors"
                        aria-label={`Copy ${connection?.word}`}
                      >
                        <Icon name="Copy" size={14} className="text-muted-foreground" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getStrengthColor(connection?.strength)} transition-all duration-500`}
                          style={{ width: `${connection?.strength}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {connection?.strength}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {getStrengthLabel(connection?.strength)}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {connection?.category}
                      </span>
                    </div>

                    {connection?.partOfSpeech && (
                      <div className="mt-2 text-xs text-muted-foreground italic">
                        {connection?.partOfSpeech}
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedNode && (
        <div className="mt-6 glass-card p-4 border-l-4 border-primary animate-fade-in">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-lg font-semibold text-foreground">{selectedNode?.word}</h4>
              <p className="text-sm text-muted-foreground">{selectedNode?.partOfSpeech}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={() => setSelectedNode(null)}
            />
          </div>
          <p className="text-sm text-foreground mt-3">{selectedNode?.contextExample}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Category:</span>
            <span className="text-xs text-primary font-medium">{selectedNode?.category}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordWebVisualization;