import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import { Eye, EyeOff, Heart, ArrowLeft, CheckCircle, Shield, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { validateEmail, validateRequired, validatePassword } from '../utils';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [] as string[],
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // First name validation
    const firstNameValidation = validateRequired(formData.first_name.trim(), 'First name');
    if (!firstNameValidation.isValid) {
      newErrors.first_name = firstNameValidation.error || '';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters long';
    }

    // Last name validation
    const lastNameValidation = validateRequired(formData.last_name.trim(), 'Last name');
    if (!lastNameValidation.isValid) {
      newErrors.last_name = lastNameValidation.error || '';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters long';
    }

    // Email validation
    const emailValidation = validateRequired(formData.email, 'Email');
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || '';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordValidation = validateRequired(formData.password, 'Password');
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || '';
    } else {
      const validation = validatePassword(formData.password);
      setPasswordValidation(validation);
      if (!validation.isValid) {
        newErrors.password = 'Password does not meet requirements';
      }
    }

    // Confirm password validation
    const confirmPasswordValidation = validateRequired(formData.confirmPassword, 'Confirm password');
    if (!confirmPasswordValidation.isValid) {
      newErrors.confirmPassword = confirmPasswordValidation.error || '';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    const roleValidation = validateRequired(formData.role, 'Role');
    if (!roleValidation.isValid) {
      newErrors.role = roleValidation.error || '';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const success = await register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <ThemeToggle size="sm" />
          </div>
          <Link to="/" className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">NutriPlan Pro</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join us to start your health journey</p>
        </div>

        {/* Registration Form */}
        <Card padding="md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                placeholder="Enter your first name"
                required
              />
              
              <FormField
                label="Last Name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                placeholder="Enter your last name"
                required
              />
            </div>

            {/* Email Field */}
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email address"
              required
            />

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <FormField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Create a strong password"
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center space-x-1"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <FormField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                  >
                    {showConfirmPassword ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <FormField
              label="Account Type"
              name="role"
              type="select"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              required
              options={[
                { value: 'user', label: 'Regular User' },
                { value: 'admin', label: 'Administrator' }
              ]}
            />

            {/* Password Requirements */}
            {formData.password && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements</h4>
                <div className="space-y-1">
                  {[
                    { condition: formData.password.length >= 8, text: 'At least 8 characters' },
                    { condition: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                    { condition: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
                    { condition: /[0-9]/.test(formData.password), text: 'One number' },
                    { condition: /[^A-Za-z0-9]/.test(formData.password), text: 'One special character' }
                  ].map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {req.condition ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                      )}
                      <span className={`text-sm ${req.condition ? 'text-green-700' : 'text-gray-500'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="mt-6"
            >
              Create Account
            </Button>

            {/* Links */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
