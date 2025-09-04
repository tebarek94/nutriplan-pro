import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  ArrowLeft,
  Trash2,
  Target,
  ChefHat,
  Eye,
  X
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
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  recipe_id?: number;
  custom_meal_name?: string;
  custom_ingredients?: any[];
  custom_nutrition?: any;
  recipe?: Recipe;
  recipe_title?: string;
  recipe_image?: string;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
}

interface MealPlan {
  id: number;
  name: string;
  description: string | undefined;
  start_date: string;
  end_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  is_ai_generated: boolean;
  ai_prompt: string;
  created_at: string;
  updated_at: string;
  meals: MealPlanItem[];
}

const MealPlanDetailPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    }
  }, [id]);

  const fetchMealPlan = async () => {
    try {
      setLoading(true);
      const response = await api.getMealPlanById(Number(id));

      if (response.success) {
        console.log('Meal Plan Data:', response.data);
        console.log('Meals:', response.data.meals);
        setMealPlan(response.data as MealPlan);
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

  const handleDeleteMealPlan = async () => {
    try {
      const response = await api.deleteMealPlan(Number(id));
      if (response.success) {
        toast.success('Meal plan deleted successfully');
        navigate('/meal-plans');
      }
    } catch (error: any) {
      console.error('Error deleting meal plan:', error);
      toast.error('Failed to delete meal plan');
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

  const getMealTypeDescription = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'Start your day with energy';
      case 'lunch': return 'Midday nourishment';
      case 'dinner': return 'Evening meal';
      case 'snack': return 'Quick energy boost';
      default: return 'Meal';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const getMealsForDay = (dayOfWeek: string) => {
    const dayMeals = mealPlan?.meals.filter(meal => meal.day_of_week === dayOfWeek) || [];
    console.log(`Meals for ${dayOfWeek}:`, dayMeals);
    return dayMeals;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Meal Plan Not Found</h2>
          <p className="text-gray-600 mb-4">The meal plan you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/meal-plans')}>
            Back to Meal Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {mealPlan.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {mealPlan.description}
                </p>
              </div>
            </div>
                         <div className="flex items-center space-x-2">
               <Button
                 variant="danger"
                 size="sm"
                 onClick={() => setShowDeleteModal(true)}
               >
                 <Trash2 className="w-4 h-4 mr-2" />
                 Delete
               </Button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meal Schedule */}
            <Card title="Weekly Meal Schedule"
              subtitle={`${formatDate(mealPlan.start_date)} - ${formatDate(mealPlan.end_date)} (${getDuration(mealPlan.start_date, mealPlan.end_date)} days)`}
              padding="md"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayMeals = getMealsForDay(day);
                  return (
                    <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className={`font-medium text-sm mb-3 px-2 py-1 rounded ${getDayColor(day)}`}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </h4>
                      <div className="space-y-3">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                          const meal = dayMeals.find(m => m.meal_type === mealType);
                          return (
                            <div key={mealType} className="text-sm">
                              <div className="flex items-center mb-2">
                                <span className="mr-2">{getMealTypeIcon(mealType)}</span>
                                <div>
                                  <div className="font-medium capitalize">{mealType}</div>
                                  <div className="text-xs text-gray-500">{getMealTypeDescription(mealType)}</div>
                                </div>
                              </div>
                              {meal ? (
                                <div className="ml-6">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {meal.recipe?.title || meal.recipe_title || meal.custom_meal_name || 'Meal'}
                                  </div>
                                  <div className="text-xs text-gray-500 space-y-1">
                                    <div>
                                      {meal.recipe?.calories_per_serving || meal.calories_per_serving || meal.custom_nutrition?.calories || '0'} calories
                                    </div>
                                    {meal.recipe && (
                                      <div>{meal.recipe.prep_time + meal.recipe.cook_time} minutes</div>
                                    )}
                                    {meal.recipe && (
                                      <div className={`inline-block px-2 py-1 rounded text-xs ${getDifficultyColor(meal.recipe.difficulty)}`}>
                                        {meal.recipe.difficulty}
                                      </div>
                                    )}
                                  </div>
                                  {meal.recipe && (
                                    <Link to={`/recipes/${meal.recipe.id}`}>
                                      <Button variant="outline" size="sm" className="mt-2">
                                        <Eye className="w-3 h-3 mr-1" />
                                        View Recipe
                                      </Button>
                                    </Link>
                                  )}
                                  {meal.custom_ingredients && meal.custom_ingredients.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      <div className="font-medium">Ingredients:</div>
                                      <div className="ml-2">
                                        {meal.custom_ingredients.map((ingredient: any, idx: number) => (
                                          <div key={idx}>
                                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="ml-6 text-gray-500 dark:text-gray-400 italic">
                                  No meal set
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* AI Prompt (if AI generated) */}
            {mealPlan.is_ai_generated && mealPlan.ai_prompt && (
              <Card title="AI Generation Details" padding="md">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">AI Prompt Used:</h4>
                  <p className="text-purple-800 text-sm">{mealPlan.ai_prompt}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Info */}
            <Card title="Plan Information" padding="md">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium flex items-center">
                    {mealPlan.is_ai_generated ? (
                      <>
                        <Target className="w-4 h-4 mr-2 text-purple-500" />
                        AI Generated
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4 mr-2 text-blue-500" />
                        Manual
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{getDuration(mealPlan.start_date, mealPlan.end_date)} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="font-medium">
                    {formatDate(mealPlan.start_date)} - {formatDate(mealPlan.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">
                    {new Date(mealPlan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {new Date(mealPlan.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Nutrition Summary */}
            <Card title="Nutrition Summary" padding="md">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Calories:</span>
                  <span className="font-medium">{Number(mealPlan.total_calories)?.toFixed(0) || 'N/A'} cal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Protein:</span>
                  <span className="font-medium">{Number(mealPlan.total_protein)?.toFixed(1) || 'N/A'}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Carbs:</span>
                  <span className="font-medium">{Number(mealPlan.total_carbs)?.toFixed(1) || 'N/A'}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fat:</span>
                  <span className="font-medium">{Number(mealPlan.total_fat)?.toFixed(1) || 'N/A'}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meals Planned:</span>
                  <span className="font-medium">{mealPlan.meals.length}</span>
                </div>
              </div>
            </Card>

                         {/* Quick Actions */}
             <Card title="Quick Actions" padding="md">
               <div className="space-y-3">
                 {/* No actions available */}
               </div>
             </Card>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Meal Plan
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{mealPlan.name}"? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteMealPlan}
                >
                  Delete Meal Plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanDetailPage;
