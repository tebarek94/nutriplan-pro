import { GoogleGenerativeAI } from '@google/generative-ai';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { AIGenerateMealPlanRequest, AIGenerateRecipeRequest, AIGenerateWeeklyMealPlanRequest, CreateUserProfileRequest, Recipe, NutritionSummary } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI | null;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, using fallback meal plan generation');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  /**
   * Generate a personalized meal plan using AI
   */
  async generateMealPlan(request: AIGenerateMealPlanRequest): Promise<any> {
    const startTime = Date.now();
    
    try {
      // If no AI model available, use fallback
      if (!this.model) {
        console.log('Using fallback meal plan generation');
        return this.createFallbackMealPlan(request);
      }
      
      // Get available recipes from database
      const recipes = await this.getAvailableRecipes();
      
      // Create comprehensive prompt
      const prompt = this.createMealPlanPrompt(request, recipes);
      
      // Generate response from Gemini
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse AI response
      const parsedMealPlan = this.parseMealPlanResponse(text, request);
      
      // Log the interaction
      await this.logAIAnalysis({
        user_id: null, // Will be set by controller
        analysis_type: 'meal_plan',
        prompt,
        response: text,
        tokens_used: response.usageMetadata?.totalTokenCount,
        processing_time_ms: Date.now() - startTime
      });
      
      return parsedMealPlan;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      console.log('Falling back to default meal plan generation');
      return this.createFallbackMealPlan(request);
    }
  }

  /**
   * Generate recipe suggestions based on user preferences
   */
  async generateRecipeSuggestions(userProfile: CreateUserProfileRequest, preferences: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      const recipes = await this.getAvailableRecipes();
      
      const prompt = this.createRecipeSuggestionPrompt(userProfile, preferences, recipes);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const suggestions = this.parseRecipeSuggestions(text);
      
      await this.logAIAnalysis({
        user_id: null,
        analysis_type: 'recipe_suggestion',
        prompt,
        response: text,
        tokens_used: response.usageMetadata?.totalTokenCount,
        processing_time_ms: Date.now() - startTime
      });
      
      return suggestions;
    } catch (error) {
      console.error('Error generating recipe suggestions:', error);
      throw new Error('Failed to generate recipe suggestions');
    }
  }

  /**
   * Analyze nutrition information
   */
  async analyzeNutrition(ingredients: any[], quantities: number[]): Promise<NutritionSummary> {
    const startTime = Date.now();
    
    try {
      const prompt = this.createNutritionAnalysisPrompt(ingredients, quantities);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const nutrition = this.parseNutritionResponse(text);
      
      await this.logAIAnalysis({
        user_id: null,
        analysis_type: 'nutrition_analysis',
        prompt,
        response: text,
        tokens_used: response.usageMetadata?.totalTokenCount,
        processing_time_ms: Date.now() - startTime
      });
      
      return nutrition;
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      throw new Error('Failed to analyze nutrition');
    }
  }

  /**
   * Create comprehensive meal plan prompt
   */
  private createMealPlanPrompt(request: AIGenerateMealPlanRequest, recipes: Recipe[]): string {
    const { user_profile, start_date, end_date, preferences } = request;
    
    const recipeList = recipes.map(recipe => 
      `- ${recipe.title} (${recipe.calories_per_serving} cal, ${recipe.protein_per_serving}g protein, ${recipe.carbs_per_serving}g carbs, ${recipe.fat_per_serving}g fat) - ${recipe.dietary_tags?.join(', ') || 'No dietary tags'}`
    ).join('\n');

    return `You are a professional nutritionist and meal planning expert. Create a personalized meal plan for the following user:

USER PROFILE:
- Age: ${user_profile.age || 'Not specified'}
- Gender: ${user_profile.gender || 'Not specified'}
- Weight: ${user_profile.weight || 'Not specified'} kg
- Height: ${user_profile.height || 'Not specified'} cm
- Activity Level: ${user_profile.activity_level || 'Not specified'}
- Fitness Goal: ${user_profile.fitness_goal || 'Not specified'}
- Dietary Preferences: ${user_profile.dietary_preferences?.join(', ') || 'None'}
- Allergies: ${user_profile.allergies?.join(', ') || 'None'}
- Medical Conditions: ${user_profile.medical_conditions || 'None'}

MEAL PLAN PERIOD:
- Start Date: ${start_date}
- End Date: ${end_date}

PREFERENCES:
- Cuisine Preferences: ${preferences?.cuisine_preferences?.join(', ') || 'Any'}
- Meal Preferences: ${preferences?.meal_preferences?.join(', ') || 'Any'}
- Budget Constraints: ${preferences?.budget_constraints || 'None'}
- Cooking Skill Level: ${preferences?.cooking_skill_level || 'Any'}

AVAILABLE RECIPES:
${recipeList}

INSTRUCTIONS:
1. Create a balanced meal plan that meets the user's nutritional needs and preferences
2. Ensure variety in meals throughout the week
3. Consider the user's fitness goals and activity level
4. Respect dietary restrictions and allergies
5. Include 3 main meals (breakfast, lunch, dinner) and 1-2 snacks per day
6. Calculate total daily calories and macronutrients
7. For each meal, either:
   - Use a recipe_id from the available recipes list (preferred)
   - OR create a custom_meal_name with custom_ingredients and custom_nutrition
8. IMPORTANT: Every meal must have either a recipe_id OR a custom_meal_name - never leave both empty
9. Generate realistic, varied meals for each day

RESPONSE FORMAT (JSON):
{
  "meal_plan": {
    "name": "Personalized Meal Plan",
    "description": "AI-generated meal plan based on user preferences",
    "start_date": "${start_date}",
    "end_date": "${end_date}",
    "total_calories": number,
    "total_protein": number,
    "total_carbs": number,
    "total_fat": number,
    "meals": [
      {
        "day_of_week": "monday|tuesday|wednesday|thursday|friday|saturday|sunday",
        "meal_type": "breakfast|lunch|dinner|snack",
        "recipe_id": number (from available recipes) or null,
        "custom_meal_name": "string (if no recipe_id)",
        "custom_ingredients": [
          {
            "name": "string",
            "quantity": number,
            "unit": "string"
          }
        ],
        "custom_nutrition": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      }
    ]
  }
}

IMPORTANT: Return only valid JSON. Do not include any additional text or explanations.`;
  }

  /**
   * Create recipe suggestion prompt
   */
  private createRecipeSuggestionPrompt(userProfile: CreateUserProfileRequest, preferences: any, recipes: Recipe[]): string {
    const recipeList = recipes.map(recipe => 
      `- ${recipe.title} (${recipe.calories_per_serving} cal, ${recipe.protein_per_serving}g protein, ${recipe.carbs_per_serving}g carbs, ${recipe.fat_per_serving}g fat) - ${recipe.dietary_tags?.join(', ') || 'No dietary tags'}`
    ).join('\n');

    return `You are a culinary expert. Suggest recipes for the following user:

USER PROFILE:
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Weight: ${userProfile.weight || 'Not specified'} kg
- Height: ${userProfile.height || 'Not specified'} cm
- Activity Level: ${userProfile.activity_level || 'Not specified'}
- Fitness Goal: ${userProfile.fitness_goal || 'Not specified'}
- Dietary Preferences: ${userProfile.dietary_preferences?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}

PREFERENCES:
- Cuisine Type: ${preferences?.cuisine_type || 'Any'}
- Meal Type: ${preferences?.meal_type || 'Any'}
- Difficulty Level: ${preferences?.difficulty || 'Any'}
- Time Constraint: ${preferences?.time_constraint || 'None'}

AVAILABLE RECIPES:
${recipeList}

INSTRUCTIONS:
1. Suggest 5-10 recipes that best match the user's profile and preferences
2. Consider nutritional balance and fitness goals
3. Respect dietary restrictions and allergies
4. Provide reasoning for each suggestion

RESPONSE FORMAT (JSON):
{
  "suggestions": [
    {
      "recipe_id": number,
      "reason": "string explaining why this recipe is suitable",
      "nutritional_benefits": "string describing nutritional benefits",
      "suitability_score": number (1-10)
    }
  ]
}

IMPORTANT: Return only valid JSON. Do not include any additional text or explanations.`;
  }

  /**
   * Create nutrition analysis prompt
   */
  private createNutritionAnalysisPrompt(ingredients: any[], quantities: number[]): string {
    const ingredientList = ingredients.map((ingredient, index) => 
      `${ingredient.name}: ${quantities[index]} ${ingredient.unit}`
    ).join('\n');

    return `You are a nutritionist. Analyze the nutritional content of the following ingredients:

INGREDIENTS:
${ingredientList}

INSTRUCTIONS:
1. Calculate total calories, protein, carbs, fat, fiber, sugar, and sodium
2. Consider the quantities provided
3. Provide accurate nutritional analysis

RESPONSE FORMAT (JSON):
{
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number,
    "sodium": number
  }
}

IMPORTANT: Return only valid JSON. Do not include any additional text or explanations.`;
  }

  /**
   * Get available recipes from database
   */
  private async getAvailableRecipes(): Promise<Recipe[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM recipes WHERE is_approved = TRUE ORDER BY is_featured DESC, view_count DESC LIMIT 100'
      );
      
      return rows.map(row => ({
        ...row,
        dietary_tags: row.dietary_tags ? JSON.parse(row.dietary_tags) : [],
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      })) as Recipe[];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  }

  /**
   * Parse meal plan response from AI
   */
  private parseMealPlanResponse(response: string, request: AIGenerateMealPlanRequest): any {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!parsed.meal_plan || !parsed.meal_plan.meals) {
        throw new Error('Invalid meal plan structure');
      }
      
      // Ensure each meal has either recipe_id or custom_meal_name
      const mealPlan = parsed.meal_plan;
      mealPlan.meals = mealPlan.meals.map((meal: any) => {
        if (!meal.recipe_id && !meal.custom_meal_name) {
          // Fallback: create a custom meal name based on meal type
          const mealNames = {
            breakfast: ['Oatmeal with Berries', 'Scrambled Eggs with Toast', 'Greek Yogurt Parfait', 'Smoothie Bowl'],
            lunch: ['Grilled Chicken Salad', 'Quinoa Bowl', 'Turkey Sandwich', 'Vegetable Soup'],
            dinner: ['Salmon with Vegetables', 'Pasta Primavera', 'Stir-Fried Tofu', 'Grilled Steak'],
            snack: ['Apple with Almonds', 'Carrot Sticks with Hummus', 'Greek Yogurt', 'Trail Mix']
          };
          
          const names = mealNames[meal.meal_type as keyof typeof mealNames] || ['Healthy Meal'];
          const randomName = names[Math.floor(Math.random() * names.length)];
          
          return {
            ...meal,
            custom_meal_name: randomName,
            custom_ingredients: [
              { name: 'Ingredients', quantity: 1, unit: 'serving' }
            ],
            custom_nutrition: {
              calories: 300,
              protein: 15,
              carbs: 30,
              fat: 10
            }
          };
        }
        return meal;
      });
      
      return mealPlan;
    } catch (error) {
      console.error('Error parsing meal plan response:', error);
      // Return a fallback meal plan if parsing fails
      return this.createFallbackMealPlan(request);
    }
  }

  /**
   * Create a fallback meal plan when AI generation fails
   */
  private createFallbackMealPlan(request: AIGenerateMealPlanRequest): any {
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const meals = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Use existing recipes from database (IDs 1-5)
    const recipeIds = [1, 2, 3, 4, 5];
    let recipeIndex = 0;
    
    for (let dayIndex = 0; dayIndex < Math.min(daysDiff, 7); dayIndex++) {
      const dayOfWeek = days[dayIndex];
      
      for (const mealType of mealTypes) {
        if (mealType === 'snack') {
          // Create custom snack
          const snackNames = [
            'Greek Yogurt with Berries',
            'Almonds and Apple',
            'Hummus with Carrots',
            'Mixed Nuts',
            'Apple with Peanut Butter',
            'Greek Yogurt with Honey',
            'Carrot Sticks with Hummus'
          ];
          
          meals.push({
            meal_type: mealType,
            day_of_week: dayOfWeek,
            custom_meal_name: snackNames[dayIndex % snackNames.length],
            custom_ingredients: [
              { name: 'Healthy Snack', quantity: 1, unit: 'serving' }
            ],
            custom_nutrition: {
              calories: 180,
              protein: 8,
              carbs: 20,
              fat: 8
            }
          });
        } else {
          // Use existing recipe
          const recipeId = recipeIds[recipeIndex % recipeIds.length];
          meals.push({
            meal_type: mealType,
            day_of_week: dayOfWeek,
            recipe_id: recipeId
          });
          recipeIndex++;
        }
      }
    }
    
    return {
      name: 'AI Generated Meal Plan',
      description: 'A personalized meal plan generated using AI',
      start_date: request.start_date,
      end_date: request.end_date,
      total_calories: 1680,
      total_protein: 120,
      total_carbs: 180,
      total_fat: 65,
      meals: meals
    };
  }

  /**
   * Parse recipe suggestions response
   */
  private parseRecipeSuggestions(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.suggestions) {
        throw new Error('Invalid suggestions structure');
      }
      
      return parsed.suggestions;
    } catch (error) {
      console.error('Error parsing recipe suggestions:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Parse nutrition response
   */
  private parseNutritionResponse(response: string): NutritionSummary {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.nutrition) {
        throw new Error('Invalid nutrition structure');
      }
      
      return parsed.nutrition;
    } catch (error) {
      console.error('Error parsing nutrition response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Generate a complete recipe using AI
   */
  async generateRecipe(request: AIGenerateRecipeRequest): Promise<any> {
    const startTime = Date.now();
    
    try {
      const prompt = this.createRecipeGenerationPrompt(request);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsedRecipe = this.parseRecipeResponse(text, request);
      
      await this.logAIAnalysis({
        user_id: null,
        analysis_type: 'recipe_generation',
        prompt,
        response: text,
        tokens_used: response.usageMetadata?.totalTokenCount,
        processing_time_ms: Date.now() - startTime
      });
      
      return parsedRecipe;
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw new Error('Failed to generate recipe');
    }
  }

  /**
   * Generate a weekly meal plan using AI
   */
  async generateWeeklyMealPlan(request: AIGenerateWeeklyMealPlanRequest): Promise<any> {
    const startTime = Date.now();
    
    try {
      const recipes = await this.getAvailableRecipes();
      const prompt = this.createWeeklyMealPlanPrompt(request, recipes);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsedWeeklyPlan = this.parseWeeklyMealPlanResponse(text, request);
      
      await this.logAIAnalysis({
        user_id: null,
        analysis_type: 'weekly_meal_plan',
        prompt,
        response: text,
        tokens_used: response.usageMetadata?.totalTokenCount,
        processing_time_ms: Date.now() - startTime
      });
      
      return parsedWeeklyPlan;
    } catch (error) {
      console.error('Error generating weekly meal plan:', error);
      throw new Error('Failed to generate weekly meal plan');
    }
  }

  /**
   * Create prompt for recipe generation
   */
  private createRecipeGenerationPrompt(request: AIGenerateRecipeRequest): string {
    const {
      title,
      cuisine_type,
      difficulty,
      dietary_preferences,
      ingredients_available,
      cooking_time,
      servings,
      description,
      user_profile
    } = request;

    let prompt = `Generate a complete recipe with the following requirements:\n\n`;

    if (title) {
      prompt += `Title: ${title}\n`;
    } else {
      prompt += `Title: Create an original recipe name\n`;
    }

    if (cuisine_type) {
      prompt += `Cuisine Type: ${cuisine_type}\n`;
    }

    if (difficulty) {
      prompt += `Difficulty Level: ${difficulty}\n`;
    }

    if (dietary_preferences && dietary_preferences.length > 0) {
      prompt += `Dietary Preferences: ${dietary_preferences.join(', ')}\n`;
    }

    if (ingredients_available && ingredients_available.length > 0) {
      prompt += `Available Ingredients: ${ingredients_available.join(', ')}\n`;
    }

    if (cooking_time) {
      prompt += `Cooking Time: ${cooking_time} minutes\n`;
    }

    if (servings) {
      prompt += `Servings: ${servings} people\n`;
    }

    if (description) {
      prompt += `Description: ${description}\n`;
    }

    if (user_profile) {
      prompt += `\nUser Profile:\n`;
      if (user_profile.dietary_preferences) {
        prompt += `- Dietary Preferences: ${user_profile.dietary_preferences.join(', ')}\n`;
      }
      if (user_profile.allergies) {
        prompt += `- Allergies: ${user_profile.allergies.join(', ')}\n`;
      }
      if (user_profile.medical_conditions) {
        prompt += `- Medical Conditions: ${user_profile.medical_conditions}\n`;
      }
    }

    prompt += `\nPlease provide a complete recipe in the following JSON format:
{
  "title": "Recipe Title",
  "description": "Brief description of the recipe",
  "cuisine_type": "cuisine type",
  "difficulty": "easy/medium/hard",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "calories_per_serving": 350,
  "protein_per_serving": 25,
  "carbs_per_serving": 45,
  "fat_per_serving": 12,
  "fiber_per_serving": 8,
  "sugar_per_serving": 5,
  "sodium_per_serving": 400,
  "dietary_tags": ["vegetarian", "gluten-free"],
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": 2,
      "unit": "cups"
    }
  ],
  "instructions": [
    "Step 1: Detailed cooking instruction",
    "Step 2: Next step",
    "Step 3: Continue with detailed steps"
  ],
  "tips": "Helpful cooking tips and variations"
}`;

    return prompt;
  }

  /**
   * Create prompt for weekly meal plan generation
   */
  private createWeeklyMealPlanPrompt(request: AIGenerateWeeklyMealPlanRequest, recipes: Recipe[]): string {
    const { user_profile, week_start_date, preferences } = request;

    let prompt = `Generate a comprehensive weekly meal plan starting from ${week_start_date}.\n\n`;

    prompt += `User Profile:\n`;
    if (user_profile.dietary_preferences) {
      prompt += `- Dietary Preferences: ${user_profile.dietary_preferences.join(', ')}\n`;
    }
    if (user_profile.allergies) {
      prompt += `- Allergies: ${user_profile.allergies.join(', ')}\n`;
    }
    if (user_profile.medical_conditions) {
      prompt += `- Medical Conditions: ${user_profile.medical_conditions}\n`;
    }

    if (preferences) {
      prompt += `\nPreferences:\n`;
      if (preferences.cuisine_preferences) {
        prompt += `- Cuisine Preferences: ${preferences.cuisine_preferences.join(', ')}\n`;
      }
      if (preferences.meal_preferences) {
        prompt += `- Meal Preferences: ${preferences.meal_preferences.join(', ')}\n`;
      }
      if (preferences.cooking_skill_level) {
        prompt += `- Cooking Skill Level: ${preferences.cooking_skill_level}\n`;
      }
      if (preferences.meals_per_day) {
        prompt += `- Meals per Day: ${preferences.meals_per_day}\n`;
      }
      if (preferences.calorie_target) {
        prompt += `- Daily Calorie Target: ${preferences.calorie_target}\n`;
      }
    }

    prompt += `\nAvailable Recipes:\n`;
    recipes.slice(0, 20).forEach(recipe => {
      prompt += `- ${recipe.title} (${recipe.cuisine_type}, ${recipe.difficulty})\n`;
    });

    prompt += `\nPlease provide a weekly meal plan in the following JSON format:
{
  "week_start_date": "${week_start_date}",
  "total_calories": 14000,
  "total_protein": 700,
  "total_carbs": 1400,
  "total_fat": 350,
  "meals": [
    {
      "day": "monday",
      "meals": [
        {
          "meal_type": "breakfast",
          "recipe_id": 1,
          "custom_meal_name": "Recipe Name",
          "calories": 400,
          "protein": 25,
          "carbs": 45,
          "fat": 15
        },
        {
          "meal_type": "lunch",
          "recipe_id": 2,
          "custom_meal_name": "Recipe Name",
          "calories": 600,
          "protein": 35,
          "carbs": 60,
          "fat": 20
        },
        {
          "meal_type": "dinner",
          "recipe_id": 3,
          "custom_meal_name": "Recipe Name",
          "calories": 500,
          "protein": 30,
          "carbs": 55,
          "fat": 18
        }
      ]
    }
  ]
}`;

    return prompt;
  }

  /**
   * Parse recipe response from AI
   */
  private parseRecipeResponse(response: string, request: AIGenerateRecipeRequest): any {
    try {
      // Try to extract JSON from the response
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to extract from markdown code blocks
        const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonMatch = [codeBlockMatch[1]];
        } else {
          throw new Error('No JSON found in response');
        }
      }
      
      let jsonStr = jsonMatch[0];
      
      // Pre-process the JSON string to fix common issues before parsing
      console.log('Pre-processing JSON string...');
      console.log('Original JSON string length:', jsonStr.length);
      
      // Fix fractions in JSON (e.g., 1/4 -> 0.25) - do this first
      const originalJsonStr = jsonStr;
      jsonStr = jsonStr.replace(/(\d+)\/(\d+)/g, (match, numerator, denominator) => {
        const result = (parseInt(numerator) / parseInt(denominator));
        console.log(`Fixed fraction: ${match} -> ${result}`);
        return result.toString();
      });
      
      if (originalJsonStr !== jsonStr) {
        console.log('Fractions were fixed in JSON string');
      }
      
      // Remove extra fields that aren't in our schema (like 'notes' in ingredients)
      const beforeNotes = jsonStr;
      jsonStr = jsonStr.replace(/,\s*"notes":\s*"[^"]*"/g, '');
      jsonStr = jsonStr.replace(/,\s*"preparation":\s*"[^"]*"/g, '');
      jsonStr = jsonStr.replace(/,\s*"prep":\s*"[^"]*"/g, '');
      
      if (beforeNotes !== jsonStr) {
        console.log('Removed extra fields (notes/preparation/prep) from JSON');
      }
      
      // Fix empty unit fields
      jsonStr = jsonStr.replace(/"unit":\s*""/g, '"unit": "piece"');
      
      // Remove trailing commas
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix any remaining malformed JSON issues
      jsonStr = jsonStr.replace(/,\s*}/g, '}');
      jsonStr = jsonStr.replace(/,\s*]/g, ']');
      
      // Fix any remaining trailing commas
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix any double commas
      jsonStr = jsonStr.replace(/,,/g, ',');
      
      // Fix any missing commas between array elements
      jsonStr = jsonStr.replace(/}\s*{/g, '},{');
      jsonStr = jsonStr.replace(/]\s*\[/g, '],[');
      
      // Log the cleaned JSON string for debugging
      console.log('Cleaned JSON string length:', jsonStr.length);
      console.log('First 500 chars of cleaned JSON:', jsonStr.substring(0, 500));
      
      // Try to fix common JSON issues
      try {
        console.log('Attempting first JSON parse...');
        const parsed = JSON.parse(jsonStr);
        
        if (!parsed.title || !parsed.instructions) {
          throw new Error('Invalid recipe structure');
        }
        
        console.log('JSON parsed successfully on first attempt');
        return parsed;
      } catch (parseError) {
        // If JSON parsing still fails, try additional fixes
        console.log('First parse failed, attempting to fix malformed JSON...');
        console.log('Parse error:', parseError instanceof Error ? parseError.message : String(parseError));
        
        // Try to identify and fix the specific issue
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        if (errorMessage.includes('Expected \',\' or \']\' after array element')) {
          console.log('Detected array element issue, applying specific fixes...');
          
          // Fix array element issues more aggressively
          jsonStr = jsonStr.replace(/,\s*}/g, '}');
          jsonStr = jsonStr.replace(/,\s*]/g, ']');
          jsonStr = jsonStr.replace(/,\s*\[/g, '[');
          jsonStr = jsonStr.replace(/,\s*{/g, '{');
          
          // Remove any remaining trailing commas
          jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
        }
        
        // Fix missing quotes around property names
        jsonStr = jsonStr.replace(/(\w+):/g, '"$1":');
        
        // Try parsing again
        console.log('Attempting second JSON parse...');
        const parsed = JSON.parse(jsonStr);
          
          if (!parsed.title || !parsed.instructions) {
            throw new Error('Invalid recipe structure');
          }
          
          return parsed;
        }
    } catch (error) {
      console.error('Error parsing recipe response:', error);
      console.error('Raw response:', response);
      
      // Return a fallback recipe
      return {
        title: request.title || 'Generated Recipe',
        description: 'A delicious recipe generated by AI',
        instructions: [
          '1. Prepare your ingredients',
          '2. Follow cooking instructions',
          '3. Serve and enjoy!'
        ],
        ingredients: [
          { name: 'Ingredient 1', amount: 1, unit: 'piece' },
          { name: 'Ingredient 2', amount: 2, unit: 'pieces' }
        ],
        prep_time: 10,
        cook_time: 20,
        servings: 4,
        difficulty: 'medium',
        cuisine_type: 'general',
        dietary_tags: [],
        calories_per_serving: 300,
        protein_per_serving: 15,
        carbs_per_serving: 30,
        fat_per_serving: 10,
        fiber_per_serving: 5,
        sugar_per_serving: 8,
        sodium_per_serving: 400
      };
    }
  }

  /**
   * Parse weekly meal plan response from AI
   */
  private parseWeeklyMealPlanResponse(response: string, request: AIGenerateWeeklyMealPlanRequest): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.meals) {
        throw new Error('Invalid weekly meal plan structure');
      }
      
      return parsed;
    } catch (error) {
      console.error('Error parsing weekly meal plan response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Log AI analysis for monitoring
   */
  private async logAIAnalysis(logData: {
    user_id: number | null;
    analysis_type: 'meal_plan' | 'recipe_suggestion' | 'nutrition_analysis' | 'recipe_generation' | 'weekly_meal_plan';
    prompt: string;
    response: string;
    tokens_used?: number;
    processing_time_ms: number;
  }): Promise<void> {
    try {
      await pool.execute(
        'INSERT INTO ai_analysis_logs (user_id, analysis_type, prompt, response, tokens_used, processing_time_ms) VALUES (?, ?, ?, ?, ?, ?)',
        [logData.user_id, logData.analysis_type, logData.prompt, logData.response, logData.tokens_used, logData.processing_time_ms]
      );
    } catch (error) {
      console.error('Error logging AI analysis:', error);
      // Don't throw error as this is not critical
    }
  }
}

export default new GeminiService();

