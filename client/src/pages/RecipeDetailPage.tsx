import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Clock,
  Users,
  Star,
  Heart,
  Eye,
  Edit,
  ArrowLeft,
  ChefHat,
  Target,
  Info,
  Utensils,
  Calendar
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
  is_liked?: boolean;
  reviews?: any[];
}

const RecipeDetailPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await api.getRecipeById(Number(id));
        
        if (response.success) {
          setRecipe(response.data);
        } else {
          toast.error('Recipe not found');
          navigate('/recipes/manage');
        }
      } catch (error: any) {
        console.error('Error fetching recipe:', error);
        toast.error('Failed to load recipe');
        navigate('/recipes/manage');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, navigate]);

  const handleToggleLike = async () => {
    if (!user) {
      toast.error('Please login to like recipes');
      return;
    }

    try {
      setLiking(true);
      const response = await api.toggleRecipeLike(Number(id));
      
      if (response.success) {
        setRecipe(prev => prev ? {
          ...prev,
          is_liked: response.data?.liked,
          like_count: response.data?.liked ? prev.like_count + 1 : prev.like_count - 1
        } : null);
        toast.success(response.data?.message || 'Recipe updated');
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    } finally {
      setLiking(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🥄';
      case 'medium': return '🍳';
      case 'hard': return '👨‍🍳';
      default: return '🍽️';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Recipe Not Found</h2>
          <p className="text-gray-600 mb-4">The recipe you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/recipes/manage')}>
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/recipes/manage')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Recipes
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {recipe.title}
                </h1>
                <p className="text-gray-600">
                  {recipe.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user && recipe.created_by === user.id && (
                <Link to={`/recipes/${recipe.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              )}
              <Button
                variant={recipe.is_liked ? "primary" : "outline"}
                onClick={handleToggleLike}
                disabled={liking}
              >
                <Heart className={`w-4 h-4 mr-2 ${recipe.is_liked ? 'fill-current' : ''}`} />
                {recipe.like_count}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recipe Image */}
            {recipe.image_url && (
              <Card padding="md">
                
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-64 lg:h-96 object-cover rounded-lg"
                  />
                
              </Card>
            )}

            {/* Recipe Stats */}
            <Card padding="md">
              
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-gray-500 mr-2" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prep Time</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{recipe.prep_time} min</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <ChefHat className="w-5 h-5 text-gray-500 mr-2" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cook Time</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{recipe.cook_time} min</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-gray-500 mr-2" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Servings</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{recipe.servings}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="w-5 h-5 text-gray-500 mr-2" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty</p>
                    <div className="flex items-center justify-center">
                      <span className="text-lg mr-1">{getDifficultyIcon(recipe.difficulty)}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              
            </Card>

                         {/* Ingredients */}
             <Card title="Ingredients" padding="md">
               
               
                 <div className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      <span className="text-gray-900 dark:text-white">
                        <strong>{ingredient.name}</strong> - {ingredient.amount} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              
            </Card>

                         {/* Instructions */}
             <Card title="Instructions" padding="md">
               
               
                 <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {recipe.instructions}
                  </div>
                </div>
              
            </Card>

                         {/* Tips */}
             {recipe.tips && (
               <Card title="Cooking Tips" padding="md">
                 
                 
                   <p className="text-gray-700 dark:text-gray-300 italic">"{recipe.tips}"</p>
                
              </Card>
            )}

                         {/* Reviews */}
             {recipe.reviews && recipe.reviews.length > 0 && (
               <Card title={`Reviews (${recipe.reviews.length})`} padding="md">
                 
                 
                   <div className="space-y-4">
                    {recipe.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {review.rating}/5
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                        {review.reviewer_name && (
                          <p className="text-sm text-gray-500 mt-1">
                            - {review.reviewer_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recipe Info */}
            <Card padding="md">
              
              
                <div>
                  <p className="text-sm text-gray-600">Cuisine Type</p>
                  <p className="font-medium text-gray-900">{recipe.cuisine_type || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Views</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {recipe.view_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    {typeof recipe.avg_rating === 'number' ? recipe.avg_rating.toFixed(1) : '0.0'} / 5
                  </p>
                </div>
                {recipe.creator_name && (
                  <div>
                    <p className="text-sm text-gray-600">Created by</p>
                    <p className="font-medium text-gray-900">{recipe.creator_name}</p>
                  </div>
                )}
              
            </Card>

            {/* Dietary Tags */}
            {(() => {
              const dietaryTags = Array.isArray(recipe.dietary_tags) 
                ? recipe.dietary_tags 
                : typeof recipe.dietary_tags === 'string' 
                  ? JSON.parse(recipe.dietary_tags || '[]') 
                  : [];
              
              return dietaryTags.length > 0 ? (
                <Card padding="md">
                  
                  
                    <div className="flex flex-wrap gap-2">
                      {dietaryTags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  
                </Card>
              ) : null;
            })()}

            {/* Nutrition Information */}
            <Card padding="md">
              
              
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{recipe.calories_per_serving} cal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">{recipe.protein_per_serving}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">{recipe.carbs_per_serving}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-medium">{recipe.fat_per_serving}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fiber</span>
                  <span className="font-medium">{recipe.fiber_per_serving}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sugar</span>
                  <span className="font-medium">{recipe.sugar_per_serving}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sodium</span>
                  <span className="font-medium">{recipe.sodium_per_serving}mg</span>
                </div>
              
            </Card>

            {/* Nutrition Notes */}
            {recipe.nutrition_notes && (
              <Card padding="md">
                
                
                  <p className="text-gray-700 text-sm">{recipe.nutrition_notes}</p>
                
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
