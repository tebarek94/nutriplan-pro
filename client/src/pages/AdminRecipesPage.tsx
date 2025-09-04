import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Users
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
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine_type: string;
  dietary_tags: string[];
  image_url: string;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  fiber_per_serving: number;
  sugar_per_serving: number;
  sodium_per_serving: number;
  ingredients: any[];
  tips: string;
  nutrition_notes: string;
  created_by: number;
  is_approved: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  avg_rating: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  creator_email?: string;
}

const AdminRecipesPage: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'featured'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    fetchRecipes();
  }, [currentPage, searchTerm, filterStatus, filterDifficulty]);

  const fetchRecipes = async () => {
    if (!isAuthenticated || !isAdmin) return;

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
        if (filterStatus === 'approved') {
          params.is_approved = true;
        } else if (filterStatus === 'pending') {
          params.is_approved = false;
        } else if (filterStatus === 'featured') {
          params.is_featured = true;
        }
      }

      if (filterDifficulty !== 'all') {
        params.difficulty = filterDifficulty;
      }

      const response = await api.getAllRecipes(params);
      if (response.success) {
        setRecipes(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecipe = async (recipeId: number, isApproved: boolean, isFeatured: boolean = false) => {
    try {
      const response = await api.approveRecipe(recipeId, { is_approved: isApproved, is_featured: isFeatured });
      if (response.success) {
        toast.success(`Recipe ${isApproved ? 'approved' : 'rejected'} successfully`);
        fetchRecipes(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error updating recipe status:', error);
      toast.error('Failed to update recipe status');
    }
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    try {
      const response = await api.deleteRecipe(recipeId);
      if (response.success) {
        toast.success('Recipe deleted successfully');
        setShowDeleteModal(false);
        setRecipeToDelete(null);
        fetchRecipes(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRecipes();
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'approved' && recipe.is_approved) ||
      (filterStatus === 'pending' && !recipe.is_approved) ||
      (filterStatus === 'featured' && recipe.is_featured);
    const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;
    return matchesStatus && matchesDifficulty;
  });

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

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Recipe Management
              </h1>
              <p className="text-gray-600">
                Manage all recipes on the platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                onClick={() => fetchRecipes()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => {/* Export functionality */}}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Link to="/admin/recipes/create">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recipe
                </Button>
              </Link>
            </div>
          </div>
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
                    placeholder="Search recipes..."
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
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="featured">Featured</option>
                </select>

                {/* Difficulty Filter */}
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <Button type="submit" variant="primary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </form>
          
        </Card>

        {/* Recipes Table */}
        <Card padding="md">
          <div>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          
          
            {filteredRecipes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
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
                    {filteredRecipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {recipe.image_url ? (
                                <img 
                                  className="h-12 w-12 rounded-lg object-cover" 
                                  src={recipe.image_url} 
                                  alt={recipe.title}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {recipe.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {recipe.description}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {recipe.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {recipe.creator_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {recipe.creator_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              recipe.is_approved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {recipe.is_approved ? 'Approved' : 'Pending'}
                            </span>
                            {recipe.is_featured && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                            {recipe.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 space-y-1">
                            <div className="flex items-center">
                              <Eye className="w-3 h-3 mr-1 text-gray-400" />
                              {recipe.view_count} views
                            </div>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1 text-yellow-400" />
                              {typeof recipe.avg_rating === 'number' ? recipe.avg_rating.toFixed(1) : '0.0'} rating
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1 text-blue-400" />
                              {recipe.like_count} likes
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(recipe.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRecipe(recipe);
                                setShowRecipeModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                                                    <Link to={`/recipes/${recipe.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                            {!recipe.is_approved ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleApproveRecipe(recipe.id, true)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleApproveRecipe(recipe.id, false)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setRecipeToDelete(recipe);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600">No recipes match your current filters.</p>
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

        {/* Recipe Detail Modal */}
        {showRecipeModal && selectedRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recipe Details: {selectedRecipe.title}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRecipeModal(false);
                    setSelectedRecipe(null);
                  }}
                >
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedRecipe.title}</div>
                    <div><strong>Description:</strong> {selectedRecipe.description}</div>
                    <div><strong>Difficulty:</strong> {selectedRecipe.difficulty}</div>
                    <div><strong>Cuisine Type:</strong> {selectedRecipe.cuisine_type}</div>
                    <div><strong>Servings:</strong> {selectedRecipe.servings}</div>
                    <div><strong>Prep Time:</strong> {selectedRecipe.prep_time} minutes</div>
                    <div><strong>Cook Time:</strong> {selectedRecipe.cook_time} minutes</div>
                    <div><strong>Status:</strong> {selectedRecipe.is_approved ? 'Approved' : 'Pending'}</div>
                    <div><strong>Featured:</strong> {selectedRecipe.is_featured ? 'Yes' : 'No'}</div>
                    <div><strong>Created:</strong> {new Date(selectedRecipe.created_at).toLocaleString()}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nutrition Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Calories:</strong> {selectedRecipe.calories_per_serving} per serving</div>
                    <div><strong>Protein:</strong> {selectedRecipe.protein_per_serving}g</div>
                    <div><strong>Carbs:</strong> {selectedRecipe.carbs_per_serving}g</div>
                    <div><strong>Fat:</strong> {selectedRecipe.fat_per_serving}g</div>
                    <div><strong>Fiber:</strong> {selectedRecipe.fiber_per_serving}g</div>
                    <div><strong>Sugar:</strong> {selectedRecipe.sugar_per_serving}g</div>
                    <div><strong>Sodium:</strong> {selectedRecipe.sodium_per_serving}mg</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                <div className="text-sm text-gray-600">
                  {selectedRecipe.ingredients?.map((ingredient: any, index: number) => (
                    <div key={index}>• {ingredient.name} - {ingredient.amount} {ingredient.unit}</div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedRecipe.instructions}
                </div>
              </div>

              {selectedRecipe.tips && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Tips</h4>
                  <div className="text-sm text-gray-600">
                    {selectedRecipe.tips}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRecipeModal(false);
                    setSelectedRecipe(null);
                  }}
                >
                  Close
                </Button>
                <Link to={`/recipes/${selectedRecipe.id}/edit`}>
                  <Button variant="primary">
                    Edit Recipe
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && recipeToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Recipe
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRecipeToDelete(null);
                  }}
                >
                  Close
                </Button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{recipeToDelete.title}"? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRecipeToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteRecipe(recipeToDelete.id)}
                >
                  Delete Recipe
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRecipesPage;
