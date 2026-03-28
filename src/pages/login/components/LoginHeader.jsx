import React from 'react';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary p-3 flex items-center justify-center shadow-lg">
          <Icon name="Sparkles" size={32} color="white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
      <p className="text-muted-foreground">
        Sign in to access your creative workspace
      </p>
    </div>
  );
};

export default LoginHeader;