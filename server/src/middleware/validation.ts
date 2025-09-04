import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../types';

/**
 * Generic validation middleware using Zod schema
 */
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = new Error('Validation failed') as AppError;
        validationError.statusCode = 400;
        validationError.isOperational = true;
        validationError.errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return next(validationError);
      }
      next(error);
    }
  };
};

// Validation schemas
export const authSchemas = {
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters')
    })
  }),

  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      first_name: z.string().min(2, 'First name must be at least 2 characters'),
      last_name: z.string().min(2, 'Last name must be at least 2 characters')
    })
  }),

  resetPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email format')
    })
  }),

  changePassword: z.object({
    body: z.object({
      current_password: z.string().min(1, 'Current password is required'),
      new_password: z.string().min(6, 'New password must be at least 6 characters')
    })
  }),

  updateUserInfo: z.object({
    body: z.object({
      first_name: z.string().min(2, 'First name must be at least 2 characters'),
      last_name: z.string().min(2, 'Last name must be at least 2 characters'),
      email: z.string().email('Invalid email format')
    })
  })
};

export const userProfileSchemas = {
  createProfile: z.object({
    body: z.object({
      age: z.number().min(1).max(120).optional(),
      gender: z.enum(['male', 'female', 'other']).optional(),
      weight: z.number().min(20).max(300).optional(),
      height: z.number().min(100).max(250).optional(),
      activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).optional(),
      fitness_goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
      dietary_preferences: z.array(z.string()).optional(),
      allergies: z.array(z.string()).optional(),
      medical_conditions: z.string().optional()
    })
  }),

  updateProfile: z.object({
    body: z.object({
      age: z.number().min(1).max(120).optional(),
      gender: z.enum(['male', 'female', 'other']).optional(),
      weight: z.number().min(20).max(300).optional(),
      height: z.number().min(100).max(250).optional(),
      activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).optional(),
      fitness_goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
      dietary_preferences: z.array(z.string()).optional(),
      allergies: z.array(z.string()).optional(),
      medical_conditions: z.string().optional(),
      phone: z.string().optional(),
      date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional()
    })
  })
};

export const recipeSchemas = {
  createRecipe: z.object({
    body: z.object({
      title: z.string().min(3, 'Title must be at least 3 characters'),
      description: z.string().optional(),
      instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
      prep_time: z.number().min(0).optional(),
      cook_time: z.number().min(0).optional(),
      servings: z.number().min(1, 'Servings must be at least 1'),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      cuisine_type: z.string().optional(),
      dietary_tags: z.array(z.string()).optional(),
      image_url: z.string().url().optional(),
      video_url: z.string().url().optional(),
      calories_per_serving: z.number().min(0).optional(),
      protein_per_serving: z.number().min(0).optional(),
      carbs_per_serving: z.number().min(0).optional(),
      fat_per_serving: z.number().min(0).optional(),
      fiber_per_serving: z.number().min(0).optional(),
      sugar_per_serving: z.number().min(0).optional(),
      sodium_per_serving: z.number().min(0).optional(),
      ingredients: z.array(z.object({
        name: z.string().min(1, 'Ingredient name is required'),
        amount: z.number().min(0.1, 'Amount must be greater than 0'),
        unit: z.string().min(1, 'Unit is required')
      })).min(1, 'At least one ingredient is required')
    })
  }),

  aiGenerateRecipe: z.object({
    body: z.object({
      title: z.string().optional(),
      cuisine_type: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      dietary_preferences: z.array(z.string()).optional(),
      ingredients_available: z.array(z.string()).optional(),
      cooking_time: z.number().min(5).max(300).optional(),
      servings: z.number().min(1).max(20).optional(),
      description: z.string().optional(),
      user_profile: z.object({
        age: z.number().min(1).max(120).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        weight: z.number().min(20).max(300).optional(),
        height: z.number().min(100).max(250).optional(),
        activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).optional(),
        fitness_goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
        dietary_preferences: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        medical_conditions: z.string().optional()
      }).optional()
    })
  }),

  updateRecipe: z.object({
    body: z.object({
      title: z.string().min(3).optional(),
      description: z.string().optional(),
      instructions: z.string().min(10).optional(),
      prep_time: z.number().min(0).optional(),
      cook_time: z.number().min(0).optional(),
      servings: z.number().min(1).optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      cuisine_type: z.string().optional(),
      dietary_tags: z.array(z.string()).optional(),
      image_url: z.string().url().optional(),
      video_url: z.string().url().optional(),
      calories_per_serving: z.number().min(0).optional(),
      protein_per_serving: z.number().min(0).optional(),
      carbs_per_serving: z.number().min(0).optional(),
      fat_per_serving: z.number().min(0).optional(),
      fiber_per_serving: z.number().min(0).optional(),
      sugar_per_serving: z.number().min(0).optional(),
      sodium_per_serving: z.number().min(0).optional()
    }),
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Invalid recipe ID')
    })
  }),

  recipeReview: z.object({
    body: z.object({
      rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
      comment: z.string().max(1000, 'Review must be less than 1000 characters').optional()
    }),
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Invalid recipe ID')
    })
  })
};

export const mealPlanSchemas = {
  createMealPlan: z.object({
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      description: z.string().optional(),
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      meals: z.array(z.object({
        meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
        day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        recipe_id: z.number().optional(),
        custom_meal_name: z.string().optional(),
        custom_ingredients: z.array(z.any()).optional(),
        custom_nutrition: z.any().optional()
      })).min(1, 'At least one meal is required')
    })
  }),

  aiGenerateMealPlan: z.object({
    body: z.object({
      user_profile: z.object({
        age: z.number().min(1).max(120).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        weight: z.number().min(20).max(300).optional(),
        height: z.number().min(100).max(250).optional(),
        activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).optional(),
        fitness_goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
        dietary_preferences: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        medical_conditions: z.string().optional()
      }),
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      preferences: z.object({
        duration_days: z.number().min(1).max(30).optional(),
        meals_per_day: z.number().min(1).max(6).optional(),
        cuisine_preferences: z.array(z.string()).optional(),
        difficulty_level: z.enum(['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced']).optional(),
        calorie_target: z.number().min(500).max(5000).optional()
      }).optional()
    })
  }),

  aiGenerateRecipe: z.object({
    body: z.object({
      title: z.string().optional(),
      cuisine_type: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      dietary_preferences: z.array(z.string()).optional(),
      ingredients_available: z.array(z.string()).optional(),
      cooking_time: z.number().min(5).max(300).optional(),
      servings: z.number().min(1).max(20).optional(),
      description: z.string().optional(),
      user_profile: z.object({
        age: z.number().min(1).max(120).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        weight: z.number().min(20).max(300).optional(),
        height: z.number().min(100).max(250).optional(),
        activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).optional(),
        fitness_goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
        dietary_preferences: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        medical_conditions: z.string().optional()
      }).optional()
    })
  }),

  aiGenerateWeeklyMealPlan: z.object({
    body: z.object({
      user_profile: z.object({
        age: z.number().min(1).max(120).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        weight: z.number().min(20).max(300).optional(),
        height: z.number().min(100).max(250).optional(),
        activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).optional(),
        fitness_goal: z.enum(['weight_loss', 'maintenance', 'muscle_gain']).optional(),
        dietary_preferences: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        medical_conditions: z.string().optional()
      }),
      week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      preferences: z.object({
        cuisine_preferences: z.array(z.string()).optional(),
        meal_preferences: z.array(z.string()).optional(),
        budget_constraints: z.string().optional(),
        cooking_skill_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        meals_per_day: z.number().min(1).max(6).optional(),
        calorie_target: z.number().min(500).max(5000).optional()
      }).optional()
    })
  })
};

export const groceryListSchemas = {
  createGroceryList: z.object({
    body: z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      meal_plan_id: z.number().optional()
    })
  }),

  addGroceryItem: z.object({
    body: z.object({
      ingredient_id: z.number().optional(),
      custom_item_name: z.string().optional(),
      quantity: z.number().min(0.1, 'Quantity must be greater than 0'),
      unit: z.string().min(1, 'Unit is required'),
      category_id: z.number().optional(),
      notes: z.string().optional()
    }),
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Invalid grocery list ID')
    })
  })
};

export const searchSchemas = {
  searchRecipes: z.object({
    query: z.object({
      q: z.string().optional(),
      category_id: z.string().regex(/^\d+$/).optional(),
      dietary_tags: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      cuisine_type: z.string().optional(),
      min_calories: z.string().regex(/^\d+$/).optional(),
      max_calories: z.string().regex(/^\d+$/).optional(),
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      sort_by: z.string().optional(),
      sort_order: z.enum(['asc', 'desc']).optional()
    })
  })
};

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});
