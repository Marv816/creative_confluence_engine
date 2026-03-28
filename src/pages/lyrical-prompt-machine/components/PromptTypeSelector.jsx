import React from 'react';
import { Checkbox, CheckboxGroup } from '../../../components/ui/Checkbox';

const PromptTypeSelector = ({ selectedTypes, onTypeToggle }) => {
  const promptTypes = [
    { id: 'story-starter', label: 'Story Starters', description: 'Opening lines and narrative hooks' },
    { id: 'character', label: 'Character Scenarios', description: 'Persona-based writing prompts' },
    { id: 'conflict', label: 'Conflict Situations', description: 'Tension and resolution themes' },
    { id: 'abstract', label: 'Abstract Concepts', description: 'Philosophical and metaphorical ideas' },
  ];

  return (
    <CheckboxGroup label="Prompt Types" description="Select one or more prompt categories">
      <div className="space-y-3">
        {promptTypes?.map((type) => (
          <Checkbox
            key={type?.id}
            label={type?.label}
            description={type?.description}
            checked={selectedTypes?.includes(type?.id)}
            onChange={(e) => onTypeToggle(type?.id, e?.target?.checked)}
          />
        ))}
      </div>
    </CheckboxGroup>
  );
};

export default PromptTypeSelector;