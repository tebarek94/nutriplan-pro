import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Bookmark, Star, Clock, Users, Search, Filter, Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import DataTable from '../components/ui/DataTable';
import { useSuggestions } from '../hooks';
import { validateRequired } from '../utils';

const SuggestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getMealSuggestions, getApprovedSuggestions, toggleMealSuggestionInteraction, toggleRecipeSuggestionInteraction, loading, error, clearError } = useSuggestions();
  const [mealSuggestions, setMealSuggestions] = useState<any[]>([]);
  const [recipeSuggestions, setRecipeSuggestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'meals' | 'recipes'>('meals');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    loadSuggestions();
  }, [activeTab]);

  const loadSuggestions = async () => {
    if (activeTab === 'meals') {
      const data = await getMealSuggestions({ 
        page: currentPage, 
        limit: 12
      });
      if (data) {
        setMealSuggestions(data || []);
      }
        } else {
      const data = await getApprovedSuggestions({ 
        page: currentPage, 
        limit: 12
      });
      if (data) {
        setRecipeSuggestions(data || []);
      }
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
    loadSuggestions();
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    loadSuggestions();
  };

  const handleInteraction = async (suggestionId: number, type: 'meals' | 'recipes', interactionType: 'view' | 'like' | 'save' | 'try') => {
    try {
      let success;
      if (type === 'meals') {
        success = await toggleMealSuggestionInteraction(suggestionId, interactionType);
      } else {
        success = await toggleRecipeSuggestionInteraction(suggestionId, interactionType);
      }
      
      if (success) {
        // Optionally refresh the suggestions to update counts
        loadSuggestions();
      }
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const mealSuggestionColumns = [
    {
      key: 'title',
      label: 'Meal Suggestion',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
            <Star className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{value}</h4>
            <p className="text-sm text-gray-500">{row.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'nutrition',
      label: 'Nutrition',
      render: (value: any, row: any) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Calories:</span>
            <span className="font-medium">{row.calories_per_serving || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Protein:</span>
            <span className="font-medium">{row.protein_per_serving || 0}g</span>
          </div>
        </div>
      )
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'easy' ? 'bg-green-100 text-green-800' :
          value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value?.toUpperCase() || 'MEDIUM'}
        </span>
      )
    },
    {
      key: 'time',
      label: 'Time',
      render: (value: any, row: any) => (
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1 text-gray-400" />
          <span className="text-sm">{(row.prep_time || 0) + (row.cook_time || 0)}m</span>
        </div>
      )
    },
    {
      key: 'view_count',
      label: 'Views',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          <Eye className="w-4 h-4 mr-1 text-gray-400" />
          <span className="text-sm">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleInteraction(row.id, 'meals', 'like')}
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleInteraction(row.id, 'meals', 'save')}
          >
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleInteraction(row.id, 'meals', 'try')}
          >
            Try
          </Button>
        </div>
      )
    }
  ];

  const recipeSuggestionColumns = [
    {
      key: 'title',
      label: 'Recipe Suggestion',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{value}</h4>
            <p className="text-sm text-gray-500">{row.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'servings',
      label: 'Servings',
      render: (value: number) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-400" />
          <span className="text-sm">{value || 1}</span>
        </div>
      )
    },
    {
      key: 'nutrition',
      label: 'Nutrition',
      render: (value: any, row: any) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Calories:</span>
            <span className="font-medium">{row.calories_per_serving || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Protein:</span>
            <span className="font-medium">{row.protein_per_serving || 0}g</span>
          </div>
        </div>
      )
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'easy' ? 'bg-green-100 text-green-800' :
          value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value?.toUpperCase() || 'MEDIUM'}
        </span>
      )
    },
    {
      key: 'time',
      label: 'Time',
      render: (value: any, row: any) => (
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1 text-gray-400" />
          <span className="text-sm">{(row.prep_time || 0) + (row.cook_time || 0)}m</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleInteraction(row.id, 'recipes', 'like')}
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleInteraction(row.id, 'recipes', 'save')}
          >
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleInteraction(row.id, 'recipes', 'try')}
          >
            Try
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Suggestions</h1>
          <p className="text-gray-600">Discover personalized meal and recipe suggestions powered by AI</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="outline" 
                fullWidth 
                className="sm:w-auto"
                onClick={() => loadSuggestions()}
              >
                <Star className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                fullWidth 
                className="sm:w-auto"
                onClick={() => navigate('/suggestions/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Suggestion
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'meals'
                  ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Meal Suggestions ({mealSuggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recipes'
                  ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recipe Suggestions ({recipeSuggestions.length})
          </button>
        </div>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <FormField
                  label="Search Suggestions"
                  name="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or description..."
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
                  { value: 'all', label: 'All Suggestions' },
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' },
                  { value: 'featured', label: 'Featured' }
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

        {/* Content */}
        {activeTab === 'meals' ? (
          <Card title="Meal Suggestions" 
            subtitle={`Showing ${mealSuggestions.length} meal suggestions`}
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
              data={mealSuggestions}
              columns={mealSuggestionColumns}
              loading={loading}
              error={error || undefined}
              emptyMessage="No meal suggestions found"
              className="overflow-hidden"
            />
          </Card>
        ) : (
          <Card title="Recipe Suggestions" 
            subtitle={`Showing ${recipeSuggestions.length} recipe suggestions`}
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
              data={recipeSuggestions}
              columns={recipeSuggestionColumns}
              loading={loading}
              error={error || undefined}
              emptyMessage="No recipe suggestions found"
              className="overflow-hidden"
            />
          </Card>
        )}

        {/* Empty State */}
        {((activeTab === 'meals' && mealSuggestions.length === 0) || 
          (activeTab === 'recipes' && recipeSuggestions.length === 0)) && !loading && (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'meals' 
                ? 'No meal suggestions are currently available. Check back later for personalized recommendations.'
                : 'No recipe suggestions are currently available. Check back later for personalized recommendations.'
              }
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPage;
