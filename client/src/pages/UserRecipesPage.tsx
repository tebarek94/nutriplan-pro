import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter,
  Star,
  Clock,
  Users,
  Heart,
  Eye,
  Sparkles,
  Edit,
  Trash2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import DataTable from '../components/ui/DataTable';
import { useRecipes } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { validateRequired } from '../utils';
import { formatDate, formatRelativeTime } from '../utils';

const UserRecipesPage: React.FC = () => {
  const { getAllRecipes, loading, error } = useRecipes();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    loadUserRecipes();
  }, []);

  const loadUserRecipes = async () => {
    const data = await getAllRecipes({ 
      page: currentPage, 
      limit: 12,
      search: searchTerm || undefined,
      is_approved: undefined // Get all user recipes including pending ones
    });
    if (data) {
      // Filter to show only user's own recipes
      const userRecipes = data.filter((recipe: any) => recipe.created_by?.id === user?.id) || [];
      setRecipes(userRecipes);
    }
  };

  const handleSearch = () => {
    const validation = validateRequired(searchTerm, 'Search term');
    if (!validation.isValid) {
      setSearchError(validation.error || '');
      return;
    }
    setSearchError('');
    setCurrentPage(1);
    loadUserRecipes();
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    loadUserRecipes();
  };

  const recipeColumns = [
    {
      key: 'title',
      label: 'Recipe',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <img 
            src={row.image_url || '/placeholder-recipe.jpg'} 
            alt={value}
            className="w-12 h-12 rounded-lg object-cover mr-3"
          />
          <div>
            <h4 className="font-medium text-gray-900">{value}</h4>
            <p className="text-sm text-gray-500">{row.description}</p>
            {row.is_ai_generated && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generated
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string, row: any) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          row.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.is_approved ? 'Approved' : 'Pending'}
        </span>
      )
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'easy' ? 'bg-green-100 text-green-800' :
          value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'cooking_time',
      label: 'Time',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1 text-gray-400" />
          <span>{value} min</span>
        </div>
      )
    },
    {
      key: 'likes_count',
      label: 'Likes',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          <Heart className="w-4 h-4 mr-1 text-red-500" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value: string) => formatRelativeTime(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Link to={`/recipes/${row.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link to={`/recipes/${row.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Recipes</h1>
              <p className="text-gray-600">Manage and view your created recipes.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Link to="/recipes/ai-generate">
                <Button variant="primary" fullWidth className="sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate Recipe
                </Button>
              </Link>
              <Link to="/recipes">
                <Button variant="outline" fullWidth className="sm:w-auto">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse All Recipes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <FormField
                  label="Search My Recipes"
                  name="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, ingredients, or category..."
                  error={searchError}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <FormField
                label="Filter"
                name="filter"
                type="select"
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                options={[
                  { value: 'all', label: 'All My Recipes' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'ai-generated', label: 'AI Generated' },
                  { value: 'manual', label: 'Manual' }
                ]}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch} loading={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* User Recipes */}
        <Card title="My Recipes" 
          subtitle={`Showing ${recipes.length} recipes`}
          headerActions={
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Sort
              </Button>
            </div>
          }
        >
          <DataTable
            data={recipes}
            columns={recipeColumns}
            loading={loading}
            error={error || undefined}
            emptyMessage="You haven't created any recipes yet. Start by generating one with AI!"
            onRowClick={(row) => window.location.href = `/recipes/${row.id}`}
            className="overflow-hidden"
          />
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card padding="sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recipes.filter(r => r.is_approved).length}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recipes.filter(r => !r.is_approved).length}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recipes.filter(r => r.is_ai_generated).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserRecipesPage;
