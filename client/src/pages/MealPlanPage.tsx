import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  Users,
  Target,
  ChefHat,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  Heart
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

interface MealPlanItem {
  id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  recipe_id?: number;
  custom_meal_name?: string;
  custom_ingredients?: any[];
  custom_nutrition?: any;
  recipe?: {
    id: number;
    title: string;
    image_url: string;
    calories_per_serving: number;
  };
}

const MealPlanPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ai_generated' | 'manual'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mealPlanToDelete, setMealPlanToDelete] = useState<MealPlan | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchMealPlans();
  }, [currentPage, searchTerm, filterType]);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filterType !== 'all') {
        params.is_ai_generated = filterType === 'ai_generated';
      }

      const response = await api.getUserMealPlans(params);
      if (response.success) {
        setMealPlans(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching meal plans:', error);
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMealPlan = async (mealPlanId: number) => {
    try {
      const response = await api.deleteMealPlan(mealPlanId);
      if (response.success) {
        toast.success('Meal plan deleted successfully');
        setShowDeleteModal(false);
        setMealPlanToDelete(null);
        fetchMealPlans(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error deleting meal plan:', error);
      toast.error('Failed to delete meal plan');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMealPlans();
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Meal Plans
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage your personalized meal plans
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/meal-plans/ai-generate">
                <Button variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search meal plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Types</option>
                  <option value="ai_generated">AI Generated</option>
                  <option value="manual">Manual</option>
                </select>

                <Button type="submit" variant="primary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </form>
          
        </Card>

        {/* Meal Plans Grid */}
        <Card padding="md">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          
          
            {mealPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealPlans.map((mealPlan) => (
                  <div key={mealPlan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{mealPlan.name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          mealPlan.is_ai_generated 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {mealPlan.is_ai_generated ? 'AI Generated' : 'Manual'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{mealPlan.description}</p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                          <span className="font-medium">{getDuration(mealPlan.start_date, mealPlan.end_date)} days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Period:</span>
                          <span className="font-medium">
                            {formatDate(mealPlan.start_date)} - {formatDate(mealPlan.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Calories:</span>
                          <span className="font-medium">{Number(mealPlan.total_calories)?.toFixed(0) || 'N/A'} cal</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Meals:</span>
                          <span className="font-medium">{mealPlan.meals?.length || 0} items</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMealPlan(mealPlan);
                              setShowMealPlanModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Link to={`/meal-plans/${mealPlan.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setMealPlanToDelete(mealPlan);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans yet</h3>
                <p className="text-gray-600 mb-4">Start creating your first meal plan!</p>
                <div className="flex items-center justify-center space-x-3">
                  <Link to="/meal-plans/ai-generate">
                    <Button variant="outline">
                      <Target className="w-4 h-4 mr-2" />
                      AI Generate
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Meal Plan Detail Modal */}
        {showMealPlanModal && selectedMealPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Meal Plan: {selectedMealPlan.name}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowMealPlanModal(false);
                    setSelectedMealPlan(null);
                  }}
                >
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedMealPlan.name}</div>
                    <div><strong>Description:</strong> {selectedMealPlan.description}</div>
                    <div><strong>Start Date:</strong> {formatDate(selectedMealPlan.start_date)}</div>
                    <div><strong>End Date:</strong> {formatDate(selectedMealPlan.end_date)}</div>
                    <div><strong>Duration:</strong> {getDuration(selectedMealPlan.start_date, selectedMealPlan.end_date)} days</div>
                    <div><strong>Type:</strong> {selectedMealPlan.is_ai_generated ? 'AI Generated' : 'Manual'}</div>
                    <div><strong>Created:</strong> {new Date(selectedMealPlan.created_at).toLocaleString()}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nutrition Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Calories:</strong> {Number(selectedMealPlan.total_calories)?.toFixed(0) || 'N/A'} cal</div>
                    <div><strong>Total Protein:</strong> {Number(selectedMealPlan.total_protein)?.toFixed(1) || 'N/A'}g</div>
                    <div><strong>Total Carbs:</strong> {Number(selectedMealPlan.total_carbs)?.toFixed(1) || 'N/A'}g</div>
                    <div><strong>Total Fat:</strong> {Number(selectedMealPlan.total_fat)?.toFixed(1) || 'N/A'}g</div>
                  </div>
                </div>
              </div>

              {selectedMealPlan.ai_prompt && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">AI Prompt</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                    {selectedMealPlan.ai_prompt}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Meal Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const dayMeals = selectedMealPlan.meals?.filter(meal => meal.day_of_week === day) || [];
                    return (
                      <div key={day} className="border border-gray-200 rounded-lg p-4">
                        <h5 className={`font-medium text-sm mb-3 px-2 py-1 rounded ${getDayColor(day)}`}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </h5>
                        <div className="space-y-2">
                          {dayMeals.length > 0 ? (
                            dayMeals.map((meal, index) => (
                              <div key={index} className="text-sm">
                                <div className="flex items-center mb-1">
                                  <span className="mr-2">{getMealTypeIcon(meal.meal_type)}</span>
                                  <span className="font-medium capitalize">{meal.meal_type}</span>
                                </div>
                                {meal.recipe ? (
                                  <div className="ml-6 text-gray-600">
                                    {meal.recipe.title}
                                    <div className="text-xs text-gray-500">
                                      {meal.recipe.calories_per_serving} cal
                                    </div>
                                  </div>
                                ) : meal.custom_meal_name ? (
                                  <div className="ml-6 text-gray-600">
                                    {meal.custom_meal_name}
                                  </div>
                                ) : (
                                  <div className="ml-6 text-gray-500 italic">
                                    No meal set
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 italic">No meals planned</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMealPlanModal(false);
                    setSelectedMealPlan(null);
                  }}
                >
                  Close
                </Button>
                <Link to={`/meal-plans/${selectedMealPlan.id}/edit`}>
                  <Button variant="primary">
                    Edit Meal Plan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && mealPlanToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Meal Plan
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMealPlanToDelete(null);
                  }}
                >
                  Close
                </Button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{mealPlanToDelete.name}"? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMealPlanToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteMealPlan(mealPlanToDelete.id)}
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

export default MealPlanPage;
