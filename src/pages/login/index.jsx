import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SocialAuthButtons from './components/SocialAuthButtons';
import RegistrationPrompt from './components/RegistrationPrompt';
import DemoCredentialsCard from './components/DemoCredentialsCard';

const Login = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      navigate('/creative-dashboard');
    }
  }, [navigate]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-card p-8 lg:p-10">
          <LoginHeader />
          
          <DemoCredentialsCard />
          
          <LoginForm onSuccess={handleLoginSuccess} />
          
          <SocialAuthButtons />
          
          <RegistrationPrompt />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;