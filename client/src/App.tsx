import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import EnhancedUserDashboard from './pages/EnhancedUserDashboard';
import ProgressPage from './pages/ProgressPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import MealPlanPage from './pages/MealPlanPage';
import MealPlanDetailPage from './pages/MealPlanDetailPage';
import SuggestionsPage from './pages/SuggestionsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardLayout from './layouts/DashboardLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRecipesPage from './pages/AdminRecipesPage';
import AdminMealPlansPage from './pages/AdminMealPlansPage';
import AdminSuggestionsPage from './pages/AdminSuggestionsPage';
import AdminMealSuggestionsPage from './pages/AdminMealSuggestionsPage';
import AdminRecipeSuggestionsPage from './pages/AdminRecipeSuggestionsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

import CreateMealPlanPage from './pages/CreateMealPlanPage';
import EditMealPlanPage from './pages/EditMealPlanPage';
import AIGenerationDashboard from './pages/AIGenerationDashboard';
import AIGenerateRecipePage from './pages/AIGenerateRecipePage';
import ApprovedMealPlansPage from './pages/ApprovedMealPlansPage';
import ApprovedSuggestionsPage from './pages/ApprovedSuggestionsPage';
import AIGenerateMealPlanPage from './pages/AIGenerateMealPlanPage';
import UserRecipesPage from './pages/UserRecipesPage';
import SettingsPage from './pages/SettingsPage';
import { ProtectedRoute } from './components/user';
import { AdminRoute } from './components/admin';

const AppRoutes: React.FC = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </ProtectedRoute>
      } />

      {/* User routes with dashboard layout */}
      <Route path="/user" element={
        <ProtectedRoute>
          <EnhancedUserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/recipes" element={
        <ProtectedRoute>
          <DashboardLayout>
            <RecipesPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recipes/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <RecipeDetailPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recipes/manage" element={
        <ProtectedRoute>
          <DashboardLayout>
            <UserRecipesPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/meal-plans" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MealPlanPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/meal-plans/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MealPlanDetailPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/suggestions" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SuggestionsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute>
          <ProgressPage />
        </ProtectedRoute>
      } />

      {/* Admin routes with dashboard layout */}
      <Route path="/admin" element={
        <AdminRoute>
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <DashboardLayout>
            <AdminUsersPage />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/recipes" element={
        <AdminRoute>
          <DashboardLayout>
            <AdminRecipesPage />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/meal-plans" element={
        <AdminRoute>
          <DashboardLayout>
            <AdminMealPlansPage />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/suggestions" element={
        <AdminRoute>
          <DashboardLayout>
            <AdminSuggestionsPage />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/suggestions/meals" element={
        <AdminRoute>
          <DashboardLayout>
            <AdminMealSuggestionsPage />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/suggestions/recipes" element={
        <AdminRoute>
          <DashboardLayout>
            <AdminRecipeSuggestionsPage />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/admin/analytics" element={
        <AdminRoute>
          <DashboardLayout>
            <AdminAnalyticsPage />
          </DashboardLayout>
        </AdminRoute>
      } />


      {/* Meal Plan routes */}
      <Route path="/meal-plans/create" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CreateMealPlanPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/meal-plans/create" element={
        <AdminRoute>
          <DashboardLayout>
            <CreateMealPlanPage />
          </DashboardLayout>
        </AdminRoute>
      } />
      <Route path="/meal-plans/ai-generate" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AIGenerateMealPlanPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai-generation" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AIGenerationDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/recipes/ai-generate" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AIGenerateRecipePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/meal-plans/:id/edit" element={
        <ProtectedRoute>
          <DashboardLayout>
            <EditMealPlanPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Approved Content routes */}
      <Route path="/meal-plans/approved" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ApprovedMealPlansPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/suggestions/approved" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ApprovedSuggestionsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* 404 route */}
      <Route path="/*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
