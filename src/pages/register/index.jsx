import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import RegistrationHeader from './components/RegistrationHeader';
import RegistrationForm from './components/RegistrationForm';
import FeatureHighlights from './components/FeatureHighlights';

const Register = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRegistrationSuccess = (userData) => {
    setRegistrationSuccess(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  return (
    <>
      <Helmet>
        <title>Register - Lyrical Metaverse</title>
        <meta
          name="description"
          content="Create your account and join the Lyrical Metaverse community. Access AI-powered tools for music production, lyric writing, and creative content generation."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl shadow-2xl animate-fade-in">
            <RegistrationHeader />
            <RegistrationForm onSuccess={handleRegistrationSuccess} />
            <FeatureHighlights />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our commitment to protecting your creative work and personal data.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;