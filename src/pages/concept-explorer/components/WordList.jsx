import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WordList = ({ words, onCopyWord, onSaveToWorkspace, onTransferAll }) => {
  const [copiedWord, setCopiedWord] = useState(null);
  const [sortBy, setSortBy] = useState('strength');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleCopy = (word) => {
    navigator.clipboard?.writeText(word?.word);
    setCopiedWord(word?.word);
    if (onCopyWord) {
      onCopyWord(word?.word);
    }
    setTimeout(() => setCopiedWord(null), 2000);
  };

  const categories = ['all', ...new Set(words.map(w => w.category))];

  const filteredWords = words?.filter(word => 
    filterCategory === 'all' || word?.category === filterCategory
  );

  const sortedWords = [...filteredWords]?.sort((a, b) => {
    if (sortBy === 'strength') return b?.strength - a?.strength;
    if (sortBy === 'alphabetical') return a?.word?.localeCompare(b?.word);
    return 0;
  });

  const getStrengthColor = (strength) => {
    if (strength >= 80) return 'text-emerald-500';
    if (strength >= 60) return 'text-cyan-500';
    if (strength >= 40) return 'text-indigo-500';
    return 'text-purple-400';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name="List" size={24} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Word List</h3>
          <span className="text-sm text-muted-foreground">({sortedWords?.length} words)</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          iconName="Download"
          iconPosition="left"
          onClick={onTransferAll}
        >
          Transfer All
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-2 block">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="w-full glass-card px-4 py-2 rounded-lg border border-white/10 text-sm text-foreground focus-ring"
          >
            <option value="strength">Relevance Score</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-2 block">Filter Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e?.target?.value)}
            className="w-full glass-card px-4 py-2 rounded-lg border border-white/10 text-sm text-foreground focus-ring"
          >
            {categories?.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedWords?.map((word, index) => (
          <div
            key={index}
            className="glass-card p-4 rounded-lg border border-white/10 hover:border-primary/50 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-base font-semibold text-foreground">{word?.word}</h4>
                  <span className={`text-sm font-bold ${getStrengthColor(word?.strength)}`}>
                    {word?.strength}%
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    {word?.partOfSpeech}
                  </span>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                    {word?.category}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  {word?.contextExample}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleCopy(word)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors focus-ring"
                  aria-label={`Copy ${word?.word}`}
                >
                  <Icon 
                    name={copiedWord === word?.word ? 'Check' : 'Copy'} 
                    size={18} 
                    className={copiedWord === word?.word ? 'text-success' : 'text-muted-foreground'}
                  />
                </button>
                <button
                  onClick={() => onSaveToWorkspace(word)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors focus-ring"
                  aria-label={`Save ${word?.word} to workspace`}
                >
                  <Icon name="Save" size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordList;