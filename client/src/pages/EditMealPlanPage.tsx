import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Clock,
  Users,
  Target,
  ChefHat,
  BookOpen,
  Save,
  X,
  Edit
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
}

interface MealPlanItem {
  id: number;
  meal_plan_id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  recipe_id?: number;
  custom_meal_name?: string;
  custom_ingredients?: any[];
  custom_nutrition?: any;
  created_at: string;
}

interface MealPlan {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  is_ai_generated: boolean;
  ai_prompt?: string;
  created_at: string;
  updated_at: string;
  meals?: MealPlanItem[];
}

const EditMealPlanPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<MealPlan>({
    id: 0,
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    is_ai_generated: false,
    ai_prompt: '',
    created_at: '',
    updated_at: '',
    meals: []
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (id) {
      fetchMealPlan();
      fetchRecipes();
    }
  }, [id]);

  const fetchMealPlan = async () => {
    try {
      setLoading(true);
      const response = await api.getMealPlanById(Number(id));
      
      if (response.success) {
        setFormData(response.data);
      } else {
        toast.error('Meal plan not found');
        navigate('/meal-plans');
      }
    } catch (error: any) {
      console.error('Error fetching meal plan:', error);
      toast.error('Failed to load meal plan');
      navigate('/meal-plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await api.getAllRecipes({ limit: 100 });
      if (response.success) {
        setRecipes(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMeal = (dayOfWeek: string, mealType: string) => {
    setSelectedDay(dayOfWeek);
    setSelectedMealType(mealType);
    setShowRecipeModal(true);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    const newMeal: MealPlanItem = {
      id: Date.now(), // Temporary ID for new meal
      meal_plan_id: Number(id), // Use the current meal plan ID
      meal_type: selectedMealType as any,
      day_of_week: selectedDay as any,
      recipe_id: recipe.id,
      created_at: new Date().toISOString() // Add current timestamp
    };

    // Remove existing meal for this day and meal type
    const updatedMeals = (formData.meals || []).filter(meal => 
      !(meal.day_of_week === selectedDay && meal.meal_type === selectedMealType)
    );

    setFormData(prev => ({
      ...prev,
      meals: [...updatedMeals, newMeal]
    }));

    setShowRecipeModal(false);
    toast.success(`${recipe.title} added to ${selectedDay} ${selectedMealType}`);
  };

  const handleRemoveMeal = (dayOfWeek: string, mealType: string) => {
    const updatedMeals = (formData.meals || []).filter(meal => 
      !(meal.day_of_week === dayOfWeek && meal.meal_type === mealType)
    );

    setFormData(prev => ({
      ...prev,
      meals: updatedMeals
    }));

    toast.success('Meal removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await api.updateMealPlan(Number(id), {
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        meals: formData.meals
      });

      if (response.success) {
        toast.success('Meal plan updated successfully!');
        navigate('/meal-plans');
      }
    } catch (error: any) {
      console.error('Error updating meal plan:', error);
      toast.error('Failed to update meal plan');
    } finally {
      setSaving(false);
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const getDayColor = (dayOfWeek: string) => {
    switch (dayOfWeek) {
      case 'monday': return 'bg-blue-100 text-blue-800';
      case 'tuesday': return 'bg-purple-100 text-purple-800';
      case 'wednesday': return 'bg-green-100 text-green-800';
      case 'thursday': return 'bg-yellow-100 text-yellow-800';
      case 'friday': return 'bg-red-100 text-red-800';
      case 'saturday': return 'bg-indigo-100 text-indigo-800';
      case 'sunday': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMealForDay = (dayOfWeek: string, mealType: string) => {
    return formData.meals?.find(meal => 
      meal.day_of_week === dayOfWeek && meal.meal_type === mealType
    );
  };

  const getRecipeById = (recipeId: number) => {
    return recipes.find(recipe => recipe.id === recipeId);
  };

  const calculateNutrition = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    formData.meals?.forEach(meal => {
      if (meal.recipe_id) {
        const recipe = getRecipeById(meal.recipe_id);
        if (recipe) {
          totalCalories += recipe.calories_per_serving;
          totalProtein += recipe.protein_per_serving;
          totalCarbs += recipe.carbs_per_serving;
          totalFat += recipe.fat_per_serving;
        }
      }
    });

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  const nutrition = calculateNutrition();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Edit Meal Plan
                </h1>
                <p className="text-gray-600">
                  Modify your meal plan
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Information */}
              <Card padding="md">
                
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter meal plan name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Describe your meal plan"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {formData.is_ai_generated && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Prompt
                      </label>
                      <textarea
                        name="ai_prompt"
                        value={formData.ai_prompt}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                        placeholder="AI prompt used to generate this plan"
                        readOnly
                      />
                    </div>
                  )}
                
              </Card>

              {/* Nutrition Summary */}
              <Card padding="md">
                
                
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Calories:</span>
                    <span className="font-medium">{nutrition.totalCalories.toFixed(0)} cal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Protein:</span>
                    <span className="font-medium">{nutrition.totalProtein.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Carbs:</span>
                    <span className="font-medium">{nutrition.totalCarbs.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Fat:</span>
                    <span className="font-medium">{nutrition.totalFat.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meals Planned:</span>
                    <span className="font-medium">{formData.meals?.length || 0}</span>
                  </div>
                
              </Card>

              {/* Actions */}
              <Card padding="md">
                
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Meal Plan
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/meal-plans')}
                  >
                    Cancel
                  </Button>
                
              </Card>
            </div>

            {/* Meal Schedule */}
            <div className="lg:col-span-2">
              <Card title="Meal Schedule" subtitle="Click the + buttons to add meals or the trash icon to remove them" padding="md">
                
                
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="border border-gray-200 rounded-lg p-4">
                        <h4 className={`font-medium text-sm mb-3 px-2 py-1 rounded ${getDayColor(day)}`}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </h4>
                        <div className="space-y-2">
                          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                            const meal = getMealForDay(day, mealType);
                            const recipe = meal?.recipe_id ? getRecipeById(meal.recipe_id) : null;

                            return (
                              <div key={mealType} className="text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="flex items-center">
                                    <span className="mr-2">{getMealTypeIcon(mealType)}</span>
                                    <span className="font-medium capitalize">{mealType}</span>
                                  </span>
                                  {meal ? (
                                    <Button
                                      type="button"
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleRemoveMeal(day, mealType)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAddMeal(day, mealType)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                                {meal && recipe ? (
                                  <div className="ml-6 text-gray-600">
                                    <div className="font-medium">{recipe.title}</div>
                                    <div className="text-xs text-gray-500">
                                      {recipe.calories_per_serving} cal • {recipe.prep_time + recipe.cook_time} min
                                    </div>
                                  </div>
                                ) : meal && meal.custom_meal_name ? (
                                  <div className="ml-6 text-gray-600">
                                    {meal.custom_meal_name}
                                  </div>
                                ) : (
                                  <div className="ml-6 text-gray-500 italic">
                                    No meal set
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                
              </Card>
            </div>
          </div>
        </form>

        {/* Recipe Selection Modal */}
        {showRecipeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Recipe for {selectedDay} {selectedMealType}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecipeModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes
                  .filter(recipe => 
                    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((recipe) => (
                    <div
                      key={recipe.id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
                      onClick={() => handleRecipeSelect(recipe)}
                    >
                      <div className="flex items-center space-x-3">
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{recipe.title}</h4>
                          <div className="text-xs text-gray-500">
                            {recipe.calories_per_serving} cal • {recipe.prep_time + recipe.cook_time} min
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {recipes.filter(recipe => 
                recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                  <p className="text-gray-600">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditMealPlanPage;
