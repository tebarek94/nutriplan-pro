// User related types
export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  reset_token?: string;
  reset_token_expires?: Date;
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

// Food and recipe related types
export interface FoodCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

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
  created_at: Date;
  updated_at: Date;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit: string;
  notes?: string;
  created_at: Date;
}

export interface RecipeReview {
  id: number;
  recipe_id: number;
  user_id: number;
  rating: number;
  review?: string;
  created_at: Date;
  updated_at: Date;
}

// Meal planning related types
export interface MealPlan {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  is_ai_generated: boolean;
  ai_prompt?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MealPlanItem {
  id: number;
  meal_plan_id: number;
  recipe_id?: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  custom_meal_name?: string;
  custom_ingredients?: any[];
  custom_nutrition?: any;
  created_at: Date;
}

// Grocery list related types
export interface GroceryList {
  id: number;
  user_id: number;
  meal_plan_id?: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface GroceryListItem {
  id: number;
  grocery_list_id: number;
  ingredient_id?: number;
  custom_item_name?: string;
  quantity: number;
  unit: string;
  category_id?: number;
  is_checked: boolean;
  notes?: string;
  created_at: Date;
}

// AI analysis types
export interface AIAnalysisLog {
  id: number;
  user_id?: number;
  analysis_type: 'meal_plan' | 'recipe_suggestion' | 'nutrition_analysis';
  prompt: string;
  response: string;
  tokens_used?: number;
  processing_time_ms?: number;
  created_at: Date;
}

// User favorites
export interface UserFavorite {
  id: number;
  user_id: number;
  recipe_id: number;
  created_at: Date;
}

// API Request/Response types
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
  user: Omit<User, 'password'>;
  token: string;
}

export interface CreateUserProfileRequest {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  fitness_goal?: 'weight_loss' | 'maintenance' | 'muscle_gain';
  dietary_preferences?: string[];
  allergies?: string[];
  medical_conditions?: string;
}

export interface CreateRecipeRequest {
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
  ingredients: Array<{
    ingredient_id: number;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
}

export interface CreateMealPlanRequest {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  meals: Array<{
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    recipe_id?: number;
    custom_meal_name?: string;
    custom_ingredients?: any[];
    custom_nutrition?: any;
  }>;
}

export interface AIGenerateMealPlanRequest {
  user_profile: CreateUserProfileRequest;
  start_date: string;
  end_date: string;
  preferences?: {
    cuisine_preferences?: string[];
    meal_preferences?: string[];
    budget_constraints?: string;
    cooking_skill_level?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface AIGenerateRecipeRequest {
  title?: string;
  cuisine_type?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  dietary_preferences?: string[];
  ingredients_available?: string[];
  cooking_time?: number;
  servings?: number;
  description?: string;
  user_profile?: CreateUserProfileRequest;
}

export interface AIGenerateWeeklyMealPlanRequest {
  user_profile: CreateUserProfileRequest;
  week_start_date: string;
  preferences?: {
    cuisine_preferences?: string[];
    meal_preferences?: string[];
    budget_constraints?: string;
    cooking_skill_level?: 'beginner' | 'intermediate' | 'advanced';
    meals_per_day?: number;
    calorie_target?: number;
  };
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SearchFilters {
  query?: string;
  category_id?: number;
  dietary_tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine_type?: string;
  min_calories?: number;
  max_calories?: number;
  is_approved?: boolean;
  is_featured?: boolean;
}

// JWT Payload
export interface JWTPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// File upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
