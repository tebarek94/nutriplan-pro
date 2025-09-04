import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, MessageSquare, Filter, Search, RefreshCw, Clock, Star } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { useAdmin } from '../hooks';

const AdminSuggestionsPage: React.FC = () => {
  const { getSuggestions, updateSuggestionStatus, getSuggestionAnalytics, loading, error } = useAdmin();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: 'pending',
    admin_response: ''
  });
  const [filters, setFilters] = useState({
    search: '',
    suggestion_type: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadSuggestions();
    loadAnalytics();
  }, [currentPage, filters]);

  const loadSuggestions = async () => {
    const data = await getSuggestions({
      page: currentPage,
      limit: 10,
      search: filters.search || undefined,
      suggestion_type: filters.suggestion_type !== 'all' ? filters.suggestion_type : undefined,
      status: filters.status !== 'all' ? filters.status : undefined
    });
    if (data) {
      setSuggestions(data);
    }
  };

  const loadAnalytics = async () => {
    const data = await getSuggestionAnalytics();
    if (data) {
      setAnalytics(data);
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedSuggestion) {
      const success = await updateSuggestionStatus(selectedSuggestion.id, statusForm);
      if (success) {
        setShowStatusModal(false);
        setSelectedSuggestion(null);
        loadSuggestions();
        loadAnalytics();
      }
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'title',
      label: 'Suggestion',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
            row.suggestion_type === 'meal' ? 'bg-orange-100' : 'bg-blue-100'
          }`}>
            <span className={`text-xs font-semibold ${
              row.suggestion_type === 'meal' ? 'text-orange-600' : 'text-blue-600'
            }`}>
              {row.suggestion_type === 'meal' ? 'M' : 'R'}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{value}</h4>
            <p className="text-sm text-gray-500">{row.description}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-400">by {row.first_name} {row.last_name}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">
                {new Date(row.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'suggestion_type',
      label: 'Type',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'meal' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value?.toUpperCase()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'approved' ? 'bg-green-100 text-green-800' :
          value === 'rejected' ? 'bg-red-100 text-red-800' :
          value === 'implemented' ? 'bg-purple-100 text-purple-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value?.toUpperCase()}
        </span>
      )
    },
    {
      key: 'interaction_count',
      label: 'Engagement',
      sortable: true,
      render: (value: number, row: any) => (
        <div className="text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">↑ {row.upvotes || 0}</span>
            <span className="text-red-600">↓ {row.downvotes || 0}</span>
          </div>
          <div className="text-gray-500 text-xs">
            {value || 0} interactions
          </div>
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
            onClick={() => {
              setSelectedSuggestion(row);
              setShowDetailModal(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSuggestion(row);
              setStatusForm({
                status: row.status,
                admin_response: row.admin_response || ''
              });
              setShowStatusModal(true);
            }}
          >
            <MessageSquare className="w-4 h-4" />
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Suggestions</h1>
              <p className="text-gray-600">Manage and review user-submitted meal and recipe suggestions</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  loadSuggestions();
                  loadAnalytics();
                }}
                loading={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card padding="md">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Suggestions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.statusStats?.reduce((acc: number, stat: any) => acc + stat.count, 0) || 0}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card padding="md">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.statusStats?.find((s: any) => s.status === 'approved')?.count || 0}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card padding="md">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.statusStats?.find((s: any) => s.status === 'pending')?.count || 0}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card padding="md">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Implemented</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.statusStats?.find((s: any) => s.status === 'implemented')?.count || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <FormField
                label="Search"
                name="search"
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search suggestions..."
                className="mb-0"
              />
            </div>
            <div>
              <FormField
                label="Type"
                name="suggestion_type"
                type="select"
                value={filters.suggestion_type}
                onChange={(e) => handleFilterChange('suggestion_type', e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'meal', label: 'Meal Suggestions' },
                  { value: 'recipe', label: 'Recipe Suggestions' }
                ]}
                className="mb-0"
              />
            </div>
            <div>
              <FormField
                label="Status"
                name="status"
                type="select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'implemented', label: 'Implemented' }
                ]}
                className="mb-0"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters({
                    search: '',
                    suggestion_type: 'all',
                    status: 'all'
                  });
                  setCurrentPage(1);
                }}
                variant="outline"
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Suggestions Table */}
        <Card title="User Suggestions" 
          subtitle={`Showing ${suggestions.length} suggestions`}
        >
          <DataTable
            data={suggestions}
            columns={columns}
            loading={loading}
            error={error || undefined}
            emptyMessage="No suggestions found"
            className="overflow-hidden"
          />
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedSuggestion?.title}
        size="lg"
      >
        {selectedSuggestion && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">{selectedSuggestion.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detailed Content</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedSuggestion.content}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submitted By</h4>
                <p className="text-gray-600">{selectedSuggestion.first_name} {selectedSuggestion.last_name}</p>
                <p className="text-sm text-gray-500">{selectedSuggestion.email}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submitted On</h4>
                <p className="text-gray-600">
                  {new Date(selectedSuggestion.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedSuggestion.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            {selectedSuggestion.admin_response && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Admin Response</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedSuggestion.admin_response}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  setStatusForm({
                    status: selectedSuggestion.status,
                    admin_response: selectedSuggestion.admin_response || ''
                  });
                  setShowStatusModal(true);
                }}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Suggestion Status"
      >
        <div className="space-y-6">
          <div>
            <FormField
              label="Status"
              name="status"
              type="select"
              value={statusForm.status}
              onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
              options={[
                { value: 'pending', label: 'Pending Review' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'implemented', label: 'Implemented' }
              ]}
            />
          </div>
          
          <div>
            <FormField
              label="Admin Response (Optional)"
              name="admin_response"
              type="textarea"
              value={statusForm.admin_response}
              onChange={(e) => setStatusForm(prev => ({ ...prev, admin_response: e.target.value }))}
              placeholder="Provide feedback or additional information..."
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              loading={loading}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSuggestionsPage;
