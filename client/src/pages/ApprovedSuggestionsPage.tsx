import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  Search, 
  Filter,
  ArrowLeft,
  Eye,
  MessageSquare,
  Users,
  CheckCircle,
  Calendar
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
  upvotes: number;
  downvotes: number;
  interaction_count: number;
}

const ApprovedSuggestionsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [suggestions, setSuggestions] = useState<ApprovedSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchApprovedSuggestions();
  }, [isAuthenticated, currentPage]);

  const fetchApprovedSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.getApprovedSuggestions({
        page: currentPage,
        limit: 12
      });

      if (response.success) {
        setSuggestions(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      } else {
        toast.error('Failed to fetch approved suggestions');
      }
    } catch (error) {
      console.error('Error fetching approved suggestions:', error);
      toast.error('Error fetching approved suggestions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = 
      suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${suggestion.user.first_name} ${suggestion.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || suggestion.suggestion_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    return status === 'implemented' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'recipe' ? '🍳' : '📅';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view approved suggestions.</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Approved Suggestions</h1>
                <p className="text-gray-600">Discover admin-approved suggestions from the community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search suggestions by title, description, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="recipe">Recipes</option>
              <option value="meal_plan">Meal Plans</option>
            </select>
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card padding="md">
              
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                  </div>
                </div>
              
            </Card>
            <Card padding="md">
              
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Implemented</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {suggestions.filter(s => s.status === 'implemented').length}
                    </p>
                  </div>
                </div>
              
            </Card>
            <Card padding="md">
              
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Community Creators</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(suggestions.map(s => s.user.first_name + ' ' + s.user.last_name)).size}
                    </p>
                  </div>
                </div>
              
            </Card>
            <Card padding="md">
              
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {suggestions.reduce((sum, s) => sum + s.interaction_count, 0)}
                    </p>
                  </div>
                </div>
              
            </Card>
          </div>
        </div>

        {/* Suggestions Grid */}
        {filteredSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
                
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getTypeIcon(suggestion.suggestion_type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(suggestion.status)}`}>
                      {suggestion.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{suggestion.description}</p>
                  
                  {suggestion.admin_response && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Admin Response:</p>
                      <p className="text-sm text-gray-600">{suggestion.admin_response}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>by {suggestion.user.first_name} {suggestion.user.last_name}</span>
                    <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <span className="text-green-500 mr-1">↑</span>
                        {suggestion.upvotes}
                      </span>
                      <span className="flex items-center">
                        <span className="text-red-500 mr-1">↓</span>
                        {suggestion.downvotes}
                      </span>
                    </div>
                    <span className="capitalize">{suggestion.suggestion_type.replace('_', ' ')}</span>
                  </div>
                  
                  <Link to={`/suggestions/${suggestion.id}`}>
                    <Button className="w-full" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="md">
            
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No approved suggestions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'No suggestions match your search criteria.' 
                  : 'No approved suggestions are available yet.'}
              </p>
              {(searchTerm || filterType !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }} 
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedSuggestionsPage;
