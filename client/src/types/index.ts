// User related types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitness_goal?: 'weight_loss' | 'maintenance' | 'muscle_gain';
  dietary_preferences?: string[];
  allergies?: string[];
  medical_conditions?: string;
  phone?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

// Recipe related types
export interface Recipe {
  id: number;
  title: string;
  description?: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  servings: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine_type?: string;
  dietary_tags?: string[];
  image_url?: string;
  video_url?: string;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  fiber_per_serving?: number;
  sugar_per_serving?: number;
  sodium_per_serving?: number;
  created_by?: number;
  is_approved: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit: string;
  notes?: string;
  created_at: string;
}

export interface RecipeReview {
  id: number;
  recipe_id: number;
  user_id: number;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

// Meal plan types
export interface MealPlan {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  is_ai_generated: boolean;
  ai_prompt?: string;
  created_at: string;
  updated_at: string;
  meals?: MealPlanItem[];
}

export interface MealPlanItem {
  id: number;
  meal_plan_id: number;
  recipe_id?: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  custom_meal_name?: string;
  custom_ingredients?: any;
  custom_nutrition?: any;
  created_at: string;
}

// Suggestion types
export interface MealSuggestion {
  id: number;
  title: string;
  description?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cuisine_type?: string;
  dietary_tags?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time?: number;
  cook_time?: number;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  fiber_per_serving?: number;
  sugar_per_serving?: number;
  sodium_per_serving?: number;
  image_url?: string;
  ingredients?: any;
  instructions?: string;
  tips?: string;
  created_by: number;
  is_active: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeSuggestion {
  id: number;
  title: string;
  description?: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine_type?: string;
  dietary_tags?: string[];
  image_url?: string;
  video_url?: string;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  fiber_per_serving?: number;
  sugar_per_serving?: number;
  sodium_per_serving?: number;
  ingredients?: any;
  tips?: string;
  nutrition_notes?: string;
  created_by: number;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserSuggestion {
  id: number;
  user_id: number;
  suggestion_type: 'recipe' | 'meal_plan';
  title: string;
  description: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  admin_response?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  interaction_count?: number;
  upvotes?: number;
  downvotes?: number;
}

// Food categories and ingredients
export interface FoodCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  category_id?: number;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  vitamins?: Record<string, number>;
  allergens?: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// AI Generation types
export interface AIGenerateMealPlanRequest {
  user_profile: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    weight?: number;
    height?: number;
    activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
    fitness_goal?: 'weight_loss' | 'maintenance' | 'muscle_gain';
    dietary_preferences?: string[];
    allergies?: string[];
    medical_conditions?: string;
  };
  start_date: string;
  end_date: string;
  preferences?: {
    cuisine_preferences?: string[];
    meal_preferences?: string[];
    budget_constraints?: string;
    cooking_skill_level?: 'beginner' | 'intermediate' | 'advanced';
    meals_per_day?: number;
    calorie_target?: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

// Error types
export interface AppError {
  message: string;
  statusCode?: number;
  isOperational?: boolean;
}
