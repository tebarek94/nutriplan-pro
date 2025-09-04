import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Scale, Activity, Target, Heart, Edit, Save, X, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { useAuth as useAuthHook } from '../hooks';
import { validateEmail, validateRequired } from '../utils';
import { formatDate } from '../utils';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { getProfile, updateProfile, updateUserInfo, loading, error, clearError } = useAuthHook();
  
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activity_level: '',
    fitness_goal: '',
    dietary_preferences: '',
    allergies: '',
    medical_conditions: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await getProfile();
      if (profileData) {
        setProfile(profileData);
        const userData = profileData as any;
        const profileInfo = userData.profile || {};
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: profileInfo.phone || '',
          date_of_birth: profileInfo.date_of_birth || '',
          age: profileInfo.age?.toString() || '',
          gender: profileInfo.gender || '',
          height: profileInfo.height?.toString() || '',
          weight: profileInfo.weight?.toString() || '',
          activity_level: profileInfo.activity_level || '',
          fitness_goal: profileInfo.fitness_goal || '',
          dietary_preferences: Array.isArray(profileInfo.dietary_preferences) ? profileInfo.dietary_preferences.join(', ') : '',
          allergies: Array.isArray(profileInfo.allergies) ? profileInfo.allergies.join(', ') : '',
          medical_conditions: profileInfo.medical_conditions || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required fields
    const requiredFields = ['first_name', 'last_name', 'email'];
    requiredFields.forEach(field => {
      const validation = validateRequired(formData[field as keyof typeof formData], field);
      if (!validation.isValid) {
        errors[field] = validation.error || '';
      }
    });
    
    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Age validation
    if (formData.age && (parseInt(formData.age) <= 0 || parseInt(formData.age) > 120)) {
      errors.age = 'Please enter a valid age (1-120 years)';
    }
    
    // Height and weight validation
    if (formData.height && (parseFloat(formData.height) <= 0 || parseFloat(formData.height) > 300)) {
      errors.height = 'Please enter a valid height (1-300 cm)';
    }
    
    if (formData.weight && (parseFloat(formData.weight) <= 0 || parseFloat(formData.weight) > 500)) {
      errors.weight = 'Please enter a valid weight (1-500 kg)';
    }
    
    // Date of birth validation
    if (formData.date_of_birth) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date_of_birth)) {
        errors.date_of_birth = 'Please enter a valid date (YYYY-MM-DD)';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Update user information
      const userInfoSuccess = await updateUserInfo({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      });

      if (!userInfoSuccess) {
        return;
      }

      // Convert comma-separated strings back to arrays for API
      const dietaryPreferences = formData.dietary_preferences 
        ? formData.dietary_preferences.split(',').map(item => item.trim()).filter(item => item)
        : [];
      
      const allergies = formData.allergies 
        ? formData.allergies.split(',').map(item => item.trim()).filter(item => item)
        : [];

      // Update profile information
      const profileSuccess = await updateProfile({
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other' | undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        activity_level: formData.activity_level as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | undefined,
        fitness_goal: formData.fitness_goal as 'weight_loss' | 'maintenance' | 'muscle_gain' | undefined,
        dietary_preferences: dietaryPreferences,
        allergies,
        medical_conditions: formData.medical_conditions,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth
      });

      if (profileSuccess) {
        setEditing(false);
        await loadProfile(); // Reload profile data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormErrors({});
    loadProfile(); // Reset form data
  };

  const calculateBMI = (height: number, weight: number): number => {
    if (height <= 0 || weight <= 0) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateTDEE = (bmr: number, activityLevel: string): number => {
    const multipliers: Record<string, number> = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725,
      'extremely_active': 1.9
    };
    return bmr * (multipliers[activityLevel] || 1.2);
  };

  const bmi = profile?.profile?.height && profile?.profile?.weight 
    ? calculateBMI(profile.profile.height, profile.profile.weight) 
    : 0;

  const age = profile?.profile?.age || (profile?.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0);

  const bmr = profile?.profile?.height && profile?.profile?.weight && age && profile?.profile?.gender
    ? calculateBMR(profile.profile.weight, profile.profile.height, age, profile.profile.gender)
    : 0;

  const tdee = bmr && profile?.profile?.activity_level
    ? calculateTDEE(bmr, profile.profile.activity_level)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              {!editing ? (
                <Button 
                  variant="primary" 
                  onClick={() => setEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      // Create a mock form event for the handleSubmit function
                      const mockEvent = {
                        preventDefault: () => {}
                      } as React.FormEvent;
                      handleSubmit(mockEvent);
                    }}
                    loading={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card title="Personal Information" className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="First Name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  error={formErrors.first_name}
                  required
                  disabled={!editing}
                />
                
                <FormField
                  label="Last Name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  error={formErrors.last_name}
                  required
                  disabled={!editing}
                />
                
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={formErrors.email}
                  required
                  disabled={!editing}
                />
                
                <FormField
                  label="Phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={formErrors.phone}
                  disabled={!editing}
                />
                
                <FormField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  error={formErrors.date_of_birth}
                  disabled={!editing}
                />
                
                <FormField
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  error={formErrors.age}
                  disabled={!editing}
                  placeholder="25"
                />
                
                <FormField
                  label="Gender"
                  name="gender"
                  type="select"
                  value={formData.gender}
                  onChange={handleInputChange}
                  error={formErrors.gender}
                  disabled={!editing}
                  options={[
                    { value: '', label: 'Select gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </div>
            </Card>

            {/* Health Information */}
            <Card title="Health Information">
              <div className="space-y-6">
                <FormField
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  error={formErrors.height}
                  disabled={!editing}
                  placeholder="170"
                />
                
                <FormField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  error={formErrors.weight}
                  disabled={!editing}
                  placeholder="70"
                />
                
                <FormField
                  label="Activity Level"
                  name="activity_level"
                  type="select"
                  value={formData.activity_level}
                  onChange={handleInputChange}
                  error={formErrors.activity_level}
                  disabled={!editing}
                  options={[
                    { value: '', label: 'Select activity level' },
                    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
                    { value: 'lightly_active', label: 'Lightly active (light exercise 1-3 days/week)' },
                    { value: 'moderately_active', label: 'Moderately active (moderate exercise 3-5 days/week)' },
                    { value: 'very_active', label: 'Very active (hard exercise 6-7 days/week)' },
                    { value: 'extremely_active', label: 'Extremely active (very hard exercise, physical job)' }
                  ]}
                />
                
                <FormField
                  label="Fitness Goals"
                  name="fitness_goal"
                  type="select"
                  value={formData.fitness_goal}
                  onChange={handleInputChange}
                  error={formErrors.fitness_goal}
                  disabled={!editing}
                  options={[
                    { value: '', label: 'Select fitness goal' },
                    { value: 'weight_loss', label: 'Weight Loss' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'muscle_gain', label: 'Muscle Gain' }
                  ]}
                />
              </div>
            </Card>

            {/* Dietary Preferences */}
            <Card title="Dietary Preferences">
              <div className="space-y-6">
                <FormField
                  label="Dietary Preferences"
                  name="dietary_preferences"
                  type="textarea"
                  value={formData.dietary_preferences}
                  onChange={handleInputChange}
                  error={formErrors.dietary_preferences}
                  disabled={!editing}
                  placeholder="e.g., vegetarian, vegan, keto, paleo"
                />
                
                <FormField
                  label="Allergies"
                  name="allergies"
                  type="textarea"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  error={formErrors.allergies}
                  disabled={!editing}
                  placeholder="e.g., nuts, dairy, gluten"
                />
                
                <FormField
                  label="Medical Conditions"
                  name="medical_conditions"
                  type="textarea"
                  value={formData.medical_conditions}
                  onChange={handleInputChange}
                  error={formErrors.medical_conditions}
                  disabled={!editing}
                  placeholder="Any medical conditions that affect your diet"
                />
              </div>
            </Card>
          </div>
        </form>

        {/* Health Metrics */}
        {profile && (bmi > 0 || bmr > 0) && (
          <Card title="Health Metrics" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bmi > 0 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Scale className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{bmi.toFixed(1)}</h3>
                  <p className="text-sm text-gray-600">BMI</p>
                  <p className="text-xs text-gray-500 mt-1">{getBMICategory(bmi)}</p>
                </div>
              )}
              
              {bmr > 0 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{Math.round(bmr)}</h3>
                  <p className="text-sm text-gray-600">BMR (kcal/day)</p>
                  <p className="text-xs text-gray-500 mt-1">Basal Metabolic Rate</p>
                </div>
              )}
              
              {tdee > 0 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{Math.round(tdee)}</h3>
                  <p className="text-sm text-gray-600">TDEE (kcal/day)</p>
                  <p className="text-xs text-gray-500 mt-1">Total Daily Energy Expenditure</p>
                </div>
              )}
              
              {age > 0 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{age}</h3>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-xs text-gray-500 mt-1">Years old</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mt-8 border-red-200 bg-red-50">
            <div className="text-red-800">
              <h3 className="font-medium">Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
