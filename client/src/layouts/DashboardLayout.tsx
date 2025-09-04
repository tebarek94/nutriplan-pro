import React, { useState, ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Calendar, 
  Star, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  BarChart3,
  Target,
  TrendingUp,
  MessageSquare,
  Utensils,
  Heart,
  Brain,
  CheckCircle
} from 'lucide-react';
import { cn } from '../utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  // User Navigation - Focus on viewing suggestions and AI-generated content
  const userNavigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      description: 'Overview of your nutrition journey'
    },
    { 
      name: 'AI Generation Hub', 
      href: '/ai-generation', 
      icon: Brain,
      description: 'Generate recipes and meal plans with AI'
    },
    { 
      name: 'Generate Meal Plan', 
      href: '/meal-plans/ai-generate', 
      icon: Calendar,
      description: 'Generate meal plans with AI'
    },
    { 
      name: 'Generate Recipe', 
      href: '/recipes/ai-generate', 
      icon: Utensils,
      description: 'Generate recipes with AI'
    },
    { 
      name: 'My Meal Plans', 
      href: '/meal-plans', 
      icon: Calendar,
      description: 'View and manage your meal plans'
    },

    { 
      name: 'Approved Meal Plans', 
      href: '/meal-plans/approved', 
      icon: CheckCircle,
      description: 'Browse approved meal plans'
    },
    { 
      name: 'Recipes', 
      href: '/recipes', 
      icon: BookOpen,
      description: 'Browse and manage recipes'
    },
    { 
      name: 'Suggestions', 
      href: '/suggestions', 
      icon: Star,
      description: 'View and create suggestions'
    },
    { 
      name: 'Approved Suggestions', 
      href: '/suggestions/approved', 
      icon: CheckCircle,
      description: 'Browse approved suggestions'
    },
    { 
      name: 'Progress', 
      href: '/progress', 
      icon: TrendingUp,
      description: 'Track your nutrition goals'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User,
      description: 'View and edit your profile'
    },
  ];

  // Admin Navigation - Kept as is but cleaned up
  const adminNavigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: Home,
      description: 'Admin overview and analytics'
    },
    { 
      name: 'User Management', 
      href: '/admin/users', 
      icon: User,
      description: 'Manage user accounts'
    },
    { 
      name: 'Recipe Management', 
      href: '/admin/recipes', 
      icon: BookOpen,
      description: 'Manage all recipes'
    },
    { 
      name: 'Meal Plans', 
      href: '/admin/meal-plans', 
      icon: Calendar,
      description: 'Manage meal plans'
    },
    { 
      name: 'User Suggestions', 
      href: '/admin/suggestions', 
      icon: MessageSquare,
      description: 'Manage user suggestions'
    },
    { 
      name: 'Meal Suggestions', 
      href: '/admin/suggestions/meals', 
      icon: Star,
      description: 'Manage meal suggestions'
    },
    { 
      name: 'Recipe Suggestions', 
      href: '/admin/suggestions/recipes', 
      icon: Star,
      description: 'Manage recipe suggestions'
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: BarChart3,
      description: 'View analytics and reports'
    },
  ];

  // User Quick Actions - Focus on viewing and tracking
  const userQuickActions = [
    { 
      name: 'AI Generation Hub', 
      href: '/ai-generation', 
      icon: Brain,
      color: 'bg-purple-500'
    },
    { 
      name: 'Generate Meal Plan', 
      href: '/meal-plans/ai-generate', 
      icon: Calendar,
      color: 'bg-blue-500'
    },
    { 
      name: 'Generate Recipe', 
      href: '/recipes/ai-generate', 
      icon: Utensils,
      color: 'bg-green-500'
    },
  ];

  // Determine current navigation based on user role
  const currentNavigation = isAdmin ? adminNavigation : userNavigation;
  const currentQuickActions = isAdmin ? [] : userQuickActions;

  const isActive = (href: string) => {
    // Handle exact matches for dashboard routes
    if (href === '/dashboard' || href === '/admin' || href === '/user') {
      return location.pathname === href;
    }
    // Handle admin routes specifically
    if (href.startsWith('/admin/')) {
      return location.pathname.startsWith(href);
    }
    // Handle user routes specifically
    if (href.startsWith('/user/') || href === '/user') {
      return location.pathname.startsWith(href);
    }
    // For other routes, check if path starts with href
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-bold text-lg">N</span>
              </div>
              <div className="text-white">
                <span className="text-xl font-bold">NutriPlan</span>
                <span className="text-xs block text-blue-100">Pro</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions - Only for regular users */}
          {!isAdmin && currentQuickActions.length > 0 && (
            <div className="px-3 lg:px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {currentQuickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.name}
                      to={action.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", action.color)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span>{action.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 lg:px-4 py-4 space-y-1 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {isAdmin ? 'Admin Navigation' : 'User Navigation'}
            </h3>
            {currentNavigation.map((item) => {
              const Icon = item.icon;
              const isItemActive = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isItemActive
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                  title={item.description}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isItemActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  )} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="px-3 lg:px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <Link
                to="/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 lg:left-72 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-40 h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left side */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search recipes, meal plans..."
                className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 flex-1"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle size="sm" />
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">No new notifications</div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isAdmin ? "bg-red-600" : "bg-blue-600"
                )}>
                  <span className="text-white text-sm font-semibold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isAdmin ? 'Administrator' : 'User'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Profile Settings
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Preferences
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with proper spacing for fixed header and sidebar */}
      <div className="lg:ml-72 pt-16 min-h-screen">
        <main className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(userMenuOpen || notificationsOpen) && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setUserMenuOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
