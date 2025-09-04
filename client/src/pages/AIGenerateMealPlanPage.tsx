import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Target,
  ArrowLeft,
  Sparkles,
  Calendar,
  Users,
  ChefHat,
  BookOpen,
  Save,
  Loader2,
  Settings
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AIGenerateMealPlanPageProps {}

const AIGenerateMealPlanPage: React.FC<AIGenerateMealPlanPageProps> = () => {
  const {  isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    prompt: '',
    start_date: '',
    end_date: '',
    dietary_preferences: [] as string[],
    calorie_target: '',
    cuisine_preferences: [] as string[],
    cooking_skill: 'intermediate',
    meal_count: '3'
  });

  // Dietary preferences options
  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Low-Carb',
    'Keto',
    'Paleo',
    'Mediterranean',
    'Low-Sodium',
    'High-Protein'
  ];

  // Cuisine preferences options
  const cuisineOptions = [
    'Italian',
    'Mexican',
    'Asian',
    'Mediterranean',
    'American',
    'Indian',
    'French',
    'Thai',
    'Japanese',
    'Greek',
    'Middle Eastern',
    'African'
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDietaryPreferenceChange = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(preference)
        ? prev.dietary_preferences.filter(p => p !== preference)
        : [...prev.dietary_preferences, preference]
    }));
  };

  const handleCuisinePreferenceChange = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisine_preferences: prev.cuisine_preferences.includes(cuisine)
        ? prev.cuisine_preferences.filter(c => c !== cuisine)
        : [...prev.cuisine_preferences, cuisine]
    }));
  };

  const generatePrompt = () => {
    const parts = [];
    
    if (formData.prompt) {
      parts.push(formData.prompt);
    }

    if (formData.dietary_preferences.length > 0) {
      parts.push(`Dietary restrictions: ${formData.dietary_preferences.join(', ')}`);
    }

    if (formData.cuisine_preferences.length > 0) {
      parts.push(`Preferred cuisines: ${formData.cuisine_preferences.join(', ')}`);
    }

    if (formData.calorie_target) {
      parts.push(`Daily calorie target: ${formData.calorie_target} calories`);
    }

    parts.push(`Cooking skill level: ${formData.cooking_skill}`);
    parts.push(`Meals per day: ${formData.meal_count}`);
    parts.push(`Duration: ${formData.start_date} to ${formData.end_date}`);

    return parts.join('. ');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.start_date || !formData.end_date) {
      toast.error('Please select start and end dates');
      return;
    }

    if (!formData.prompt && formData.dietary_preferences.length === 0 && formData.cuisine_preferences.length === 0) {
      toast.error('Please provide some preferences or a custom prompt');
      return;
    }

    // Validate calorie target
    if (formData.calorie_target) {
      const calorieValue = parseInt(formData.calorie_target);
      if (calorieValue < 500 || calorieValue > 5000) {
        toast.error('Calorie target must be between 500 and 5000 calories');
        return;
      }
    }

    try {
      setGenerating(true);
      
      // Calculate duration in days
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const request = {
        user_profile: {
          dietary_preferences: formData.dietary_preferences,
          medical_conditions: formData.prompt || undefined
        },
        start_date: formData.start_date,
        end_date: formData.end_date,
        preferences: {
          cuisine_preferences: formData.cuisine_preferences,
          cooking_skill_level: formData.cooking_skill as 'beginner' | 'intermediate' | 'advanced',
          meals_per_day: parseInt(formData.meal_count),
          calorie_target: formData.calorie_target ? parseInt(formData.calorie_target) : undefined
        }
      };
      
      const response = await api.generateMealPlan(request);
      
      if (response.success) {
        toast.success('Meal plan generated successfully!');
        navigate(`/meal-plans/${response.data.id}`);
      } else {
        toast.error(response.message || 'Failed to generate meal plan');
      }
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTemplate = () => {
    // Save current form as a template (future feature)
    toast.success('Template saved!');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/meal-plans')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Meal Plans
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Meal Plan Generator
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate personalized meal plans using AI
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Settings */}
            <div className="space-y-6">
              {/* Custom Prompt */}
              <Card title="Custom Prompt (Optional)" padding="md">
                
                
                  <textarea
                    name="prompt"
                    value={formData.prompt}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Describe your ideal meal plan, preferences, or any specific requirements..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Leave blank to use the preferences below, or add custom instructions
                  </p>
                
              </Card>

              {/* Date Range */}
              <Card title="Date Range" padding="md">
                
                
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                  </div>
                
              </Card>

              {/* Basic Settings */}
              <Card title="Basic Settings" padding="md">
                
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Daily Calorie Target (500-5000)
                    </label>
                    <input
                      type="number"
                      name="calorie_target"
                      value={formData.calorie_target}
                      onChange={handleInputChange}
                      min="500"
                      max="5000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., 2000"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your daily calorie goal (minimum 500, maximum 5000)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cooking Skill Level
                    </label>
                    <select
                      name="cooking_skill"
                      value={formData.cooking_skill}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meals per Day
                    </label>
                    <select
                      name="meal_count"
                      value={formData.meal_count}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="2">2 meals</option>
                      <option value="3">3 meals</option>
                      <option value="4">4 meals</option>
                      <option value="5">5 meals</option>
                    </select>
                  </div>
                
              </Card>
            </div>

            {/* Right Column - Preferences */}
            <div className="space-y-6">
              {/* Dietary Preferences */}
              <Card title="Dietary Preferences" padding="md">
                
                
                  <div className="grid grid-cols-2 gap-3">
                    {dietaryOptions.map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.dietary_preferences.includes(option)}
                          onChange={() => handleDietaryPreferenceChange(option)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                
              </Card>

              {/* Cuisine Preferences */}
              <Card title="Cuisine Preferences" padding="md">
                
                
                  <div className="grid grid-cols-2 gap-3">
                    {cuisineOptions.map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cuisine_preferences.includes(option)}
                          onChange={() => handleCuisinePreferenceChange(option)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                
              </Card>

              {/* Generated Prompt Preview */}
              <Card title="Generated Prompt Preview" padding="md">
                
                
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {generatePrompt() || 'No preferences selected yet. Add some preferences or a custom prompt above.'}
                    </p>
                  </div>
                
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveTemplate}
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Template
            </Button>

            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/meal-plans')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIGenerateMealPlanPage;
