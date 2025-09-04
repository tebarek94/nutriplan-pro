import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3, Users, ChefHat, Calendar, Star, TrendingUp, TrendingDown, Activity, 
  ArrowLeft, Eye, Download, Filter, RefreshCw, Target, Heart, MessageSquare
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growthRate: number;
  };
  recipes: {
    total: number;
    approved: number;
    pending: number;
    avgRating: number;
    totalLikes: number;
  };
  mealPlans: {
    total: number;
    aiGenerated: number;
    userCreated: number;
    avgCalories: number;
  };
  suggestions: {
    total: number;
    pending: number;
    approved: number;
    implemented: number;
    rejected: number;
  };
  recentActivity: {
    newUsers: Array<{
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      created_at: string;
    }>;
    newRecipes: Array<{
      id: number;
      title: string;
      user_id: number;
      created_at: string;
      user?: {
        first_name: string;
        last_name: string;
      };
    }>;
    popularRecipes: Array<{
      id: number;
      title: string;
      avg_rating: number;
      like_count: number;
      user?: {
        first_name: string;
        last_name: string;
      };
    }>;
  };
  monthlyStats: {
    users: number[];
    recipes: number[];
    mealPlans: number[];
  };
}

const AdminAnalyticsPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }

    fetchAnalytics();
  }, [isAuthenticated, isAdmin, navigate, timeRange, refreshKey]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboardAnalytics();
      
      if (response.success) {
        setAnalytics(response.data);
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Analytics refreshed');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('Export functionality coming soon');
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '0.0%';
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getGrowthColor = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'text-gray-600';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value: number | null | undefined) => {
    if (value === null || value === undefined) return <Activity className="w-4 h-4" />;
    return value >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Analytics Data</h2>
          <p className="text-gray-600 mb-4">Unable to load analytics data.</p>
          <Button onClick={handleRefresh}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive platform insights and metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Card */}
          <Card padding="md">
            
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.users.total)}</p>
                  <div className="flex items-center mt-2">
                    {getGrowthIcon(analytics.users.growthRate)}
                    <span className={`text-sm font-medium ml-1 ${getGrowthColor(analytics.users.growthRate)}`}>
                      {formatPercentage(analytics.users.growthRate)}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">{formatNumber(analytics.users.active)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">New This Month</span>
                  <span className="font-medium">{formatNumber(analytics.users.newThisMonth)}</span>
                </div>
              </div>
            
          </Card>

          {/* Recipes Card */}
          <Card padding="md">
            
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.recipes.total)}</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium ml-1 text-gray-600">
                      {typeof analytics.recipes.avgRating === 'number' ? analytics.recipes.avgRating.toFixed(1) : '0.0'} avg rating
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <ChefHat className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-medium text-green-600">{formatNumber(analytics.recipes.approved)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-yellow-600">{formatNumber(analytics.recipes.pending)}</span>
                </div>
              </div>
            
          </Card>

          {/* Meal Plans Card */}
          <Card padding="md">
            
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Meal Plans</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.mealPlans.total)}</p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium ml-1 text-gray-600">
                      {typeof analytics.mealPlans.avgCalories === 'number' ? analytics.mealPlans.avgCalories.toFixed(0) : '0'} avg calories
                    </span>
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AI Generated</span>
                  <span className="font-medium text-purple-600">{formatNumber(analytics.mealPlans.aiGenerated)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">User Created</span>
                  <span className="font-medium text-blue-600">{formatNumber(analytics.mealPlans.userCreated)}</span>
                </div>
              </div>
            
          </Card>

          {/* Suggestions Card */}
          <Card padding="md">
            
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suggestions</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.suggestions.total)}</p>
                  <div className="flex items-center mt-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium ml-1 text-gray-600">
                      {analytics.suggestions.pending} pending
                    </span>
                  </div>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-medium text-green-600">{formatNumber(analytics.suggestions.approved)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Implemented</span>
                  <span className="font-medium text-blue-600">{formatNumber(analytics.suggestions.implemented)}</span>
                </div>
              </div>
            
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <Card padding="md">
            
            
              <div className="space-y-4">
                {/* New Users */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Users</h4>
                  <div className="space-y-2">
                    {analytics.recentActivity.newUsers.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(user.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* New Recipes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Recipes</h4>
                  <div className="space-y-2">
                    {analytics.recentActivity.newRecipes.slice(0, 3).map((recipe) => (
                      <div key={recipe.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <ChefHat className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{recipe.title}</p>
                            <p className="text-xs text-gray-500">
                              by {recipe.user?.first_name || 'Unknown'} {recipe.user?.last_name || ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(recipe.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            
          </Card>

          {/* Popular Recipes */}
          <Card padding="md">
            
            
              <div className="space-y-3">
                {analytics.recentActivity.popularRecipes.slice(0, 5).map((recipe, index) => (
                  <div key={recipe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{recipe.title}</p>
                        <p className="text-xs text-gray-500">
                          by {recipe.user?.first_name || 'Unknown'} {recipe.user?.last_name || ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm font-medium">{typeof recipe.avg_rating === 'number' ? recipe.avg_rating.toFixed(1) : '0.0'}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-gray-500">{recipe.like_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            
          </Card>
        </div>

        {/* Quick Actions */}
        <Card padding="md">
          
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/recipes">
                <Button variant="outline" className="w-full justify-start">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Manage Recipes
                </Button>
              </Link>
              <Link to="/admin/meal-plans">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Meal Plans
                </Button>
              </Link>
              <Link to="/admin/suggestions">
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Manage Suggestions
                </Button>
              </Link>
            </div>
          
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
