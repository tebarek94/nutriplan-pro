import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft,
  ChefHat,
  Sparkles,
  Clock,
  Users,
  Target,
  Zap,
  Loader2
} from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useRecipes } from '../hooks';
import Card from '../components/ui/Card';

interface RecipeFormData {
  title: string;
  cuisine_type: string;
  difficulty: string;
  dietary_preferences: string[];
  ingredients_available: string[];
  cooking_time: string;
  servings: string;
  description: string;
}

const AIGenerateRecipePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { generateRecipe } = useRecipes();
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    cuisine_type: '',
    difficulty: '',
    dietary_preferences: [],
    ingredients_available: [],
    cooking_time: '',
    servings: '',
    description: ''
  });

  const cuisineTypes = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 
    'Mediterranean', 'French', 'Thai', 'Greek', 'Spanish', 'Korean',
    'Vietnamese', 'Middle Eastern', 'Caribbean', 'African', 'International'
  ];

  const difficultyLevels = ['easy', 'medium', 'hard'];
  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 
    'paleo', 'low-carb', 'high-protein', 'low-fat', 'nut-free'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [name]: items
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      dietary_preferences: checked 
        ? [...prev.dietary_preferences, value]
        : prev.dietary_preferences.filter(item => item !== value)
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a recipe title');
      return;
    }

    try {
      setGenerating(true);
      
      const request = {
        title: formData.title,
        cuisine_type: formData.cuisine_type || undefined,
        difficulty: formData.difficulty as 'easy' | 'medium' | 'hard' || undefined,
        dietary_preferences: formData.dietary_preferences.length > 0 ? formData.dietary_preferences : undefined,
        ingredients_available: formData.ingredients_available.length > 0 ? formData.ingredients_available : undefined,
        cooking_time: formData.cooking_time ? parseInt(formData.cooking_time) : undefined,
        servings: formData.servings ? parseInt(formData.servings) : undefined,
        description: formData.description || undefined
      };
      
      console.log('Generating recipe with request:', request);
      const response = await generateRecipe(request);
      console.log('Recipe generation response:', response);
      
      if (response.success && 'data' in response) {
        toast.success('Recipe generated successfully!');
        // Navigate to the recipe detail page
        navigate(`/recipes/${response.data.id}`);
      } else {
        toast.error(response.message || 'Failed to generate recipe');
      }
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/recipes')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Recipes
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  AI Recipe Generator
                </h1>
                <p className="text-gray-600">
                  Generate complete recipes using AI
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Settings */}
            <div className="space-y-6">
              {/* Recipe Title */}
              <Card title="Recipe Title"
                padding="md"
              >
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Creamy Mushroom Risotto"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the name of the recipe you want to generate
                </p>
              </Card>

              {/* Cuisine Type */}
              <Card title="Cuisine Type" padding="md">
                <select
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any Cuisine</option>
                  {cuisineTypes.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Select a specific cuisine type (optional)
                </p>
              </Card>

              {/* Difficulty Level */}
              <Card title="Difficulty Level" padding="md">
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any Difficulty</option>
                  {difficultyLevels.map(level => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Choose the cooking skill level required
                </p>
              </Card>

              {/* Cooking Time */}
              <Card title="Cooking Time" padding="md">
                <input
                  type="number"
                  name="cooking_time"
                  value={formData.cooking_time}
                  onChange={handleInputChange}
                  min="5"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 30"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Maximum cooking time in minutes (optional)
                </p>
              </Card>
            </div>

            {/* Right Column - Preferences */}
            <div className="space-y-6">
              {/* Servings */}
              <Card title="Servings" padding="md">
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 4"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Number of servings (optional)
                </p>
              </Card>

              {/* Dietary Preferences */}
              <Card title="Dietary Preferences" padding="md">
                <div className="grid grid-cols-2 gap-3">
                  {dietaryOptions.map(preference => (
                    <label key={preference} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={preference}
                        checked={formData.dietary_preferences.includes(preference)}
                        onChange={handleCheckboxChange}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {preference.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Select dietary restrictions or preferences
                </p>
              </Card>

              {/* Available Ingredients */}
              <Card title="Available Ingredients" padding="md">
                <input
                  type="text"
                  name="ingredients_available"
                  value={formData.ingredients_available.join(', ')}
                  onChange={handleArrayInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., chicken, rice, tomatoes, garlic"
                />
                <p className="text-sm text-gray-500 mt-2">
                  List ingredients you have available (comma-separated)
                </p>
              </Card>

              {/* Description */}
              <Card title="Additional Description" padding="md">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe any specific requirements, flavors, or cooking methods you prefer..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Add any specific details or preferences
                </p>
              </Card>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 flex justify-center">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={generating || !formData.title.trim()}
              className="px-8 py-3"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Recipe...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Recipe
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8">
          <Card title="Tips for Better Results" padding="md">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Be specific with your recipe title for better results</li>
              <li>• Include dietary preferences to ensure the recipe meets your needs</li>
              <li>• List available ingredients to get recipes you can actually make</li>
              <li>• Specify cooking time if you have time constraints</li>
              <li>• Add a description for any special requirements or flavor preferences</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateRecipePage;
