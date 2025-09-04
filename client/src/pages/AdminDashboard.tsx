import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Star, 
  TrendingUp, 
  Activity,
  Eye,
  Heart,
  Plus,
  Settings,
  BarChart3,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { useAdmin } from '../hooks';
import { useRecipes } from '../hooks';
import { formatDate, formatRelativeTime } from '../utils';

interface AdminStats {
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
    newUsers: any[];
    newRecipes: any[];
    popularRecipes: any[];
  };
  monthlyStats: {
    users: number[];
    recipes: number[];
    mealPlans: number[];
  };
}

interface RecentUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface RecentRecipe {
  id: number;
  title: string;
  user_id: number;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getAdminDashboard, getAllUsers, loading: adminLoading, error: adminError } = useAdmin();
  const { getAllRecipes, loading: recipesLoading, error: recipesError } = useRecipes();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<RecentRecipe[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load dashboard analytics
      const dashboardData = await getAdminDashboard();
      if (dashboardData) {
        setStats(dashboardData);
      }
      
      // Load recent users
      const usersData = await getAllUsers({ limit: 5 });
      if (usersData) {
        setRecentUsers(usersData || []);
      }
      
      // Load recent recipes
      const recipesData = await getAllRecipes({ limit: 5 });
      if (recipesData) {
        setRecentRecipes(recipesData || []);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const recentUserColumns = [
    {
      key: 'name',
      label: 'User',
      render: (value: string, row: RecentUser) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{row.first_name} {row.last_name}</h4>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {formatRelativeTime(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: RecentUser) => (
        <Link to={`/admin/users/${row.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>
      )
    }
  ];

  const recentRecipeColumns = [
    {
      key: 'title',
      label: 'Recipe',
      render: (value: string, row: RecentRecipe) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{value}</h4>
            <p className="text-sm text-gray-500">
              by {row.user?.first_name} {row.user?.last_name}
            </p>
          </div>
        </div>
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
      render: (value: any, row: RecentRecipe) => (
        <Link to={`/admin/recipes/${row.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.first_name}. Here's what's happening on the platform.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Link to="/admin/settings">
                <Button variant="outline" fullWidth className="sm:w-auto">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link to="/admin/analytics">
                <Button variant="outline" fullWidth className="sm:w-auto">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Stats */}
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                  <p className="text-xs text-green-600">+{stats.users.newThisMonth} this month</p>
                </div>
              </div>
            </Card>
            
            {/* Recipes Stats */}
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recipes.total}</p>
                  <p className="text-xs text-orange-600">{stats.recipes.pending} pending</p>
                </div>
              </div>
            </Card>
            
            {/* Meal Plans Stats */}
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Meal Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.mealPlans.total}</p>
                  <p className="text-xs text-blue-600">{stats.mealPlans.aiGenerated} AI generated</p>
                </div>
              </div>
            </Card>
            
            {/* Suggestions Stats */}
            <Card padding="sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Suggestions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.suggestions.total}</p>
                  <p className="text-xs text-yellow-600">{stats.suggestions.pending} pending</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/users">
              <Button variant="outline" fullWidth>
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/recipes">
              <Button variant="outline" fullWidth>
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Recipes
              </Button>
            </Link>
            <Link to="/admin/suggestions">
              <Button variant="outline" fullWidth>
                <Star className="w-4 h-4 mr-2" />
                Review Suggestions
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button variant="outline" fullWidth>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card title="Recent Users" 
            subtitle={`Showing ${recentUsers.length} recent users`}
            headerActions={
              <Link to="/admin/users">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
          >
            <DataTable
              data={recentUsers}
              columns={recentUserColumns}
              loading={adminLoading}
              error={adminError || undefined}
              emptyMessage="No recent users found"
              className="overflow-hidden"
            />
          </Card>

          {/* Recent Recipes */}
          <Card title="Recent Recipes" 
            subtitle={`Showing ${recentRecipes.length} recent recipes`}
            headerActions={
              <Link to="/admin/recipes">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
          >
            <DataTable
              data={recentRecipes}
              columns={recentRecipeColumns}
              loading={recipesLoading}
              error={recipesError || undefined}
              emptyMessage="No recent recipes found"
              className="overflow-hidden"
            />
          </Card>
        </div>

        {/* System Status */}
        <Card title="System Status" className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">API Status</p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">AI Services</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pending Reviews</p>
                <p className="text-xs text-gray-500">{stats?.recipes.pending || 0} items</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
  );
};

export default AdminDashboard;
