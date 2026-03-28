import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SeedWordInput = ({ 
  seedWord, 
  onSeedWordChange, 
  onGenerate, 
  isLoading, 
  error 
}) => {
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (seedWord?.trim()) {
      onGenerate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-400 p-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Seed Word Explorer</h2>
            <p className="text-sm text-muted-foreground">Enter a word to discover semantic connections</p>
          </div>
        </div>

        <Input
          label="Seed Word"
          type="text"
          placeholder="Enter a word (e.g., freedom, ocean, rhythm)"
          value={seedWord}
          onChange={(e) => onSeedWordChange(e?.target?.value)}
          error={error}
          required
          className="mb-4"
          description="Start with any word that inspires you"
        />

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          iconName="Sparkles"
          iconPosition="left"
          disabled={!seedWord?.trim() || isLoading}
        >
          {isLoading ? 'Generating Word Web...' : 'Generate Concept Map'}
        </Button>
      </div>
    </form>
  );
};

export default SeedWordInput;