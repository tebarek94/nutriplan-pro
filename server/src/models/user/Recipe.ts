import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { Recipe, RecipeIngredient, RecipeReview, CreateRecipeRequest, SearchFilters, PaginationParams } from '../../types';

export class RecipeModel {
  /**
   * Create a new recipe
   */
  static async create(recipeData: CreateRecipeRequest, userId: number): Promise<number> {
    const [result] = await pool.execute(
      `INSERT INTO recipes (
        title, description, instructions, prep_time, cook_time, servings, 
        difficulty, cuisine_type, dietary_tags, image_url, video_url,
        calories_per_serving, protein_per_serving, carbs_per_serving, 
        fat_per_serving, fiber_per_serving, sugar_per_serving, sodium_per_serving,
        created_by, is_approved, is_featured, view_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipeData.title, recipeData.description, recipeData.instructions,
        recipeData.prep_time, recipeData.cook_time, recipeData.servings,
        recipeData.difficulty, recipeData.cuisine_type, JSON.stringify(recipeData.dietary_tags),
        recipeData.image_url, recipeData.video_url, recipeData.calories_per_serving,
        recipeData.protein_per_serving, recipeData.carbs_per_serving,
        recipeData.fat_per_serving, recipeData.fiber_per_serving,
        recipeData.sugar_per_serving, recipeData.sodium_per_serving,
        userId, false, false, 0
      ]
    );
    return (result as any).insertId;
  }

  /**
   * Add ingredients to recipe
   */
  static async addIngredients(recipeId: number, ingredients: CreateRecipeRequest['ingredients']): Promise<void> {
    for (const ingredient of ingredients) {
      await pool.execute(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, notes) VALUES (?, ?, ?, ?, ?)',
        [recipeId, ingredient.ingredient_id, ingredient.quantity, ingredient.unit, ingredient.notes]
      );
    }
  }

  /**
   * Get all recipes with pagination and filters
   */
  static async findAll(filters: SearchFilters = {}, pagination: PaginationParams = {}): Promise<{ recipes: Recipe[], total: number }> {
    const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters.query) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${filters.query}%`, `%${filters.query}%`);
    }

    if (filters.category_id) {
      whereClause += ' AND category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.dietary_tags && filters.dietary_tags.length > 0) {
      whereClause += ' AND JSON_OVERLAPS(dietary_tags, ?)';
      params.push(JSON.stringify(filters.dietary_tags));
    }

    if (filters.difficulty) {
      whereClause += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }

    if (filters.cuisine_type) {
      whereClause += ' AND cuisine_type = ?';
      params.push(filters.cuisine_type);
    }

    if (filters.min_calories !== undefined) {
      whereClause += ' AND calories_per_serving >= ?';
      params.push(filters.min_calories);
    }

    if (filters.max_calories !== undefined) {
      whereClause += ' AND calories_per_serving <= ?';
      params.push(filters.max_calories);
    }

    if (filters.is_approved !== undefined) {
      whereClause += ' AND is_approved = ?';
      params.push(filters.is_approved);
    }

    if (filters.is_featured !== undefined) {
      whereClause += ' AND is_featured = ?';
      params.push(filters.is_featured);
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM recipes ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get recipes
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM recipes ${whereClause} ORDER BY ${sort_by} ${sort_order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      recipes: rows.map(row => ({
        ...row,
        dietary_tags: row.dietary_tags ? JSON.parse(row.dietary_tags) : []
      })) as Recipe[],
      total
    };
  }

  /**
   * Get recipe by ID
   */
  static async findById(id: number): Promise<Recipe | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;

    const recipe = rows[0] as any;
    recipe.dietary_tags = recipe.dietary_tags ? JSON.parse(recipe.dietary_tags) : [];
    return recipe as Recipe;
    
    return recipe;
  }

  /**
   * Get featured recipes
   */
  static async getFeatured(): Promise<Recipe[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipes WHERE is_featured = TRUE AND is_approved = TRUE ORDER BY created_at DESC LIMIT 10'
    );

    return rows.map(row => ({
      ...row,
      dietary_tags: row.dietary_tags ? JSON.parse(row.dietary_tags) : []
    })) as Recipe[];
  }

  /**
   * Update recipe
   */
  static async update(id: number, recipeData: Partial<Recipe>): Promise<void> {
    const fields = Object.keys(recipeData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(recipeData);
    
    await pool.execute(
      `UPDATE recipes SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
  }

  /**
   * Delete recipe
   */
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id]);
    await pool.execute('DELETE FROM recipe_reviews WHERE recipe_id = ?', [id]);
    await pool.execute('DELETE FROM recipes WHERE id = ?', [id]);
  }

  /**
   * Add review to recipe
   */
  static async addReview(reviewData: Omit<RecipeReview, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await pool.execute(
      'INSERT INTO recipe_reviews (recipe_id, user_id, rating, review) VALUES (?, ?, ?, ?)',
      [reviewData.recipe_id, reviewData.user_id, reviewData.rating, reviewData.review]
    );
  }

  /**
   * Get recipe reviews
   */
  static async getReviews(recipeId: number): Promise<RecipeReview[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipe_reviews WHERE recipe_id = ? ORDER BY created_at DESC',
      [recipeId]
    );
    return rows as RecipeReview[];
  }

  /**
   * Get recipe ingredients
   */
  static async getIngredients(recipeId: number): Promise<RecipeIngredient[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = ?',
      [recipeId]
    );
    return rows as RecipeIngredient[];
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(id: number): Promise<void> {
    await pool.execute(
      'UPDATE recipes SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );
  }
}
