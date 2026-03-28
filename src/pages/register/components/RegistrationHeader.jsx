import React from 'react';
import Icon from '../../../components/AppIcon';

const RegistrationHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary p-3 flex items-center justify-center shadow-lg">
          <Icon name="Sparkles" size={32} color="white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2">Join Lyrical Metaverse</h1>
      <p className="text-muted-foreground text-base">
        Start your creative journey with AI-powered tools for music and writing
      </p>
    </div>
  );
};

export default RegistrationHeader;