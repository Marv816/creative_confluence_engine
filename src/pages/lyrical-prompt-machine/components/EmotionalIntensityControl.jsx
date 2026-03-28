import React from 'react';
import Icon from '../../../components/AppIcon';

const EmotionalIntensityControl = ({ intensity, onIntensityChange }) => {
  const intensityLevels = [
    { value: 1, label: 'Subtle', icon: 'Droplet', description: 'Gentle and understated emotions' },
    { value: 2, label: 'Moderate', icon: 'Waves', description: 'Balanced emotional expression' },
    { value: 3, label: 'Strong', icon: 'Flame', description: 'Powerful and direct emotions' },
    { value: 4, label: 'Intense', icon: 'Zap', description: 'Raw and overwhelming feelings' },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Emotional Intensity
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {intensityLevels?.map((level) => {
          const isSelected = intensity === level?.value;
          return (
            <button
              key={level?.value}
              onClick={() => onIntensityChange(level?.value)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/10' :'border-white/10 hover:border-white/20 bg-card/40'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon
                  name={level?.icon}
                  size={24}
                  color={isSelected ? 'var(--color-primary)' : 'currentColor'}
                />
                <span className="text-sm font-medium">{level?.label}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {level?.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EmotionalIntensityControl;