import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PromptCard = ({ prompt, onFavorite, onComplete, onCopyToWorkspace }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(prompt?.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-success';
      case 'intermediate':
        return 'text-warning';
      case 'advanced':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="glass-card p-6 space-y-4 lift-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-muted/50 ${getDifficultyColor(prompt?.difficulty)}`}>
              {prompt?.difficulty?.charAt(0)?.toUpperCase() + prompt?.difficulty?.slice(1)}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Clock" size={14} />
              {prompt?.estimatedTime} min
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Zap" size={14} />
              Challenge: {prompt?.challengeLevel}/5
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{prompt?.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFavorite(prompt?.id)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors focus-ring"
            aria-label={prompt?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Icon
              name={prompt?.isFavorite ? 'Heart' : 'Heart'}
              size={20}
              color={prompt?.isFavorite ? 'var(--color-error)' : 'currentColor'}
              fill={prompt?.isFavorite ? 'var(--color-error)' : 'none'}
            />
          </button>
          <button
            onClick={() => onComplete(prompt?.id)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors focus-ring"
            aria-label={prompt?.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <Icon
              name={prompt?.isCompleted ? 'CheckCircle2' : 'Circle'}
              size={20}
              color={prompt?.isCompleted ? 'var(--color-success)' : 'currentColor'}
            />
          </button>
        </div>
      </div>
      <p className="text-foreground leading-relaxed">{prompt?.content}</p>
      {prompt?.context && (
        <div className="p-4 rounded-lg bg-muted/30 border border-white/5">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Context: </span>
            {prompt?.context}
          </p>
        </div>
      )}
      {prompt?.suggestedApproach && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Suggested Approach:</p>
          <p className="text-sm text-muted-foreground">{prompt?.suggestedApproach}</p>
        </div>
      )}
      {prompt?.constraints && prompt?.constraints?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Optional Constraints:</p>
          <div className="flex flex-wrap gap-2">
            {prompt?.constraints?.map((constraint, index) => (
              <span
                key={index}
                className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {constraint}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          variant="default"
          size="sm"
          iconName="FileText"
          iconPosition="left"
          onClick={() => onCopyToWorkspace(prompt)}
        >
          Copy to Workspace
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName={isCopied ? 'Check' : 'Copy'}
          iconPosition="left"
          onClick={handleCopy}
        >
          {isCopied ? 'Copied!' : 'Copy Text'}
        </Button>
      </div>
    </div>
  );
};

export default PromptCard;