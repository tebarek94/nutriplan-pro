import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Star, 
  Search, 
  Filter,
  ArrowLeft,
  Eye,
  Target,
  Users
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import { formatCalories } from '../utils';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

const ApprovedMealPlansPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mealPlans, setMealPlans] = useState<ApprovedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchApprovedMealPlans();
  }, [isAuthenticated, currentPage, searchTerm]);

  const fetchApprovedMealPlans = async () => {
    try {
      setLoading(true);
      const response = await api.getApprovedMealPlans({
        page: currentPage,
        limit: 12
      });

      if (response.success) {
        setMealPlans(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      } else {
        toast.error('Failed to fetch approved meal plans');
      }
    } catch (error) {
      console.error('Error fetching approved meal plans:', error);
      toast.error('Error fetching approved meal plans');
    } finally {
      setLoading(false);
    }
  };

  const filteredMealPlans = mealPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${plan.created_by.first_name} ${plan.created_by.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view approved meal plans.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Approved Meal Plans</h1>
                <p className="text-gray-600">Discover admin-approved meal plans from the community</p>
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
                placeholder="Search meal plans by name, description, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="md">
              
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Approved Plans</p>
                    <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                  </div>
                </div>
              
            </Card>
            <Card padding="md">
              
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Generated</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mealPlans.filter(plan => plan.is_ai_generated).length}
                    </p>
                  </div>
                </div>
              
            </Card>
            <Card padding="md">
              
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Community Creators</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(mealPlans.map(plan => plan.created_by.first_name + ' ' + plan.created_by.last_name)).size}
                    </p>
                  </div>
                </div>
              
            </Card>
          </div>
        </div>

        {/* Meal Plans Grid */}
        {filteredMealPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredMealPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    {plan.is_ai_generated && (
                      <Star className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{plan.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Calories:</span>
                      <span className="font-medium">{formatCalories(plan.total_calories)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Protein:</span>
                      <span className="font-medium">{plan.total_protein}g</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Carbs:</span>
                      <span className="font-medium">{plan.total_carbs}g</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fat:</span>
                      <span className="font-medium">{plan.total_fat}g</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>Created by {plan.created_by.first_name} {plan.created_by.last_name}</span>
                      <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <Link to={`/meal-plans/${plan.id}`}>
                      <Button className="w-full" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="md">
            
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No approved meal plans found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No meal plans match your search criteria.' : 'No approved meal plans are available yet.'}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  Clear Search
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

export default ApprovedMealPlansPage;
