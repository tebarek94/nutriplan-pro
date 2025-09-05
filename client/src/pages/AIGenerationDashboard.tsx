import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChefHat, 
  Calendar, 
  Brain, 
  Sparkles, 
  Clock, 
  Users, 
  Target, 
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  Heart,
  BookOpen,
  Utensils,
  Zap
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { useMealPlans } from '../hooks';
import { useRecipes } from '../hooks';
import { formatDate, formatRelativeTime } from '../utils';

interface AIGenerationMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

interface GeneratedRecipe {
  id: number;
  title: string;
  description: string;
  cuisine_type: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  dietary_tags: string[];
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  instructions: string[];
  tips: string;
  created_at: string;
  is_ai_generated: boolean;
}

interface GeneratedMealPlan {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: Array<{
    day_of_week: string;
    meal_type: string;
    custom_meal_name?: string;
    recipe_title?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  created_at: string;
  is_ai_generated: boolean;
}

const AIGenerationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateMealPlan, generateWeeklyMealPlan, getUserMealPlans } = useMealPlans();
  const { generateRecipe, getAllRecipes } = useRecipes();
  
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState<GeneratedRecipe[]>([]);
  const [recentMealPlans, setRecentMealPlans] = useState<GeneratedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Generation form states
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    cuisine_type: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    dietary_preferences: [] as string[],
    ingredients_available: [] as string[],
    cooking_time: 30,
    servings: 4,
    description: ''
  });

  const [mealPlanForm, setMealPlanForm] = useState({
    duration_days: 7,
    meals_per_day: 3,
    cuisine_preferences: [] as string[],
    difficulty_level: 'intermediate' as 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced',
    calorie_target: 2000
  });

  const [weeklyMealPlanForm, setWeeklyMealPlanForm] = useState({
    week_start_date: new Date().toISOString().split('T')[0],
    cuisine_preferences: [] as string[],
    cooking_skill_level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    meals_per_day: 3,
    calorie_target: 2000
  });

  const generationModes: AIGenerationMode[] = [
    {
      id: 'recipe',
      title: 'AI Recipe Generator',
      description: 'Generate personalized recipes based on your preferences and available ingredients',
      icon: <ChefHat className="w-8 h-8" />,
      color: 'bg-blue-600',
      features: [
        'Custom recipe creation',
        'Ingredient-based generation',
        'Dietary preference support',
        'Nutritional information',
        'Cooking instructions',
        'Tips and variations'
      ]
    },
    {
      id: 'meal-plan',
      title: 'AI Meal Plan Generator',
      description: 'Create personalized meal plans for any duration with balanced nutrition',
      icon: <Calendar className="w-8 h-8" />,
      color: 'bg-green-500',
      features: [
        'Flexible duration plans',
        'Nutritional balance',
        'Dietary restrictions',
        'Calorie targets',
        'Meal variety',
        'Shopping lists'
      ]
    },
    {
      id: 'weekly-plan',
      title: 'AI Weekly Meal Planner',
      description: 'Generate comprehensive 7-day meal plans with detailed nutrition tracking',
      icon: <Target className="w-8 h-8" />,
      color: 'bg-purple-500',
      features: [
        '7-day meal plans',
        'Daily nutrition goals',
        'Meal variety',
        'Prep time optimization',
        'Budget considerations',
        'Family-friendly options'
      ]
    }
  ];

  useEffect(() => {
    loadRecentContent();
  }, []);

  const loadRecentContent = async () => {
    try {
      setLoading(true);
      
      // Load recent AI-generated recipes
      const recipesResponse = await getAllRecipes({ 
        limit: 20
      });
      
      if (recipesResponse) {
        console.log('All recipes:', recipesResponse);
        console.log('User ID:', user?.id);
        
        // Filter for AI-generated recipes (show user's own recipes even if not approved)
        const aiRecipes = recipesResponse.filter((recipe: any) => {
          const isAI = recipe.is_ai_generated;
          const isApproved = recipe.is_approved;
          const isUserOwned = recipe.created_by === user?.id;
          
          console.log(`Recipe ${recipe.title}: isAI=${isAI}, isApproved=${isApproved}, isUserOwned=${isUserOwned}, created_by=${recipe.created_by}`);
          
          return isAI && (isApproved || isUserOwned);
        });
        
        console.log('AI Recipes found:', aiRecipes);
        
        // Sort by creation date (most recent first)
        aiRecipes.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setRecentRecipes(aiRecipes.slice(0, 5));
      }

      // Load recent AI-generated meal plans
      const mealPlansResponse = await getUserMealPlans({ limit: 5 });
      if (mealPlansResponse && Array.isArray(mealPlansResponse)) {
        setRecentMealPlans(mealPlansResponse.filter((plan: any) => plan.is_ai_generated) as unknown as GeneratedMealPlan[]);
      }
    } catch (error) {
      console.error('Error loading recent content:', error);
      toast.error('Failed to load recent content');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    setShowGenerationModal(true);
  };

  const handleRecipeGeneration = async () => {
    try {
      setGenerating(true);
      
      const response = await generateRecipe({
        ...recipeForm,
        user_profile: {
          dietary_preferences: [],
          allergies: [],
          medical_conditions: ''
        }
      });

      if (response.success && 'data' in response) {
        toast.success('Recipe generated successfully!');
        setShowGenerationModal(false);
        navigate(`/recipes/${response.data.id}`);
        loadRecentContent();
      } else {
        toast.error(response.message || 'Failed to generate recipe');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleMealPlanGeneration = async () => {
    try {
      setGenerating(true);
      
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + mealPlanForm.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await generateMealPlan({
        user_profile: {
          dietary_preferences: [],
          allergies: [],
          medical_conditions: ''
        },
        start_date: startDate,
        end_date: endDate,
        preferences: mealPlanForm
      });

      if (response.success && 'data' in response) {
        toast.success('Meal plan generated successfully!');
        setShowGenerationModal(false);
        navigate(`/meal-plans/${response.data.id}`);
        loadRecentContent();
      } else {
        toast.error(response.message || 'Failed to generate meal plan');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleWeeklyMealPlanGeneration = async () => {
    try {
      setGenerating(true);
      
      const response = await generateWeeklyMealPlan({
        user_profile: {
          dietary_preferences: [],
          allergies: [],
          medical_conditions: ''
        },
        week_start_date: weeklyMealPlanForm.week_start_date,
        preferences: {
          cuisine_preferences: weeklyMealPlanForm.cuisine_preferences,
          cooking_skill_level: weeklyMealPlanForm.cooking_skill_level,
          meals_per_day: weeklyMealPlanForm.meals_per_day,
          calorie_target: weeklyMealPlanForm.calorie_target
        }
      });

      if (response.success && 'data' in response) {
        toast.success('Weekly meal plan generated successfully!');
        setShowGenerationModal(false);
        navigate(`/meal-plans/${response.data.id}`);
        loadRecentContent();
      } else {
        toast.error(response.message || 'Failed to generate weekly meal plan');
      }
    } catch (error) {
      console.error('Error generating weekly meal plan:', error);
      toast.error('Failed to generate weekly meal plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const renderGenerationForm = () => {
    switch (selectedMode) {
      case 'recipe':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title (Optional)
                </label>
                <input
                  type="text"
                  value={recipeForm.title}
                  onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., Mediterranean Quinoa Bowl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  value={recipeForm.cuisine_type}
                  onChange={(e) => setRecipeForm({ ...recipeForm, cuisine_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Any Cuisine</option>
                  <option value="italian">Italian</option>
                  <option value="mexican">Mexican</option>
                  <option value="asian">Asian</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="indian">Indian</option>
                  <option value="american">American</option>
                  <option value="french">French</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={recipeForm.difficulty}
                  onChange={(e) => setRecipeForm({ ...recipeForm, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cooking Time (minutes)
                </label>
                <input
                  type="number"
                  value={recipeForm.cooking_time}
                  onChange={(e) => setRecipeForm({ ...recipeForm, cooking_time: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  min="5"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={recipeForm.servings}
                  onChange={(e) => setRecipeForm({ ...recipeForm, servings: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  min="1"
                  max="20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={recipeForm.description}
                onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                rows={3}
                placeholder="Describe what kind of recipe you'd like to generate..."
              />
            </div>

            <div className="space-y-3">
                              <Button
                  onClick={() => navigate('/recipes/ai-generate')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  Generate Recipe (Full Page)
                </Button>
              
              <Button
                onClick={handleRecipeGeneration}
                disabled={generating}
                variant="outline"
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Recipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Recipe (Quick)
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'meal-plan':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={mealPlanForm.duration_days}
                  onChange={(e) => setMealPlanForm({ ...mealPlanForm, duration_days: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meals per Day
                </label>
                <input
                  type="number"
                  value={mealPlanForm.meals_per_day}
                  onChange={(e) => setMealPlanForm({ ...mealPlanForm, meals_per_day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Calorie Target
                </label>
                <input
                  type="number"
                  value={mealPlanForm.calorie_target}
                  onChange={(e) => setMealPlanForm({ ...mealPlanForm, calorie_target: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="500"
                  max="5000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={mealPlanForm.difficulty_level}
                onChange={(e) => setMealPlanForm({ ...mealPlanForm, difficulty_level: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <Button
              onClick={handleMealPlanGeneration}
              disabled={generating}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Meal Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Meal Plan
                </>
              )}
            </Button>
          </div>
        );

      case 'weekly-plan':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Week Start Date
                </label>
                <input
                  type="date"
                  value={weeklyMealPlanForm.week_start_date}
                  onChange={(e) => setWeeklyMealPlanForm({ ...weeklyMealPlanForm, week_start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cooking Skill Level
                </label>
                <select
                  value={weeklyMealPlanForm.cooking_skill_level}
                  onChange={(e) => setWeeklyMealPlanForm({ ...weeklyMealPlanForm, cooking_skill_level: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meals per Day
                </label>
                <input
                  type="number"
                  value={weeklyMealPlanForm.meals_per_day}
                  onChange={(e) => setWeeklyMealPlanForm({ ...weeklyMealPlanForm, meals_per_day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Calorie Target
                </label>
                <input
                  type="number"
                  value={weeklyMealPlanForm.calorie_target}
                  onChange={(e) => setWeeklyMealPlanForm({ ...weeklyMealPlanForm, calorie_target: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="500"
                  max="5000"
                />
              </div>
            </div>

            <Button
              onClick={handleWeeklyMealPlanGeneration}
              disabled={generating}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Weekly Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Weekly Meal Plan
                </>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading AI Generation Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI Generation Dashboard
              </h1>
              <p className="text-gray-600">
                Generate personalized recipes and meal plans using AI
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* AI Generation Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {generationModes.map((mode) => (
            <Card key={mode.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div 
                className={`${mode.color} text-white p-6 rounded-t-lg`}
                onClick={() => handleModeSelect(mode.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  {mode.icon}
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{mode.title}</h3>
                <p className="text-white/90 text-sm">{mode.description}</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleModeSelect(mode.id)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Generation
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent AI-Generated Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Recipes */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-blue-600" />
                Recent AI Recipes
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadRecentContent}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/recipes')}
                >
                  View All
                </Button>
              </div>
            </div>
            
            {recentRecipes.length > 0 ? (
              <div className="space-y-4">
                {recentRecipes.slice(0, 3).map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{recipe.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {recipe.prep_time + recipe.cook_time}min
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {recipe.servings} servings
                          </span>
                          <span className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {recipe.calories_per_serving} cal
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          AI Generated
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No AI-generated recipes yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleModeSelect('recipe')}
                >
                  Generate Your First Recipe
                </Button>
              </div>
            )}
          </Card>

          {/* Recent Meal Plans */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-500" />
                Recent AI Meal Plans
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/meal-plans')}
              >
                View All
              </Button>
            </div>
            
            {recentMealPlans.length > 0 ? (
              <div className="space-y-4">
                {recentMealPlans.slice(0, 3).map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/meal-plans/${plan.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{plan.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                          </span>
                          <span className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {plan.total_calories} cal/day
                          </span>
                          <span className="flex items-center">
                            <Utensils className="w-3 h-3 mr-1" />
                            {plan.meals.length} meals
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          AI Generated
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No AI-generated meal plans yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleModeSelect('meal-plan')}
                >
                  Generate Your First Meal Plan
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Generation Modal */}
        <Modal
          isOpen={showGenerationModal}
          onClose={() => setShowGenerationModal(false)}
          title={`Generate ${selectedMode === 'recipe' ? 'Recipe' : selectedMode === 'meal-plan' ? 'Meal Plan' : 'Weekly Meal Plan'}`}
          size="lg"
        >
          {renderGenerationForm()}
        </Modal>
      </div>
    </div>
  );
};

export default AIGenerationDashboard;
