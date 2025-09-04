import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Star,
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
  Heart,
  MoreHorizontal,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { RecipeSuggestion } from '../types';

const AdminRecipeSuggestionsPage: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'not_featured'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RecipeSuggestion | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<RecipeSuggestion | null>(null);
  
  // Create suggestion form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    instructions: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    cuisine_type: '',
    dietary_tags: [] as string[],
    image_url: '',
    video_url: '',
    calories_per_serving: 0,
    protein_per_serving: 0,
    carbs_per_serving: 0,
    fat_per_serving: 0,
    fiber_per_serving: 0,
    sugar_per_serving: 0,
    sodium_per_serving: 0,
    ingredients: '',
    tips: '',
    nutrition_notes: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchRecipeSuggestions();
  }, [currentPage, searchTerm, filterStatus, filterFeatured]);

  const fetchRecipeSuggestions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filterStatus !== 'all') {
        params.is_active = filterStatus === 'active';
      }

      if (filterFeatured !== 'all') {
        params.is_featured = filterFeatured === 'featured';
      }

      const response = await api.getAllRecipeSuggestions(params);
      if (response.success) {
        setRecipeSuggestions(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching recipe suggestions:', error);
      toast.error('Failed to load recipe suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipeSuggestion = async () => {
    try {
      if (!createForm.title || !createForm.description || !createForm.instructions) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await api.createRecipeSuggestion(createForm);
      if (response.success) {
        toast.success('Recipe suggestion created successfully');
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          instructions: '',
          prep_time: 0,
          cook_time: 0,
          servings: 1,
          difficulty: 'easy',
          cuisine_type: '',
          dietary_tags: [],
          image_url: '',
          video_url: '',
          calories_per_serving: 0,
          protein_per_serving: 0,
          carbs_per_serving: 0,
          fat_per_serving: 0,
          fiber_per_serving: 0,
          sugar_per_serving: 0,
          sodium_per_serving: 0,
          ingredients: '',
          tips: '',
          nutrition_notes: ''
        });
        fetchRecipeSuggestions();
      }
    } catch (error: any) {
      console.error('Error creating recipe suggestion:', error);
      toast.error('Failed to create recipe suggestion');
    }
  };

  const handleUpdateRecipeSuggestion = async (suggestionId: number, data: Partial<RecipeSuggestion>) => {
    try {
      const response = await api.updateRecipeSuggestion(suggestionId, data);
      if (response.success) {
        toast.success('Recipe suggestion updated successfully');
        setShowSuggestionModal(false);
        setSelectedSuggestion(null);
        fetchRecipeSuggestions();
      }
    } catch (error: any) {
      console.error('Error updating recipe suggestion:', error);
      toast.error('Failed to update recipe suggestion');
    }
  };

  const handleDeleteRecipeSuggestion = async (suggestionId: number) => {
    try {
      const response = await api.deleteRecipeSuggestion(suggestionId);
      if (response.success) {
        toast.success('Recipe suggestion deleted successfully');
        setShowDeleteModal(false);
        setSuggestionToDelete(null);
        fetchRecipeSuggestions();
      }
    } catch (error: any) {
      console.error('Error deleting recipe suggestion:', error);
      toast.error('Failed to delete recipe suggestion');
    }
  };

  const handleToggleFeatured = async (suggestionId: number, isFeatured: boolean) => {
    try {
      const response = await api.toggleRecipeSuggestionFeatured(suggestionId);
      if (response.success) {
        toast.success(`Recipe suggestion ${isFeatured ? 'unfeatured' : 'featured'} successfully`);
        fetchRecipeSuggestions();
      }
    } catch (error: any) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRecipeSuggestions();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getFeaturedColor = (isFeatured: boolean) => {
    return isFeatured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success-600 bg-success-100';
      case 'medium': return 'text-warning-600 bg-warning-100';
      case 'hard': return 'text-error-600 bg-error-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusCounts = () => {
    const counts = {
      active: 0,
      inactive: 0,
      featured: 0,
      total: recipeSuggestions.length
    };

    recipeSuggestions.forEach(suggestion => {
      if (suggestion.is_active) {
        counts.active++;
      } else {
        counts.inactive++;
      }
      if (suggestion.is_featured) {
        counts.featured++;
      }
    });

    return counts;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Recipe Suggestions
              </h1>
              <p className="text-gray-600">
                Browse AI-generated recipe suggestions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                onClick={() => {
                  // TODO: Implement AI recipe generation
                  toast.success('AI recipe generation feature coming soon!');
                }}
              >
                <Star className="w-4 h-4 mr-2" />
                Generate AI Recipe
              </Button>
              {isAdmin && (
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Recipe Suggestion
                </Button>
              )}
              <Link to="/suggestions">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Suggestions
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            
              <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
              <div className="text-sm text-gray-600">Total Recipe Suggestions</div>
            
          </Card>
          <Card padding="md">
            
              <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            
          </Card>
          <Card padding="md">
            
              <div className="text-2xl font-bold text-red-600">{statusCounts.inactive}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            
          </Card>
          <Card padding="md">
            
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.featured}</div>
              <div className="text-sm text-gray-600">Featured</div>
            
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search recipe suggestions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Featured Filter */}
                <select
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Featured</option>
                  <option value="featured">Featured</option>
                  <option value="not_featured">Not Featured</option>
                </select>

                <Button type="submit" variant="primary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </form>
          
        </Card>

        {/* Recipe Suggestions Table */}
        <Card padding="md">
          <div>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          
          
            {recipeSuggestions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipe Suggestion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty & Servings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nutrition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipeSuggestions.map((suggestion) => (
                      <tr key={suggestion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{suggestion.title}</div>
                            <div className="text-sm text-gray-500">{suggestion.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(suggestion.difficulty)}`}>
                              {suggestion.difficulty.toUpperCase()}
                            </span>
                            <br />
                            <span className="text-sm text-gray-900">
                              {suggestion.servings} servings
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {suggestion.calories_per_serving} cal
                          </div>
                          <div className="text-sm text-gray-500">
                            P: {suggestion.protein_per_serving}g | C: {suggestion.carbs_per_serving}g | F: {suggestion.fat_per_serving}g
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(suggestion.is_active)}`}>
                              {suggestion.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <br />
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFeaturedColor(suggestion.is_featured)}`}>
                              {suggestion.is_featured ? 'Featured' : 'Not Featured'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(suggestion.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSuggestion(suggestion);
                                setShowSuggestionModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSuggestion(suggestion);
                                    setShowSuggestionModal(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleFeatured(suggestion.id, suggestion.is_featured)}
                                >
                                  <Star className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    setSuggestionToDelete(suggestion);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipe suggestions found</h3>
                <p className="text-gray-600">No recipe suggestions match your current filters.</p>
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

        {/* Create Recipe Suggestion Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Recipe Suggestion
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      placeholder="Enter recipe title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      rows={3}
                      placeholder="Enter recipe description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty *
                      </label>
                      <select
                        value={createForm.difficulty}
                        onChange={(e) => setCreateForm({ ...createForm, difficulty: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Servings *
                      </label>
                      <input
                        type="number"
                        value={createForm.servings}
                        onChange={(e) => setCreateForm({ ...createForm, servings: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuisine Type
                    </label>
                    <input
                      type="text"
                      value={createForm.cuisine_type}
                      onChange={(e) => setCreateForm({ ...createForm, cuisine_type: e.target.value })}
                      placeholder="e.g., Italian, Mexican, Asian"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prep Time (min)
                      </label>
                      <input
                        type="number"
                        value={createForm.prep_time}
                        onChange={(e) => setCreateForm({ ...createForm, prep_time: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cook Time (min)
                      </label>
                      <input
                        type="number"
                        value={createForm.cook_time}
                        onChange={(e) => setCreateForm({ ...createForm, cook_time: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calories per Serving
                      </label>
                      <input
                        type="number"
                        value={createForm.calories_per_serving}
                        onChange={(e) => setCreateForm({ ...createForm, calories_per_serving: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        value={createForm.protein_per_serving}
                        onChange={(e) => setCreateForm({ ...createForm, protein_per_serving: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        value={createForm.carbs_per_serving}
                        onChange={(e) => setCreateForm({ ...createForm, carbs_per_serving: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fat (g)
                      </label>
                      <input
                        type="number"
                        value={createForm.fat_per_serving}
                        onChange={(e) => setCreateForm({ ...createForm, fat_per_serving: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={createForm.image_url}
                      onChange={(e) => setCreateForm({ ...createForm, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={createForm.video_url}
                      onChange={(e) => setCreateForm({ ...createForm, video_url: e.target.value })}
                      placeholder="https://example.com/video.mp4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients *
                  </label>
                  <textarea
                    value={createForm.ingredients}
                    onChange={(e) => setCreateForm({ ...createForm, ingredients: e.target.value })}
                    rows={4}
                    placeholder="Enter ingredients list..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions *
                  </label>
                  <textarea
                    value={createForm.instructions}
                    onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                    rows={6}
                    placeholder="Enter cooking instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tips
                  </label>
                  <textarea
                    value={createForm.tips}
                    onChange={(e) => setCreateForm({ ...createForm, tips: e.target.value })}
                    rows={3}
                    placeholder="Enter cooking tips..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nutrition Notes
                  </label>
                  <textarea
                    value={createForm.nutrition_notes}
                    onChange={(e) => setCreateForm({ ...createForm, nutrition_notes: e.target.value })}
                    rows={3}
                    placeholder="Enter nutrition notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateRecipeSuggestion}
                >
                  Create Recipe Suggestion
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && suggestionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Recipe Suggestion
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSuggestionToDelete(null);
                  }}
                >
                  Close
                </Button>
              </div>

              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{suggestionToDelete.title}"? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSuggestionToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteRecipeSuggestion(suggestionToDelete.id)}
                >
                  Delete Recipe Suggestion
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRecipeSuggestionsPage;
