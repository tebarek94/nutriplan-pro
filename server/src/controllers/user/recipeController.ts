import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import geminiService from '../../services/geminiService';
import { AIGenerateRecipeRequest } from '../../types';

// Get featured recipes
export const getFeaturedRecipes = async (req: Request, res: Response) => {
  try {
    const [recipes] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        r.*,
        u.first_name as creator_name,
        u.email as creator_email,
        COALESCE(rr.avg_rating, 0.00) as avg_rating,
        COALESCE(rr.review_count, 0) as review_count
       FROM recipes r
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN (
         SELECT recipe_id, AVG(rating) as avg_rating, COUNT(*) as review_count
         FROM recipe_reviews
         GROUP BY recipe_id
       ) rr ON r.id = rr.recipe_id
       WHERE r.is_featured = true AND r.is_approved = true
       ORDER BY r.created_at DESC
       LIMIT 10`
    );

    // Get ingredients for each recipe
    const recipesWithIngredients = await Promise.all(
      recipes.map(async (recipe) => {
        const [ingredients] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM recipe_ingredients WHERE recipe_id = ?',
          [recipe.id]
        );
        return {
          ...recipe,
          ingredients: ingredients.map(ing => ({
            name: ing.ingredient_name,
            amount: ing.amount,
            unit: ing.unit
          }))
        };
      })
    );

    return res.json({
      success: true,
      data: recipesWithIngredients
    });
  } catch (error: any) {
    console.error('Error fetching featured recipes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch featured recipes'
    });
  }
};

// Get all recipes with filtering and pagination
export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      is_approved,
      is_featured,
      difficulty,
      cuisine_type,
      category
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = [];
    let params: any[] = [];

    // Build WHERE clause
    if (search) {
      whereConditions.push('(r.title LIKE ? OR r.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (is_approved !== undefined) {
      whereConditions.push('r.is_approved = ?');
      params.push(is_approved === 'true');
    }

    if (is_featured !== undefined) {
      whereConditions.push('r.is_featured = ?');
      params.push(is_featured === 'true');
    }

    if (difficulty) {
      whereConditions.push('r.difficulty = ?');
      params.push(difficulty);
    }

    if (cuisine_type) {
      whereConditions.push('r.cuisine_type = ?');
      params.push(cuisine_type);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM recipes r ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get recipes with creator information
    const [recipes] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        r.*,
        u.first_name as creator_name,
        u.email as creator_email,
        COALESCE(rr.avg_rating, 0.00) as avg_rating,
        COALESCE(rr.review_count, 0) as review_count
       FROM recipes r
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN (
         SELECT recipe_id, AVG(rating) as avg_rating, COUNT(*) as review_count
         FROM recipe_reviews
         GROUP BY recipe_id
       ) rr ON r.id = rr.recipe_id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    // Get ingredients for each recipe
    const recipesWithIngredients = await Promise.all(
      recipes.map(async (recipe) => {
        const [ingredients] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM recipe_ingredients WHERE recipe_id = ?',
          [recipe.id]
        );
        return {
          ...recipe,
          ingredients: ingredients.map(ing => ({
            name: ing.ingredient_name,
            amount: ing.amount,
            unit: ing.unit
          }))
        };
      })
    );

    return res.json({
      success: true,
      data: recipesWithIngredients,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recipes' });
  }
};

// Get recipe by ID
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [recipes] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        r.*,
        u.first_name as creator_name,
        u.email as creator_email,
        COALESCE(rr.avg_rating, 0.00) as avg_rating,
        COALESCE(rr.review_count, 0) as review_count
       FROM recipes r
       LEFT JOIN users u ON r.created_by = u.id
       LEFT JOIN (
         SELECT recipe_id, AVG(rating) as avg_rating, COUNT(*) as review_count
         FROM recipe_reviews
         GROUP BY recipe_id
       ) rr ON r.id = rr.recipe_id
       WHERE r.id = ?`,
      [id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const recipe = recipes[0];

    // Get ingredients
    const [ingredients] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = ?',
      [id]
    );

    // Get reviews
    const [reviews] = await pool.execute<RowDataPacket[]>(
      `SELECT rr.*, u.first_name, u.last_name
       FROM recipe_reviews rr
       LEFT JOIN users u ON rr.user_id = u.id
       WHERE rr.recipe_id = ?
       ORDER BY rr.created_at DESC`,
      [id]
    );

    // Increment view count
    await pool.execute(
      'UPDATE recipes SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    return res.json({
      success: true,
      data: {
      ...recipe,
      ingredients: ingredients.map(ing => ({
          name: ing.ingredient_name,
          amount: ing.amount,
          unit: ing.unit
        })),
        reviews
      }
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recipe' });
  }
};

// Create new recipe
export const createRecipe = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      instructions,
      prep_time,
      cook_time,
      servings,
      difficulty,
      cuisine_type,
      dietary_tags,
      image_url,
      calories_per_serving,
      protein_per_serving,
      carbs_per_serving,
      fat_per_serving,
      fiber_per_serving,
      sugar_per_serving,
      sodium_per_serving,
      ingredients,
      tips,
      nutrition_notes
    } = req.body;

    const userId = (req as any).user.id;

    // Insert recipe
    const [result] = await pool.execute(
        `INSERT INTO recipes (
          title, description, instructions, prep_time, cook_time, servings,
        difficulty, cuisine_type, dietary_tags, image_url, calories_per_serving,
        protein_per_serving, carbs_per_serving, fat_per_serving, fiber_per_serving,
        sugar_per_serving, sodium_per_serving, tips, nutrition_notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
        title || null, 
        description || null, 
        instructions || null, 
        prep_time || null, 
        cook_time || null, 
        servings || null,
        difficulty || null, 
        cuisine_type || null, 
        dietary_tags ? JSON.stringify(dietary_tags) : null, 
        image_url || null,
        calories_per_serving || null, 
        protein_per_serving || null, 
        carbs_per_serving || null, 
        fat_per_serving || null,
        fiber_per_serving || null, 
        sugar_per_serving || null, 
        sodium_per_serving || null, 
        tips || null,
        nutrition_notes || null, 
        userId
      ]
    );

    const recipeId = (result as any).insertId;

    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientValues = ingredients.map((ing: any) => [
        recipeId,
        ing.name || null,
        ing.amount || null,
        ing.unit || null
      ]);

      await pool.execute(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, amount, unit) VALUES ?',
        [ingredientValues]
      );
    }

    return res.status(201).json({
        success: true,
        message: 'Recipe created successfully',
      data: { id: recipeId }
      });
    } catch (error) {
    console.error('Error creating recipe:', error);
    return res.status(500).json({ success: false, message: 'Failed to create recipe' });
  }
};

// Update recipe
export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      instructions,
      prep_time,
      cook_time,
      servings,
      difficulty,
      cuisine_type,
      dietary_tags,
      image_url,
      calories_per_serving,
      protein_per_serving,
      carbs_per_serving,
      fat_per_serving,
      fiber_per_serving,
      sugar_per_serving,
      sodium_per_serving,
      ingredients,
      tips,
      nutrition_notes,
      is_approved,
      is_featured
    } = req.body;

    // Check if recipe exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Update recipe
    await pool.execute(
      `UPDATE recipes SET
        title = ?, description = ?, instructions = ?, prep_time = ?, cook_time = ?,
        servings = ?, difficulty = ?, cuisine_type = ?, dietary_tags = ?, image_url = ?,
        calories_per_serving = ?, protein_per_serving = ?, carbs_per_serving = ?,
        fat_per_serving = ?, fiber_per_serving = ?, sugar_per_serving = ?,
        sodium_per_serving = ?, tips = ?, nutrition_notes = ?,
        is_approved = ?, is_featured = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title || null, 
        description || null, 
        instructions || null, 
        prep_time || null, 
        cook_time || null, 
        servings || null,
        difficulty || null, 
        cuisine_type || null, 
        dietary_tags ? JSON.stringify(dietary_tags) : null, 
        image_url || null,
        calories_per_serving || null, 
        protein_per_serving || null, 
        carbs_per_serving || null, 
        fat_per_serving || null,
        fiber_per_serving || null, 
        sugar_per_serving || null, 
        sodium_per_serving || null, 
        tips || null,
        nutrition_notes || null, 
        is_approved || false, 
        is_featured || false, 
        id
      ]
    );

    // Update ingredients
    if (ingredients) {
      // Delete existing ingredients
      await pool.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id]);

      // Insert new ingredients
      if (ingredients.length > 0) {
        const ingredientValues = ingredients.map((ing: any) => [
          id,
          ing.name || null,
          ing.amount || null,
          ing.unit || null
        ]);

      await pool.execute(
          'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, amount, unit) VALUES ?',
          [ingredientValues]
      );
      }
    }

    return res.json({
      success: true,
      message: 'Recipe updated successfully'
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return res.status(500).json({ success: false, message: 'Failed to update recipe' });
  }
};

// Delete recipe
export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if recipe exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Delete related data
    await pool.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id]);
    await pool.execute('DELETE FROM recipe_reviews WHERE recipe_id = ?', [id]);
    await pool.execute('DELETE FROM recipes WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete recipe' });
  }
};

// Approve/Reject recipe
export const approveRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_approved, is_featured } = req.body;

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    await pool.execute(
      'UPDATE recipes SET is_approved = ?, is_featured = ?, updated_at = NOW() WHERE id = ?',
      [is_approved, is_featured || false, id]
    );

    return res.json({
      success: true,
      message: `Recipe ${is_approved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating recipe status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update recipe status' });
  }
};

// Get recipe suggestions for user
export const getRecipeSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 10 } = req.query;

    // Get user preferences
    const [userProfile] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (userProfile.length === 0) {
      // Return popular recipes if no profile
      const [popularRecipes] = await pool.execute<RowDataPacket[]>(
        `SELECT r.*, COALESCE(rr.avg_rating, 0.00) as avg_rating
       FROM recipes r
         LEFT JOIN (
           SELECT recipe_id, AVG(rating) as avg_rating
           FROM recipe_reviews
           GROUP BY recipe_id
         ) rr ON r.id = rr.recipe_id
         WHERE r.is_approved = TRUE
         ORDER BY r.view_count DESC, r.avg_rating DESC
       LIMIT ?`,
      [limit]
    );

      return res.json({
      success: true,
        data: popularRecipes,
        message: 'Popular recipes'
      });
    }

    const profile = userProfile[0];
    const dietaryPreferences = profile.dietary_preferences ? JSON.parse(profile.dietary_preferences) : [];
    const allergies = profile.allergies ? JSON.parse(profile.allergies) : [];

    // Build query based on user preferences
    let whereConditions = ['r.is_approved = TRUE'];
    let params: any[] = [];

    // Filter by dietary preferences
    if (dietaryPreferences.length > 0) {
      const dietaryConditions = dietaryPreferences.map((pref: string) => 
        `JSON_CONTAINS(r.dietary_tags, ?)`
      );
      whereConditions.push(`(${dietaryConditions.join(' OR ')})`);
      params.push(...dietaryPreferences.map((pref: string) => JSON.stringify(pref)));
    }

    // Filter out allergies
    if (allergies.length > 0) {
      const allergyConditions = allergies.map((allergy: string) => 
        `NOT JSON_CONTAINS(r.dietary_tags, ?)`
      );
      whereConditions.push(`(${allergyConditions.join(' AND ')})`);
      params.push(...allergies.map((allergy: string) => JSON.stringify(allergy)));
    }

    const whereClause = whereConditions.join(' AND ');

    // Get personalized suggestions
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT r.*, COALESCE(rr.avg_rating, 0.00) as avg_rating
       FROM recipes r
       LEFT JOIN (
         SELECT recipe_id, AVG(rating) as avg_rating
         FROM recipe_reviews
         GROUP BY recipe_id
       ) rr ON r.id = rr.recipe_id
       WHERE ${whereClause}
       ORDER BY r.avg_rating DESC, r.view_count DESC
       LIMIT ?`,
      [...params, limit]
    );

    return res.json({
      success: true,
      data: suggestions,
      message: 'Personalized recipe suggestions'
    });
  } catch (error) {
    console.error('Error getting recipe suggestions:', error);
    return res.status(500).json({ success: false, message: 'Failed to get recipe suggestions' });
  }
};

// Add recipe review
export const addRecipeReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user.id;

    // Check if recipe exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if user already reviewed
    const [existingReview] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipe_reviews WHERE recipe_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this recipe' });
    }

    // Add review
    await pool.execute(
      'INSERT INTO recipe_reviews (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [id, userId, rating, comment]
    );

    // Update recipe average rating
    await pool.execute(
      `UPDATE recipes r 
       SET avg_rating = (
         SELECT COALESCE(AVG(rating), 0.00)
         FROM recipe_reviews rr 
         WHERE rr.recipe_id = r.id
       )
       WHERE r.id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ success: false, message: 'Failed to add review' });
  }
};

// Like/Unlike recipe
export const toggleRecipeLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Check if recipe exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if user already liked
    const [existingLike] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipe_likes WHERE recipe_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingLike.length > 0) {
      // Unlike
      await pool.execute(
        'DELETE FROM recipe_likes WHERE recipe_id = ? AND user_id = ?',
        [id, userId]
      );
      await pool.execute(
        'UPDATE recipes SET like_count = like_count - 1 WHERE id = ?',
        [id]
      );
      return res.json({
      success: true,
        message: 'Recipe unliked',
        liked: false
      });
    } else {
      // Like
      await pool.execute(
        'INSERT INTO recipe_likes (recipe_id, user_id) VALUES (?, ?)',
        [id, userId]
      );
      await pool.execute(
        'UPDATE recipes SET like_count = like_count + 1 WHERE id = ?',
        [id]
      );
      return res.json({
        success: true,
        message: 'Recipe liked',
        liked: true
      });
    }
  } catch (error) {
    console.error('Error toggling recipe like:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle recipe like' });
  }
};

/**
 * Generate a recipe using AI
 */
export const generateRecipe = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const requestData: AIGenerateRecipeRequest = req.body;

    // Generate recipe using AI
    const generatedRecipe = await geminiService.generateRecipe(requestData);

    // Save the generated recipe to database
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert recipe
      const [recipeResult] = await connection.execute(
        `INSERT INTO recipes (
          title, description, instructions, prep_time, cook_time, servings,
          calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving,
          fiber_per_serving, sugar_per_serving, sodium_per_serving,
          cuisine_type, difficulty, dietary_tags, created_by, is_ai_generated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedRecipe.title,
          generatedRecipe.description,
          Array.isArray(generatedRecipe.instructions) 
            ? generatedRecipe.instructions.join('\n\n') 
            : generatedRecipe.instructions,
          generatedRecipe.prep_time || 0,
          generatedRecipe.cook_time || 0,
          generatedRecipe.servings || 4,
          generatedRecipe.calories_per_serving || 0,
          generatedRecipe.protein_per_serving || 0,
          generatedRecipe.carbs_per_serving || 0,
          generatedRecipe.fat_per_serving || 0,
          generatedRecipe.fiber_per_serving || 0,
          generatedRecipe.sugar_per_serving || 0,
          generatedRecipe.sodium_per_serving || 0,
          generatedRecipe.cuisine_type || 'general',
          generatedRecipe.difficulty || 'medium',
          JSON.stringify(generatedRecipe.dietary_tags || []),
          userId,
          true
        ]
      );

      const recipeId = (recipeResult as any).insertId;

      // Insert ingredients
      if (generatedRecipe.ingredients && generatedRecipe.ingredients.length > 0) {
        for (const ingredient of generatedRecipe.ingredients) {
          // First, try to find existing ingredient or create a new one
          let ingredientId;
          
          // Check if ingredient exists
          const [existingIngredients] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM ingredients WHERE name = ?',
            [ingredient.name]
          );
          
          if (existingIngredients.length > 0) {
            ingredientId = existingIngredients[0].id;
          } else {
            // Create new ingredient
            const [ingredientResult] = await connection.execute(
              'INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES (?, ?, ?, ?, ?)',
              [ingredient.name, 0, 0, 0, 0] // Default values
            );
            ingredientId = (ingredientResult as any).insertId;
          }
          
          // Insert recipe ingredient with proper foreign key
          await connection.execute(
            'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, ingredient_name, quantity, unit) VALUES (?, ?, ?, ?, ?)',
            [recipeId, ingredientId, ingredient.name, ingredient.amount, ingredient.unit]
          );
        }
      }

      await connection.commit();

      // Get the created recipe with ingredients
      const [recipes] = await pool.execute<RowDataPacket[]>(
        `SELECT r.*, u.first_name as creator_name, u.email as creator_email
         FROM recipes r
         LEFT JOIN users u ON r.created_by = u.id
         WHERE r.id = ?`,
        [recipeId]
      );

      const [ingredients] = await pool.execute<RowDataPacket[]>(
        `SELECT ri.*, i.name as ingredient_name 
         FROM recipe_ingredients ri 
         LEFT JOIN ingredients i ON ri.ingredient_id = i.id 
         WHERE ri.recipe_id = ?`,
        [recipeId]
      );

      const recipe = {
        ...recipes[0],
        ingredients: ingredients.map(ing => ({
          name: ing.ingredient_name,
          amount: ing.quantity,
          unit: ing.unit
        })),
        dietary_tags: JSON.parse(recipes[0].dietary_tags || '[]'),
        tips: generatedRecipe.tips || null
      };

      res.json({
        success: true,
        message: 'Recipe generated successfully',
        data: recipe
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ success: false, message: 'Failed to generate recipe' });
  }
};
