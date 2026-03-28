import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DemoCredentialsCard = () => {
  const [copied, setCopied] = useState({ email: false, password: false });

  const credentials = {
    email: 'creative.user@example.com',
    password: 'Creative@123'
  };

  const handleCopy = (field) => {
    navigator.clipboard?.writeText(credentials?.[field]);
    setCopied(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  return (
    <div className="glass-card p-4 mb-6 border-l-4 border-accent">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Icon name="Info" size={20} className="text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2">Demo Credentials</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-mono break-all">{credentials?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleCopy('email')}
                iconName={copied?.email ? 'Check' : 'Copy'}
                iconPosition="left"
              >
                {copied?.email ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Password</p>
                <p className="text-sm font-mono">{credentials?.password}</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleCopy('password')}
                iconName={copied?.password ? 'Check' : 'Copy'}
                iconPosition="left"
              >
                {copied?.password ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoCredentialsCard;