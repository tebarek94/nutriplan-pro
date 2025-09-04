import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  BookOpen, 
  Plus, 
  TrendingUp, 
  Target, 
  Eye,
  CheckCircle,
  MessageSquare,
  ChefHat,
  Brain,
  ArrowRight,
  Zap
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { useMealPlans } from '../hooks/user/useMealPlans';
import { useSuggestions } from '../hooks/user/useSuggestions';
import {  formatRelativeTime} from '../utils';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface DashboardStats {
  totalMealPlans: number;
  activeMealPlans: number;
  averageCalories: number;
  aiGeneratedPlans: number;
  aiGeneratedRecipes: number;
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

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserMealPlans, getMealPlanStats, getApprovedMealPlans, loading: mealPlansLoading, error: mealPlansError } = useMealPlans();
  const { getApprovedSuggestions, loading: suggestionsLoading, error: suggestionsError } = useSuggestions();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMealPlans, setRecentMealPlans] = useState<RecentMealPlan[]>([]);
  const [approvedMealPlans, setApprovedMealPlans] = useState<ApprovedMealPlan[]>([]);
  const [approvedSuggestions, setApprovedSuggestions] = useState<ApprovedSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingMeal, setGeneratingMeal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load meal plan stats
      const statsData = await getMealPlanStats();
      if (statsData) {
        setStats(statsData);
      }
      
      // Load recent meal plans
      const mealPlansData = await getUserMealPlans({ limit: 5 });
      if (mealPlansData) {
        const recentPlans = (mealPlansData || []).map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || '',
          start_date: plan.start_date,
          end_date: plan.end_date,
          total_calories: plan.total_calories || 0,
          total_protein: plan.total_protein || 0,
          total_carbs: plan.total_carbs || 0,
          total_fat: plan.total_fat || 0,
          created_at: plan.created_at
        }));
        setRecentMealPlans(recentPlans);
      }
      
      // Load approved meal plans
      const approvedMealPlansData = await getApprovedMealPlans({ limit: 6 });
      if (approvedMealPlansData) {
        setApprovedMealPlans(approvedMealPlansData || []);
      }
      
      // Load approved suggestions
      const approvedSuggestionsData = await getApprovedSuggestions({ limit: 5 });
      if (approvedSuggestionsData) {
        setApprovedSuggestions(approvedSuggestionsData || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMeal = async () => {
    setGeneratingMeal(true);
    try {
      // Navigate to AI generate page
      window.location.href = '/meal-plans/ai-generate';
    } catch (error) {
      console.error('Error generating meal:', error);
    } finally {
      setGeneratingMeal(false);
    }
  };

  const recentMealPlanColumns = [
    {
      key: 'name',
      label: 'MEAL PLAN',
      render: (value: string, row: RecentMealPlan) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{value}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{row.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'total_calories',
      label: 'CALORIES',
      render: (value: any) => (
        <div className="text-center">
          <span className="font-medium text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toFixed(2) : (value ? Number(value).toFixed(2) : '0.00')}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">kcal</p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'CREATED',
      render: (value: string) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatRelativeTime(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (value: any, row: RecentMealPlan) => (
        <Link to={`/meal-plans/${row.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>
      )
    }
  ];

  const approvedMealPlanColumns = [
    {
      key: 'name',
      label: 'MEAL PLAN',
      render: (value: string, row: ApprovedMealPlan) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{value}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{row.description}</p>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-500">
                by {row.created_by?.first_name || 'Unknown'} {row.created_by?.last_name || ''}
              </span>
              {row.is_ai_generated && (
                <Brain className="w-3 h-3 ml-2 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'total_calories',
      label: 'CALORIES',
      render: (value: any) => (
        <div className="text-center">
          <span className="font-medium text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toFixed(2) : (value ? Number(value).toFixed(2) : '0.00')}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">kcal</p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'CREATED',
      render: (value: string) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatRelativeTime(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (value: any, row: ApprovedMealPlan) => (
        <Link to={`/meal-plans/${row.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>
      )
    }
  ];

  const approvedSuggestionColumns = [
    {
      key: 'title',
      label: 'Suggestion',
      render: (value: string, row: ApprovedSuggestion) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{value}</h4>
            <p className="text-sm text-gray-500">{row.description}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
              row.suggestion_type === 'recipe' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {row.suggestion_type === 'recipe' ? 'Recipe' : 'Meal Plan'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'approved' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {value === 'approved' ? 'Approved' : 'Implemented'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {formatRelativeTime(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: ApprovedSuggestion) => (
        <Button variant="outline" size="sm">
          <ArrowRight className="w-4 h-4 mr-1" />
          Try
        </Button>
      )
    }
  ];

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user?.first_name}!</h1>
              <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your meal plans and suggestions</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="primary" 
                onClick={handleGenerateMeal}
                loading={generatingMeal}
                fullWidth className="sm:w-auto"
              >
                <Brain className="w-4 h-4 mr-2" />
                Generate AI Meal Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/ai-generation" className="block">
              <div className="text-center p-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Generation Hub</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Generate recipes and meal plans using AI</p>
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/meal-plans/ai-generate" className="block">
              <div className="text-center p-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generate Meal Plan</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">AI-powered meal planning</p>
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/recipes" className="block">
              <div className="text-center p-6">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Browse Recipes</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Discover delicious recipes</p>
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/meal-plans/create" className="block">
              <div className="text-center p-6">
                <div className="bg-gradient-to-br from-green-500 to-blue-500 text-white p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create Meal Plan</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Build a custom meal plan</p>
              </div>
            </Link>
          </Card>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Meal Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMealPlans}</p>
                </div>
              </div>
            </Card>
            
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeMealPlans}</p>
                </div>
              </div>
            </Card>
            
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Calories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageCalories}</p>
                </div>
              </div>
            </Card>
            
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Generated Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.aiGeneratedPlans}</p>
                </div>
              </div>
            </Card>
            
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <ChefHat className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Generated Recipes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.aiGeneratedRecipes}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Meal Plans */}
        <Card title="Recent Meal Plans" 
          subtitle={`Showing ${recentMealPlans.length} recent plans`}
          headerActions={
            <Link to="/meal-plans">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          }
          className="mb-8"
        >
          <DataTable
            data={recentMealPlans}
            columns={recentMealPlanColumns}
            loading={mealPlansLoading}
            error={mealPlansError || undefined}
            emptyMessage="No recent meal plans found"
            className="overflow-hidden"
          />
        </Card>

        {/* Approved Meal Plans */}
        <Card title="Approved Meal Plans" 
          subtitle={`Showing ${approvedMealPlans.length} approved plans`}
          headerActions={
            <Link to="/meal-plans/approved">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          }
          className="mb-8"
        >
          <DataTable
            data={approvedMealPlans}
            columns={approvedMealPlanColumns}
            loading={mealPlansLoading}
            error={mealPlansError || undefined}
            emptyMessage="No approved meal plans found"
            className="overflow-hidden"
          />
        </Card>

        {/* Approved Suggestions */}
        <Card title="Approved Suggestions" 
          subtitle={`Showing ${approvedSuggestions.length} approved suggestions`}
          headerActions={
            <Link to="/suggestions">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          }
        >
          <DataTable
            data={approvedSuggestions}
            columns={approvedSuggestionColumns}
            loading={suggestionsLoading}
            error={suggestionsError || undefined}
            emptyMessage="No approved suggestions found"
            className="overflow-hidden"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
