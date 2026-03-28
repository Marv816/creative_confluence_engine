import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const RegistrationForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateUsername = (username) => {
    if (!username) return true;
    if (username?.length < 3) return 'Display name must be at least 3 characters';
    if (username?.length > 20) return 'Display name must not exceed 20 characters';
    if (!/^[a-zA-Z0-9_-]+$/?.test(username)) {
      return 'Display name can only contain letters, numbers, hyphens, and underscores';
    }
    const reservedNames = ['admin', 'root', 'system', 'moderator', 'support'];
    if (reservedNames?.includes(username?.toLowerCase())) {
      return 'This display name is reserved';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password?.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-z]/?.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/?.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/\d/?.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: inputValue }));
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const newErrors = {};
    
    const usernameError = validateUsername(formData?.displayName);
    if (usernameError) newErrors.displayName = usernameError;
    
    const emailError = validateEmail(formData?.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData?.password);
    if (passwordError) newErrors.password = passwordError;
    
    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) {
        onSuccess({
          displayName: formData?.displayName || formData?.email?.split('@')?.[0],
          email: formData?.email
        });
      }
      navigate('/creative-dashboard');
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Display Name (Optional)"
        type="text"
        name="displayName"
        placeholder="Choose a creative username"
        value={formData?.displayName}
        onChange={handleInputChange}
        error={errors?.displayName}
        description="3-20 characters, letters, numbers, hyphens, and underscores only"
        maxLength={20}
      />
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="your.email@example.com"
        value={formData?.email}
        onChange={handleInputChange}
        error={errors?.email}
        required
      />
      <div>
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Create a strong password"
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
        />
        <PasswordStrengthIndicator password={formData?.password} />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-xs text-primary hover:text-primary/80 mt-2 transition-colors focus-ring rounded px-1"
        >
          {showPassword ? 'Hide password' : 'Show password'}
        </button>
      </div>
      <div>
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData?.confirmPassword}
          onChange={handleInputChange}
          error={errors?.confirmPassword}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="text-xs text-primary hover:text-primary/80 mt-2 transition-colors focus-ring rounded px-1"
        >
          {showConfirmPassword ? 'Hide password' : 'Show password'}
        </button>
      </div>
      <div className="space-y-2">
        <Checkbox
          label={
            <span className="text-sm">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:text-primary/80 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:text-primary/80 underline">
                Privacy Policy
              </a>
            </span>
          }
          checked={formData?.agreeToTerms}
          onChange={handleInputChange}
          name="agreeToTerms"
          error={errors?.agreeToTerms}
          required
        />
      </div>
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        iconName="UserPlus"
        iconPosition="left"
        className="mt-6"
      >
        Create Account
      </Button>
      <div className="text-center pt-4 border-t border-white/10">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary hover:text-primary/80 font-medium transition-colors focus-ring rounded px-1"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;