import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationPrompt = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?
        <button
          onClick={handleRegisterClick}
          className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors focus-ring rounded px-1"
        >
          Create Account
        </button>
      </p>
    </div>
  );
};

export default RegistrationPrompt;