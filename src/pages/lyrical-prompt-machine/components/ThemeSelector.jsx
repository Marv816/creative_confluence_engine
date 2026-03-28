import React from 'react';
import Icon from '../../../components/AppIcon';

const ThemeSelector = ({ selectedThemes, onThemeToggle }) => {
  const themes = [
    { id: 'love', name: 'Love & Romance', icon: 'Heart', color: 'rose' },
    { id: 'struggle', name: 'Struggle & Triumph', icon: 'Mountain', color: 'indigo' },
    { id: 'party', name: 'Party & Celebration', icon: 'Music', color: 'purple' },
    { id: 'introspection', name: 'Introspection', icon: 'Brain', color: 'teal' },
    { id: 'social', name: 'Social Commentary', icon: 'Users', color: 'cyan' },
    { id: 'nostalgia', name: 'Nostalgia & Memory', icon: 'Clock', color: 'amber' },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Select Themes
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {themes?.map((theme) => {
          const isSelected = selectedThemes?.includes(theme?.id);
          return (
            <button
              key={theme?.id}
              onClick={() => onThemeToggle(theme?.id)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? `border-generator-${theme?.color} bg-generator-${theme?.color}/10`
                  : 'border-white/10 hover:border-white/20 bg-card/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name={theme?.icon}
                  size={20}
                  color={isSelected ? `var(--color-generator-${theme?.color})` : 'currentColor'}
                />
                <span className="text-sm font-medium">{theme?.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;