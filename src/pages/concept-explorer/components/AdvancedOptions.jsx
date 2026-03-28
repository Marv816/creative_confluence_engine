import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const AdvancedOptions = ({ options, onOptionsChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStrengthChange = (value) => {
    onOptionsChange({ ...options, associationStrength: parseInt(value) });
  };

  const handleQuantityChange = (value) => {
    onOptionsChange({ ...options, outputQuantity: parseInt(value) });
  };

  const handleCategoryToggle = (category) => {
    const newCategories = options?.categories?.includes(category)
      ? options?.categories?.filter(c => c !== category)
      : [...options?.categories, category];
    onOptionsChange({ ...options, categories: newCategories });
  };

  const categories = [
    { id: 'synonyms', label: 'Synonyms', icon: 'Equal' },
    { id: 'antonyms', label: 'Antonyms', icon: 'Minus' },
    { id: 'related', label: 'Related Concepts', icon: 'Link' },
    { id: 'metaphors', label: 'Metaphors', icon: 'Sparkles' },
    { id: 'emotions', label: 'Emotional Associations', icon: 'Heart' },
    { id: 'actions', label: 'Action Words', icon: 'Zap' }
  ];

  return (
    <div className="glass-card p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left focus-ring rounded-lg p-2 -m-2"
      >
        <div className="flex items-center gap-3">
          <Icon name="Settings" size={20} className="text-primary" />
          <span className="font-medium text-foreground">Advanced Options</span>
        </div>
        <Icon 
          name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
          size={20} 
          className="text-muted-foreground transition-transform duration-200"
        />
      </button>
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-fade-in">
          <div>
            <label className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Association Strength</span>
              <span className="text-sm text-primary font-semibold">{options?.associationStrength}%</span>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="10"
              value={options?.associationStrength}
              onChange={(e) => handleStrengthChange(e?.target?.value)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer focus-ring"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${options?.associationStrength}%, var(--color-muted) ${options?.associationStrength}%, var(--color-muted) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Loose</span>
              <span>Tight</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Output Quantity</span>
              <span className="text-sm text-primary font-semibold">{options?.outputQuantity} words</span>
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={options?.outputQuantity}
              onChange={(e) => handleQuantityChange(e?.target?.value)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer focus-ring"
              style={{
                background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${(options?.outputQuantity - 10) * 2.5}%, var(--color-muted) ${(options?.outputQuantity - 10) * 2.5}%, var(--color-muted) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>10</span>
              <span>50</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Category Filters
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories?.map((category) => (
                <Checkbox
                  key={category?.id}
                  label={
                    <div className="flex items-center gap-2">
                      <Icon name={category?.icon} size={16} className="text-primary" />
                      <span>{category?.label}</span>
                    </div>
                  }
                  checked={options?.categories?.includes(category?.id)}
                  onChange={() => handleCategoryToggle(category?.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;