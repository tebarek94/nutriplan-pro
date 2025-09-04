import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatCalories } from '../utils';
import { 
  Calendar, 
  BookOpen, 
  Star,  
  Target, 
  Eye,
  CheckCircle,
  Zap,
  ArrowRight,
  ChefHat
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DashboardLayout from '../layouts/DashboardLayout';

interface DashboardStats {
  totalMealPlans: number;
  activeMealPlans: number;
  averageCalories: number;
  aiGeneratedPlans: number;
  aiGeneratedRecipes: number;
  totalRecipes: number;
  totalSuggestions: number;
  weeklyProgress: number;
  goalCompletion: number;
}

interface RecentMealPlan {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  created_at: string;
}

interface ApprovedMealPlan {
  id: number;
  name: string;
  description: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  created_at: string;
  created_by: {
    first_name: string;
    last_name: string;
  };
  is_ai_generated: boolean;
}

interface ApprovedSuggestion {
  id: number;
  title: string;
  description: string;
  suggestion_type: 'recipe' | 'meal_plan';
  status: 'approved' | 'implemented';
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  };
  admin_response?: string;
}

interface QuickStats {
  todayCalories: number;
  weeklyAverage: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

const EnhancedUserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [recentMealPlans, setRecentMealPlans] = useState<RecentMealPlan[]>([]);
  const [approvedMealPlans, setApprovedMealPlans] = useState<ApprovedMealPlan[]>([]);
  const [approvedSuggestions, setApprovedSuggestions] = useState<ApprovedSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingMeal, setGeneratingMeal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, mealPlansResponse, approvedMealPlansResponse, approvedSuggestionsResponse] = await Promise.all([
          api.getMealPlanStats(),
          api.getUserMealPlans({ limit: 5 }),
          api.getApprovedMealPlans({ limit: 6 }),
          api.getApprovedSuggestions({ limit: 5 })
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (mealPlansResponse.success) {
          setRecentMealPlans(mealPlansResponse.data.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description || 'No description available',
            start_date: plan.start_date,
            end_date: plan.end_date,
            total_calories: plan.total_calories || 0,
            total_protein: plan.total_protein || 0,
            total_carbs: plan.total_carbs || 0,
            total_fat: plan.total_fat || 0,
            created_at: plan.created_at
          })));
        }

        if (approvedMealPlansResponse.success) {
          setApprovedMealPlans(approvedMealPlansResponse.data);
        }

        if (approvedSuggestionsResponse.success) {
          setApprovedSuggestions(approvedSuggestionsResponse.data);
        }

        // Mock quick stats for now
        setQuickStats({
          todayCalories: 1850,
          weeklyAverage: 1950,
          proteinGoal: 85,
          carbsGoal: 65,
          fatGoal: 70
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleGenerateMealPlan = async () => {
    setGeneratingMeal(true);
    try {
      // Simulate AI meal plan generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('AI meal plan generated successfully!');
    } catch (error) {
      toast.error('Failed to generate meal plan');
    } finally {
      setGeneratingMeal(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {getGreeting()}, {user?.first_name}! 👋
              </h1>
              <p className="text-primary-100">
                Ready to continue your nutrition journey? Here's what's happening today.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{quickStats?.todayCalories || 0}</div>
                <div className="text-xs text-primary-200">Today's Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{quickStats?.weeklyAverage || 0}</div>
                <div className="text-xs text-primary-200">Weekly Avg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/meal-plans/ai-generate"
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Generate Meal Plan</h3>
                <p className="text-sm text-gray-500">AI-powered meal planning</p>
              </div>
            </div>
          </Link>

          <Link
            to="/recipes"
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">Browse Recipes</h3>
                <p className="text-sm text-gray-500">Discover delicious recipes</p>
              </div>
            </div>
          </Link>

          <Link
            to="/suggestions"
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Get Suggestions</h3>
                <p className="text-sm text-gray-500">AI recommendations</p>
              </div>
            </div>
          </Link>

          <Link
            to="/progress"
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">Track Progress</h3>
                <p className="text-sm text-gray-500">View your goals</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Meal Plans</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMealPlans || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeMealPlans || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Recipes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalRecipes || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Generated Plans</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.aiGeneratedPlans || 0}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Card>
          
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Generated Recipes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.aiGeneratedRecipes || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Meal Plans */}
          <div className="lg:col-span-2">
            <Card title="Recent Meal Plans" padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Meal Plans</h2>
                <Link
                  to="/meal-plans"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
                {recentMealPlans.length > 0 ? (
                  <div className="space-y-4">
                    {recentMealPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{plan.name}</h3>
                          <p className="text-sm text-gray-500">{plan.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-400">
                              {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatCalories(plan.total_calories)} cal
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/meal-plans/${plan.id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans yet</h3>
                    <p className="text-gray-500 mb-4">Create your first meal plan to get started</p>
                    <Link to="/meal-plans/create">
                      <Button>Create Meal Plan</Button>
                    </Link>
                  </div>
                )}
            </Card>
          </div>

          {/* Quick Stats & Activity */}
          <div className="space-y-6">
            {/* Nutrition Goals */}
            <Card title="Today's Progress" padding="md">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Calories</span>
                      <span className="text-gray-900">{quickStats?.todayCalories || 0} / 2000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((quickStats?.todayCalories || 0) / 2000 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Protein</span>
                      <span className="text-gray-900">{quickStats?.proteinGoal || 0}g / 150g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((quickStats?.proteinGoal || 0) / 150 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Carbs</span>
                      <span className="text-gray-900">{quickStats?.carbsGoal || 0}g / 250g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((quickStats?.carbsGoal || 0) / 250 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Fat</span>
                      <span className="text-gray-900">{quickStats?.fatGoal || 0}g / 65g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((quickStats?.fatGoal || 0) / 65 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
            </Card>

            {/* Recent Activity */}
            <Card title="Recent Activity" padding="md">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Completed meal plan</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Added new recipe</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Received AI suggestion</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
            </Card>
          </div>
        </div>

        {/* Approved Suggestions */}
        {approvedSuggestions.length > 0 && (
          <Card title="Approved Suggestions" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Approved Suggestions</h2>
              <Link
                to="/suggestions"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedSuggestions.slice(0, 3).map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-green-600 uppercase">
                        {suggestion.suggestion_type}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{suggestion.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{suggestion.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>By {suggestion.user?.first_name || 'Unknown'} {suggestion.user?.last_name || ''}</span>
                      <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
          </Card>
        )}
             </div>
     </DashboardLayout>
   );
 };

export default EnhancedUserDashboard;
