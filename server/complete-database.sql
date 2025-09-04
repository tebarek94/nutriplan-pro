-- =====================================================
-- NutriPlan Pro - Complete Database Setup
-- This file contains the complete database schema, 
-- test data, and sample suggestions for the NutriPlan Pro application
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS nutriplan_pro;
USE nutriplan_pro;

-- =====================================================
-- DATABASE SCHEMA
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'other'),
    weight DECIMAL(5,2), -- in kg
    height DECIMAL(5,2), -- in cm
    activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
    fitness_goal ENUM('weight_loss', 'maintenance', 'muscle_gain'),
    dietary_preferences JSON, -- vegetarian, vegan, keto, etc.
    allergies JSON, -- array of allergies
    medical_conditions TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Food categories table
CREATE TABLE IF NOT EXISTS food_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color code
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    calories_per_100g DECIMAL(6,2),
    protein_per_100g DECIMAL(6,2),
    carbs_per_100g DECIMAL(6,2),
    fat_per_100g DECIMAL(6,2),
    fiber_per_100g DECIMAL(6,2),
    sugar_per_100g DECIMAL(6,2),
    sodium_per_100g DECIMAL(6,2),
    vitamins JSON, -- vitamins and minerals
    allergens JSON, -- common allergens
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES food_categories(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_category_id (category_id)
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    prep_time INT, -- in minutes
    cook_time INT, -- in minutes
    servings INT DEFAULT 1,
    difficulty ENUM('easy', 'medium', 'hard'),
    cuisine_type VARCHAR(100),
    dietary_tags JSON, -- vegetarian, vegan, gluten_free, etc.
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    calories_per_serving DECIMAL(6,2),
    protein_per_serving DECIMAL(6,2),
    carbs_per_serving DECIMAL(6,2),
    fat_per_serving DECIMAL(6,2),
    fiber_per_serving DECIMAL(6,2),
    sugar_per_serving DECIMAL(6,2),
    sodium_per_serving DECIMAL(6,2),
    created_by INT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_title (title),
    INDEX idx_created_by (created_by),
    INDEX idx_is_approved (is_approved),
    INDEX idx_is_featured (is_featured)
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_ingredient_id (ingredient_id)
);

-- Recipe ratings and reviews table
CREATE TABLE IF NOT EXISTS recipe_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recipe (user_id, recipe_id),
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating)
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_calories DECIMAL(8,2),
    total_protein DECIMAL(8,2),
    total_carbs DECIMAL(8,2),
    total_fat DECIMAL(8,2),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    ai_prompt TEXT, -- store the prompt used for AI generation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_is_approved (is_approved)
);

-- Meal plan items table
CREATE TABLE IF NOT EXISTS meal_plan_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    meal_plan_id INT NOT NULL,
    recipe_id INT,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    custom_meal_name VARCHAR(255),
    custom_ingredients JSON,
    custom_nutrition JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
    INDEX idx_meal_plan_id (meal_plan_id),
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_meal_type (meal_type),
    INDEX idx_day_of_week (day_of_week)
);

-- Grocery lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    meal_plan_id INT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_meal_plan_id (meal_plan_id)
);

-- Grocery list items table
CREATE TABLE IF NOT EXISTS grocery_list_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    grocery_list_id INT NOT NULL,
    ingredient_id INT,
    custom_item_name VARCHAR(255),
    quantity DECIMAL(8,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category_id INT,
    is_checked BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grocery_list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES food_categories(id) ON DELETE SET NULL,
    INDEX idx_grocery_list_id (grocery_list_id),
    INDEX idx_ingredient_id (ingredient_id),
    INDEX idx_category_id (category_id),
    INDEX idx_is_checked (is_checked)
);

-- AI Analysis Logs table
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    analysis_type ENUM('meal_plan', 'recipe_suggestion', 'nutrition_analysis', 'dietary_advice') NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    tokens_used INT,
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_created_at (created_at)
);

-- Meal Suggestions table (for admin-created suggestions)
CREATE TABLE IF NOT EXISTS meal_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    cuisine_type VARCHAR(100),
    dietary_tags JSON, -- vegetarian, vegan, gluten_free, etc.
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    prep_time INT, -- in minutes
    cook_time INT, -- in minutes
    calories_per_serving DECIMAL(6,2),
    protein_per_serving DECIMAL(6,2),
    carbs_per_serving DECIMAL(6,2),
    fat_per_serving DECIMAL(6,2),
    fiber_per_serving DECIMAL(6,2),
    sugar_per_serving DECIMAL(6,2),
    sodium_per_serving DECIMAL(6,2),
    image_url VARCHAR(500),
    ingredients JSON, -- array of ingredients with quantities
    instructions TEXT,
    tips TEXT,
    created_by INT NOT NULL, -- admin user ID
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_meal_type (meal_type),
    INDEX idx_difficulty (difficulty),
    INDEX idx_cuisine_type (cuisine_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Recipe Suggestions table (for admin-created recipe suggestions)
CREATE TABLE IF NOT EXISTS recipe_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    prep_time INT, -- in minutes
    cook_time INT, -- in minutes
    servings INT DEFAULT 1,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    cuisine_type VARCHAR(100),
    dietary_tags JSON, -- vegetarian, vegan, gluten_free, etc.
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    calories_per_serving DECIMAL(6,2),
    protein_per_serving DECIMAL(6,2),
    carbs_per_serving DECIMAL(6,2),
    fat_per_serving DECIMAL(6,2),
    fiber_per_serving DECIMAL(6,2),
    sugar_per_serving DECIMAL(6,2),
    sodium_per_serving DECIMAL(6,2),
    ingredients JSON, -- array of ingredients with quantities
    tips TEXT,
    nutrition_notes TEXT,
    created_by INT NOT NULL, -- admin user ID
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_difficulty (difficulty),
    INDEX idx_cuisine_type (cuisine_type),
    INDEX idx_is_active (is_active),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_at (created_at)
);

-- User Meal Suggestion Interactions
CREATE TABLE IF NOT EXISTS user_meal_suggestion_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    meal_suggestion_id INT NOT NULL,
    interaction_type ENUM('view', 'like', 'save', 'try') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_suggestion_id) REFERENCES meal_suggestions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_meal_interaction (user_id, meal_suggestion_id, interaction_type),
    INDEX idx_user_id (user_id),
    INDEX idx_meal_suggestion_id (meal_suggestion_id),
    INDEX idx_interaction_type (interaction_type)
);

-- User Suggestions table (for user-submitted suggestions to admin)
CREATE TABLE IF NOT EXISTS suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    suggestion_type ENUM('meal', 'recipe') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'implemented') DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- User Suggestion Interactions
CREATE TABLE IF NOT EXISTS user_suggestion_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    suggestion_id INT NOT NULL,
    interaction_type ENUM('upvote', 'downvote') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_suggestion_interaction (user_id, suggestion_id),
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_id (suggestion_id),
    INDEX idx_interaction_type (interaction_type)
);

-- User Recipe Suggestion Interactions
CREATE TABLE IF NOT EXISTS user_recipe_suggestion_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipe_suggestion_id INT NOT NULL,
    interaction_type ENUM('view', 'like', 'save', 'try') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_suggestion_id) REFERENCES recipe_suggestions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recipe_interaction (user_id, recipe_suggestion_id, interaction_type),
    INDEX idx_user_id (user_id),
    INDEX idx_recipe_suggestion_id (recipe_suggestion_id),
    INDEX idx_interaction_type (interaction_type)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recipe_favorite (user_id, recipe_id),
    INDEX idx_user_id (user_id),
    INDEX idx_recipe_id (recipe_id)
);

-- User Suggestions table (for user-submitted suggestions to admin)
CREATE TABLE IF NOT EXISTS suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    suggestion_type ENUM('meal', 'recipe') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'implemented') DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- User Suggestion Interactions
CREATE TABLE IF NOT EXISTS user_suggestion_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    suggestion_id INT NOT NULL,
    interaction_type ENUM('upvote', 'downvote') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_suggestion_interaction (user_id, suggestion_id),
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_id (suggestion_id),
    INDEX idx_interaction_type (interaction_type)
);

-- Admin User Suggestions table (for admin-created suggestions sent to specific users)
CREATE TABLE IF NOT EXISTS admin_user_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    suggestion_type ENUM('meal', 'recipe') NOT NULL,
    meal_suggestion_id INT,
    recipe_suggestion_id INT,
    message TEXT, -- Admin's personal message to the user
    is_read BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN DEFAULT FALSE,
    admin_notes TEXT, -- Admin's internal notes
    created_by INT NOT NULL, -- admin user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_suggestion_id) REFERENCES meal_suggestions(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_suggestion_id) REFERENCES recipe_suggestions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_suggestion_type (suggestion_type),
    INDEX idx_is_read (is_read),
    INDEX idx_is_accepted (is_accepted),
    INDEX idx_created_at (created_at)
);

-- Weekly Meal Suggestions table (for admin-created weekly meal plans sent to users)
CREATE TABLE IF NOT EXISTS weekly_meal_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_calories DECIMAL(8,2),
    total_protein DECIMAL(8,2),
    total_carbs DECIMAL(8,2),
    total_fat DECIMAL(8,2),
    message TEXT, -- Admin's personal message to the user
    is_read BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN DEFAULT FALSE,
    admin_notes TEXT, -- Admin's internal notes
    created_by INT NOT NULL, -- admin user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_week_start_date (week_start_date),
    INDEX idx_week_end_date (week_end_date),
    INDEX idx_is_read (is_read),
    INDEX idx_is_accepted (is_accepted),
    INDEX idx_created_at (created_at)
);

-- Weekly Meal Suggestion Items table
CREATE TABLE IF NOT EXISTS weekly_meal_suggestion_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    weekly_meal_suggestion_id INT NOT NULL,
    meal_suggestion_id INT,
    recipe_suggestion_id INT,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    custom_meal_name VARCHAR(255),
    custom_ingredients JSON,
    custom_nutrition JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (weekly_meal_suggestion_id) REFERENCES weekly_meal_suggestions(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_suggestion_id) REFERENCES meal_suggestions(id) ON DELETE SET NULL,
    FOREIGN KEY (recipe_suggestion_id) REFERENCES recipe_suggestions(id) ON DELETE SET NULL,
    INDEX idx_weekly_meal_suggestion_id (weekly_meal_suggestion_id),
    INDEX idx_meal_type (meal_type),
    INDEX idx_day_of_week (day_of_week)
);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert Food Categories
INSERT INTO food_categories (name, description, color, icon) VALUES
('Vegetables', 'Fresh and cooked vegetables', '#4CAF50', '🥬'),
('Fruits', 'Fresh fruits and berries', '#FF9800', '🍎'),
('Proteins', 'Meat, fish, eggs, and legumes', '#F44336', '🥩'),
('Grains', 'Bread, rice, pasta, and cereals', '#8BC34A', '🍞'),
('Dairy', 'Milk, cheese, and yogurt', '#2196F3', '🥛'),
('Nuts & Seeds', 'Nuts, seeds, and nut butters', '#795548', '🥜'),
('Herbs & Spices', 'Fresh herbs and spices', '#9C27B0', '🌿'),
('Oils & Fats', 'Cooking oils and healthy fats', '#FFC107', '🫒');

-- Insert Users (password: test123 for all users, admin123 for admin)
INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified) VALUES
('admin@nutriplanpro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxqKqG', 'Admin', 'User', 'admin', true, true),
('john.doe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxqKqG', 'John', 'Doe', 'user', true, true),
('jane.smith@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxqKqG', 'Jane', 'Smith', 'user', true, true),
('mike.wilson@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxqKqG', 'Mike', 'Wilson', 'user', true, true),
('sarah.johnson@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxqKqG', 'Sarah', 'Johnson', 'user', true, true);

-- Insert User Profiles
INSERT INTO user_profiles (user_id, age, gender, weight, height, activity_level, fitness_goal, dietary_preferences, allergies, medical_conditions) VALUES
(2, 28, 'male', 75, 180, 'moderately_active', 'muscle_gain', '["vegetarian"]', '["nuts"]', NULL),
(3, 32, 'female', 65, 165, 'lightly_active', 'weight_loss', '["vegan"]', '["dairy", "gluten"]', 'Diabetes type 2'),
(4, 25, 'male', 80, 175, 'very_active', 'maintenance', '["keto"]', '[]', NULL),
(5, 29, 'female', 60, 160, 'sedentary', 'weight_loss', '["pescatarian"]', '["shellfish"]', NULL);

-- Insert Ingredients
INSERT INTO ingredients (name, category_id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, allergens, image_url) VALUES
-- Vegetables
('Broccoli', 1, 34, 2.8, 7, 0.4, 2.6, 1.5, 33, '[]', 'https://example.com/broccoli.jpg'),
('Spinach', 1, 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, '[]', 'https://example.com/spinach.jpg'),
('Carrots', 1, 41, 0.9, 10, 0.2, 2.8, 4.7, 69, '[]', 'https://example.com/carrots.jpg'),
('Bell Peppers', 1, 31, 1, 7, 0.3, 2.1, 4.2, 4, '[]', 'https://example.com/bell-peppers.jpg'),
('Sweet Potato', 1, 86, 1.6, 20, 0.1, 3, 4.2, 55, '[]', 'https://example.com/sweet-potato.jpg'),

-- Fruits
('Banana', 2, 89, 1.1, 23, 0.3, 2.6, 12, 1, '[]', 'https://example.com/banana.jpg'),
('Apple', 2, 52, 0.3, 14, 0.2, 2.4, 10, 1, '[]', 'https://example.com/apple.jpg'),
('Blueberries', 2, 57, 0.7, 14, 0.3, 2.4, 10, 1, '[]', 'https://example.com/blueberries.jpg'),
('Strawberries', 2, 32, 0.7, 8, 0.3, 2, 4.9, 1, '[]', 'https://example.com/strawberries.jpg'),
('Avocado', 2, 160, 2, 9, 15, 6.7, 0.7, 7, '[]', 'https://example.com/avocado.jpg'),

-- Proteins
('Chicken Breast', 3, 165, 31, 0, 3.6, 0, 0, 74, '[]', 'https://example.com/chicken-breast.jpg'),
('Salmon', 3, 208, 25, 0, 12, 0, 0, 59, '["fish"]', 'https://example.com/salmon.jpg'),
('Eggs', 3, 155, 13, 1.1, 11, 0, 1.1, 124, '["eggs"]', 'https://example.com/eggs.jpg'),
('Black Beans', 3, 132, 8.9, 23, 0.5, 8.7, 0.3, 1, '[]', 'https://example.com/black-beans.jpg'),
('Tofu', 3, 76, 8, 1.9, 4.8, 0.3, 0.6, 7, '["soy"]', 'https://example.com/tofu.jpg'),

-- Grains
('Brown Rice', 4, 111, 2.6, 23, 0.9, 1.8, 0.4, 5, '[]', 'https://example.com/brown-rice.jpg'),
('Quinoa', 4, 120, 4.4, 22, 1.9, 2.8, 0.9, 7, '[]', 'https://example.com/quinoa.jpg'),
('Oats', 4, 389, 17, 66, 7, 10.6, 0.3, 2, '["gluten"]', 'https://example.com/oats.jpg'),
('Whole Wheat Bread', 4, 247, 13, 41, 4.2, 7, 6.9, 400, '["gluten", "wheat"]', 'https://example.com/whole-wheat-bread.jpg'),
('Pasta', 4, 131, 5, 25, 1.1, 1.8, 0.6, 6, '["gluten", "wheat"]', 'https://example.com/pasta.jpg'),

-- Dairy
('Greek Yogurt', 5, 59, 10, 3.6, 0.4, 0, 3.2, 36, '["milk"]', 'https://example.com/greek-yogurt.jpg'),
('Cheddar Cheese', 5, 403, 25, 1.3, 33, 0, 0.5, 621, '["milk"]', 'https://example.com/cheddar-cheese.jpg'),
('Milk', 5, 42, 3.4, 5, 1, 0, 5, 44, '["milk"]', 'https://example.com/milk.jpg'),
('Cottage Cheese', 5, 98, 11, 3.4, 4.3, 0, 2.7, 364, '["milk"]', 'https://example.com/cottage-cheese.jpg'),

-- Nuts & Seeds
('Almonds', 6, 579, 21, 22, 50, 12.5, 4.8, 1, '["nuts"]', 'https://example.com/almonds.jpg'),
('Chia Seeds', 6, 486, 17, 42, 31, 34.4, 0, 16, '[]', 'https://example.com/chia-seeds.jpg'),
('Peanut Butter', 6, 588, 25, 20, 50, 6, 9.2, 459, '["nuts"]', 'https://example.com/peanut-butter.jpg'),
('Sunflower Seeds', 6, 584, 21, 20, 51, 8.6, 2.6, 9, '["nuts"]', 'https://example.com/sunflower-seeds.jpg'),

-- Herbs & Spices
('Basil', 7, 22, 3.2, 2.6, 0.6, 1.6, 0.3, 4, '[]', 'https://example.com/basil.jpg'),
('Garlic', 7, 149, 6.4, 33, 0.5, 2.1, 1, 17, '[]', 'https://example.com/garlic.jpg'),
('Ginger', 7, 80, 1.8, 18, 0.8, 2, 1.7, 13, '[]', 'https://example.com/ginger.jpg'),
('Turmeric', 7, 354, 8, 65, 10, 21, 3.2, 38, '[]', 'https://example.com/turmeric.jpg'),

-- Oils & Fats
('Olive Oil', 8, 884, 0, 0, 100, 0, 0, 2, '[]', 'https://example.com/olive-oil.jpg'),
('Coconut Oil', 8, 862, 0, 0, 100, 0, 0, 0, '[]', 'https://example.com/coconut-oil.jpg'),
('Butter', 8, 717, 0.9, 0.1, 81, 0, 0.1, 11, '["milk"]', 'https://example.com/butter.jpg');

-- Insert Recipes
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, difficulty, cuisine_type, dietary_tags, image_url, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, fiber_per_serving, sugar_per_serving, sodium_per_serving, created_by, is_approved, is_featured, view_count) VALUES
('Grilled Chicken Salad', 'A healthy and delicious grilled chicken salad with fresh vegetables', '1. Season chicken breast with salt and pepper\n2. Grill chicken for 6-8 minutes per side\n3. Let chicken rest for 5 minutes\n4. Chop vegetables and mix in a bowl\n5. Slice chicken and add to salad\n6. Drizzle with olive oil and lemon juice', 15, 20, 4, 'easy', 'Mediterranean', '["high_protein", "low_carb"]', 'https://example.com/grilled-chicken-salad.jpg', 320, 35, 8, 18, 6, 4, 450, 2, true, true, 1250),
('Quinoa Buddha Bowl', 'A nutritious vegetarian bowl with quinoa, roasted vegetables, and tahini dressing', '1. Cook quinoa according to package instructions\n2. Roast vegetables at 400°F for 25 minutes\n3. Prepare tahini dressing\n4. Assemble bowl with quinoa, vegetables, and dressing\n5. Garnish with seeds and herbs', 20, 30, 2, 'medium', 'Mediterranean', '["vegetarian", "vegan", "gluten_free"]', 'https://example.com/quinoa-buddha-bowl.jpg', 420, 12, 45, 22, 8, 6, 380, 3, true, true, 890),
('Salmon with Roasted Vegetables', 'Baked salmon fillet with colorful roasted vegetables', '1. Preheat oven to 400°F\n2. Season salmon with herbs and lemon\n3. Arrange vegetables on baking sheet\n4. Place salmon on top of vegetables\n5. Bake for 20-25 minutes\n6. Serve with lemon wedges', 15, 25, 2, 'easy', 'Mediterranean', '["high_protein", "omega_3", "gluten_free"]', 'https://example.com/salmon-vegetables.jpg', 380, 28, 15, 22, 7, 8, 520, 4, true, false, 650),
('Vegan Smoothie Bowl', 'A colorful and nutritious smoothie bowl topped with fresh fruits and granola', '1. Blend frozen fruits with almond milk\n2. Pour into bowl\n3. Top with fresh fruits, granola, and seeds\n4. Drizzle with honey or maple syrup', 10, 0, 1, 'easy', 'American', '["vegan", "gluten_free", "breakfast"]', 'https://example.com/smoothie-bowl.jpg', 280, 8, 45, 12, 6, 32, 45, 3, true, true, 1120),
('Greek Yogurt Parfait', 'Layered Greek yogurt with berries and honey', '1. Layer Greek yogurt in glass\n2. Add berries and honey\n3. Repeat layers\n4. Top with granola and mint', 5, 0, 1, 'easy', 'Mediterranean', '["high_protein", "breakfast", "vegetarian"]', 'https://example.com/yogurt-parfait.jpg', 220, 15, 25, 8, 3, 18, 120, 5, true, false, 780);

-- Insert Sample Meal Suggestions
INSERT INTO meal_suggestions (
    title, description, meal_type, cuisine_type, dietary_tags, difficulty,
    prep_time, cook_time, calories_per_serving, protein_per_serving,
    carbs_per_serving, fat_per_serving, fiber_per_serving, sugar_per_serving,
    sodium_per_serving, image_url, ingredients, instructions, tips, created_by,
    is_active, view_count, like_count
) VALUES
(
    'Protein Power Breakfast Bowl',
    'A nutrient-packed breakfast bowl with Greek yogurt, berries, and granola for sustained energy throughout the morning.',
    'breakfast',
    'Mediterranean',
    '["high_protein", "vegetarian", "gluten_free"]',
    'easy',
    10,
    0,
    320,
    25,
    35,
    12,
    8,
    18,
    120,
    'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=500',
    '[{"name": "Greek Yogurt", "quantity": 200, "unit": "g"}, {"name": "Mixed Berries", "quantity": 100, "unit": "g"}, {"name": "Granola", "quantity": 50, "unit": "g"}, {"name": "Honey", "quantity": 15, "unit": "ml"}]',
    '1. Layer Greek yogurt in a bowl\n2. Top with fresh mixed berries\n3. Sprinkle with granola\n4. Drizzle with honey\n5. Serve immediately',
    'Use frozen berries for a refreshing twist. Add chia seeds for extra fiber.',
    1,
    true,
    45,
    12
),
(
    'Mediterranean Lunch Plate',
    'A colorful and healthy lunch plate featuring grilled chicken, quinoa, and roasted vegetables with Mediterranean flavors.',
    'lunch',
    'Mediterranean',
    '["high_protein", "gluten_free", "balanced"]',
    'medium',
    20,
    25,
    450,
    35,
    40,
    18,
    12,
    8,
    380,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    '[{"name": "Chicken Breast", "quantity": 150, "unit": "g"}, {"name": "Quinoa", "quantity": 100, "unit": "g"}, {"name": "Bell Peppers", "quantity": 100, "unit": "g"}, {"name": "Cherry Tomatoes", "quantity": 80, "unit": "g"}, {"name": "Olive Oil", "quantity": 15, "unit": "ml"}]',
    '1. Season and grill chicken breast\n2. Cook quinoa according to package\n3. Roast vegetables with olive oil\n4. Arrange on plate\n5. Drizzle with lemon juice',
    'Marinate chicken in herbs and lemon for extra flavor. Use different colored bell peppers for visual appeal.',
    1,
    true,
    78,
    23
);

-- Insert Sample Meal Plans
INSERT INTO meal_plans (
    user_id, name, description, start_date, end_date, total_calories, total_protein, total_carbs, total_fat,
    is_ai_generated, ai_prompt, created_at, updated_at
) VALUES
(
    2, 'Healthy Week Plan', 'A balanced meal plan for a healthy lifestyle', '2025-09-04', '2025-09-11',
    1680, 120, 180, 65, true, 'Create a healthy meal plan for a vegetarian user with moderate activity level',
    NOW(), NOW()
),
(
    3, 'Vegan Power Week', 'Plant-based meal plan for energy and nutrition', '2025-09-04', '2025-09-11',
    1750, 95, 220, 70, true, 'Design a vegan meal plan with high protein and balanced macros',
    NOW(), NOW()
),
(
    4, 'Keto Transformation', 'Low-carb meal plan for weight loss', '2025-09-04', '2025-09-11',
    1850, 140, 45, 120, true, 'Create a ketogenic meal plan with high protein and low carbs',
    NOW(), NOW()
);

-- Insert Sample Meal Plan Items
INSERT INTO meal_plan_items (
    meal_plan_id, meal_type, day_of_week, recipe_id, custom_meal_name, custom_ingredients, custom_nutrition
) VALUES
-- Healthy Week Plan (User 2) - Using existing recipes (IDs 1-5)
(1, 'breakfast', 'monday', 1, NULL, NULL, NULL),
(1, 'lunch', 'monday', 2, NULL, NULL, NULL),
(1, 'dinner', 'monday', 3, NULL, NULL, NULL),
(1, 'snack', 'monday', NULL, 'Greek Yogurt with Berries', '[{"name": "Greek Yogurt", "quantity": 150, "unit": "g"}, {"name": "Mixed Berries", "quantity": 50, "unit": "g"}]', '{"calories": 180, "protein": 15, "carbs": 20, "fat": 8}'),
(1, 'breakfast', 'tuesday', 4, NULL, NULL, NULL),
(1, 'lunch', 'tuesday', 5, NULL, NULL, NULL),
(1, 'dinner', 'tuesday', 1, NULL, NULL, NULL),
(1, 'snack', 'tuesday', NULL, 'Almonds and Apple', '[{"name": "Almonds", "quantity": 30, "unit": "g"}, {"name": "Apple", "quantity": 1, "unit": "piece"}]', '{"calories": 200, "protein": 6, "carbs": 25, "fat": 12}'),
(1, 'breakfast', 'wednesday', 2, NULL, NULL, NULL),
(1, 'lunch', 'wednesday', 3, NULL, NULL, NULL),
(1, 'dinner', 'wednesday', 4, NULL, NULL, NULL),
(1, 'snack', 'wednesday', NULL, 'Hummus with Carrots', '[{"name": "Hummus", "quantity": 60, "unit": "g"}, {"name": "Carrots", "quantity": 100, "unit": "g"}]', '{"calories": 160, "protein": 8, "carbs": 18, "fat": 8}'),
(1, 'breakfast', 'thursday', 5, NULL, NULL, NULL),
(1, 'lunch', 'thursday', 1, NULL, NULL, NULL),
(1, 'dinner', 'thursday', 2, NULL, NULL, NULL),
(1, 'snack', 'thursday', NULL, 'Mixed Nuts', '[{"name": "Almonds", "quantity": 20, "unit": "g"}, {"name": "Walnuts", "quantity": 20, "unit": "g"}, {"name": "Cashews", "quantity": 20, "unit": "g"}]', '{"calories": 240, "protein": 8, "carbs": 12, "fat": 20}'),
(1, 'breakfast', 'friday', 3, NULL, NULL, NULL),
(1, 'lunch', 'friday', 4, NULL, NULL, NULL),
(1, 'dinner', 'friday', 5, NULL, NULL, NULL),
(1, 'snack', 'friday', NULL, 'Apple with Peanut Butter', '[{"name": "Apple", "quantity": 1, "unit": "piece"}, {"name": "Peanut Butter", "quantity": 30, "unit": "g"}]', '{"calories": 190, "protein": 4, "carbs": 25, "fat": 10}'),
(1, 'breakfast', 'saturday', 1, NULL, NULL, NULL),
(1, 'lunch', 'saturday', 2, NULL, NULL, NULL),
(1, 'dinner', 'saturday', 3, NULL, NULL, NULL),
(1, 'snack', 'saturday', NULL, 'Greek Yogurt with Honey', '[{"name": "Greek Yogurt", "quantity": 200, "unit": "g"}, {"name": "Honey", "quantity": 15, "unit": "ml"}]', '{"calories": 160, "protein": 20, "carbs": 15, "fat": 0}'),
(1, 'breakfast', 'sunday', 4, NULL, NULL, NULL),
(1, 'lunch', 'sunday', 5, NULL, NULL, NULL),
(1, 'dinner', 'sunday', 1, NULL, NULL, NULL),
(1, 'snack', 'sunday', NULL, 'Carrot Sticks with Hummus', '[{"name": "Carrots", "quantity": 150, "unit": "g"}, {"name": "Hummus", "quantity": 50, "unit": "g"}]', '{"calories": 140, "protein": 6, "carbs": 20, "fat": 6}'),

-- Vegan Power Week (User 3) - Using existing recipes (IDs 1-5)
(2, 'breakfast', 'monday', 2, NULL, NULL, NULL),
(2, 'lunch', 'monday', 3, NULL, NULL, NULL),
(2, 'dinner', 'monday', 4, NULL, NULL, NULL),
(2, 'snack', 'monday', NULL, 'Smoothie Bowl', '[{"name": "Banana", "quantity": 1, "unit": "piece"}, {"name": "Spinach", "quantity": 50, "unit": "g"}, {"name": "Almond Milk", "quantity": 200, "unit": "ml"}]', '{"calories": 220, "protein": 8, "carbs": 35, "fat": 6}'),
(2, 'breakfast', 'tuesday', 5, NULL, NULL, NULL),
(2, 'lunch', 'tuesday', 1, NULL, NULL, NULL),
(2, 'dinner', 'tuesday', 2, NULL, NULL, NULL),
(2, 'snack', 'tuesday', NULL, 'Chia Pudding', '[{"name": "Chia Seeds", "quantity": 30, "unit": "g"}, {"name": "Coconut Milk", "quantity": 150, "unit": "ml"}]', '{"calories": 180, "protein": 6, "carbs": 15, "fat": 12}'),
(2, 'breakfast', 'wednesday', 3, NULL, NULL, NULL),
(2, 'lunch', 'wednesday', 4, NULL, NULL, NULL),
(2, 'dinner', 'wednesday', 5, NULL, NULL, NULL),
(2, 'snack', 'wednesday', NULL, 'Vegan Protein Shake', '[{"name": "Plant Protein Powder", "quantity": 30, "unit": "g"}, {"name": "Almond Milk", "quantity": 300, "unit": "ml"}, {"name": "Berries", "quantity": 100, "unit": "g"}]', '{"calories": 250, "protein": 25, "carbs": 20, "fat": 8}'),
(2, 'breakfast', 'thursday', 1, NULL, NULL, NULL),
(2, 'lunch', 'thursday', 2, NULL, NULL, NULL),
(2, 'dinner', 'thursday', 3, NULL, NULL, NULL),
(2, 'snack', 'thursday', NULL, 'Avocado Toast', '[{"name": "Whole Grain Bread", "quantity": 2, "unit": "slices"}, {"name": "Avocado", "quantity": 0.5, "unit": "piece"}, {"name": "Sea Salt", "quantity": 2, "unit": "g"}]', '{"calories": 280, "protein": 8, "carbs": 30, "fat": 15}'),
(2, 'breakfast', 'friday', 4, NULL, NULL, NULL),
(2, 'lunch', 'friday', 5, NULL, NULL, NULL),
(2, 'dinner', 'friday', 1, NULL, NULL, NULL),
(2, 'snack', 'friday', NULL, 'Mixed Berries', '[{"name": "Strawberries", "quantity": 100, "unit": "g"}, {"name": "Blueberries", "quantity": 100, "unit": "g"}, {"name": "Raspberries", "quantity": 100, "unit": "g"}]', '{"calories": 120, "protein": 3, "carbs": 25, "fat": 1}'),
(2, 'breakfast', 'saturday', 2, NULL, NULL, NULL),
(2, 'lunch', 'saturday', 3, NULL, NULL, NULL),
(2, 'dinner', 'saturday', 4, NULL, NULL, NULL),
(2, 'snack', 'saturday', NULL, 'Dark Chocolate with Almonds', '[{"name": "Dark Chocolate", "quantity": 30, "unit": "g"}, {"name": "Almonds", "quantity": 30, "unit": "g"}]', '{"calories": 200, "protein": 6, "carbs": 15, "fat": 15}'),
(2, 'breakfast', 'sunday', 5, NULL, NULL, NULL),
(2, 'lunch', 'sunday', 1, NULL, NULL, NULL),
(2, 'dinner', 'sunday', 2, NULL, NULL, NULL),
(2, 'snack', 'sunday', NULL, 'Green Smoothie', '[{"name": "Spinach", "quantity": 50, "unit": "g"}, {"name": "Banana", "quantity": 1, "unit": "piece"}, {"name": "Almond Milk", "quantity": 250, "unit": "ml"}]', '{"calories": 180, "protein": 6, "carbs": 30, "fat": 4}'),

-- Keto Transformation (User 4) - Using existing recipes (IDs 1-5)
(3, 'breakfast', 'monday', 1, NULL, NULL, NULL),
(3, 'lunch', 'monday', 2, NULL, NULL, NULL),
(3, 'dinner', 'monday', 3, NULL, NULL, NULL),
(3, 'snack', 'monday', NULL, 'Cheese and Nuts', '[{"name": "Cheddar Cheese", "quantity": 50, "unit": "g"}, {"name": "Walnuts", "quantity": 30, "unit": "g"}]', '{"calories": 280, "protein": 12, "carbs": 3, "fat": 25}'),
(3, 'breakfast', 'tuesday', 4, NULL, NULL, NULL),
(3, 'lunch', 'tuesday', 5, NULL, NULL, NULL),
(3, 'dinner', 'tuesday', 1, NULL, NULL, NULL),
(3, 'snack', 'tuesday', NULL, 'Avocado with Salt', '[{"name": "Avocado", "quantity": 1, "unit": "piece"}, {"name": "Sea Salt", "quantity": 2, "unit": "g"}]', '{"calories": 160, "protein": 2, "carbs": 8, "fat": 15}'),
(3, 'breakfast', 'wednesday', 2, NULL, NULL, NULL),
(3, 'lunch', 'wednesday', 3, NULL, NULL, NULL),
(3, 'dinner', 'wednesday', 4, NULL, NULL, NULL),
(3, 'snack', 'wednesday', NULL, 'Hard Boiled Eggs', '[{"name": "Eggs", "quantity": 2, "unit": "pieces"}, {"name": "Sea Salt", "quantity": 1, "unit": "g"}]', '{"calories": 140, "protein": 12, "carbs": 1, "fat": 10}'),
(3, 'breakfast', 'thursday', 5, NULL, NULL, NULL),
(3, 'lunch', 'thursday', 1, NULL, NULL, NULL),
(3, 'dinner', 'thursday', 2, NULL, NULL, NULL),
(3, 'snack', 'thursday', NULL, 'Almond Butter with Celery', '[{"name": "Almond Butter", "quantity": 30, "unit": "g"}, {"name": "Celery", "quantity": 100, "unit": "g"}]', '{"calories": 200, "protein": 8, "carbs": 8, "fat": 18}'),
(3, 'breakfast', 'friday', 3, NULL, NULL, NULL),
(3, 'lunch', 'friday', 4, NULL, NULL, NULL),
(3, 'dinner', 'friday', 5, NULL, NULL, NULL),
(3, 'snack', 'friday', NULL, 'Coconut Chips', '[{"name": "Coconut Chips", "quantity": 40, "unit": "g"}]', '{"calories": 240, "protein": 2, "carbs": 8, "fat": 24}'),
(3, 'breakfast', 'saturday', 1, NULL, NULL, NULL),
(3, 'lunch', 'saturday', 2, NULL, NULL, NULL),
(3, 'dinner', 'saturday', 3, NULL, NULL, NULL),
(3, 'snack', 'saturday', NULL, 'Olives and Cheese', '[{"name": "Olives", "quantity": 50, "unit": "g"}, {"name": "Feta Cheese", "quantity": 30, "unit": "g"}]', '{"calories": 180, "protein": 6, "carbs": 2, "fat": 16}'),
(3, 'breakfast', 'sunday', 4, NULL, NULL, NULL),
(3, 'lunch', 'sunday', 5, NULL, NULL, NULL),
(3, 'dinner', 'sunday', 1, NULL, NULL, NULL),
(3, 'snack', 'sunday', NULL, 'Macadamia Nuts', '[{"name": "Macadamia Nuts", "quantity": 40, "unit": "g"}]', '{"calories": 280, "protein": 3, "carbs": 4, "fat": 28}');

-- Insert Sample Recipe Suggestions
INSERT INTO recipe_suggestions (
    title, description, instructions, prep_time, cook_time, servings, difficulty,
    cuisine_type, dietary_tags, image_url, video_url, calories_per_serving,
    protein_per_serving, carbs_per_serving, fat_per_serving, fiber_per_serving,
    sugar_per_serving, sodium_per_serving, ingredients, tips, nutrition_notes,
    created_by, is_active, is_featured, view_count, like_count
) VALUES
(
    'One-Pan Mediterranean Chicken',
    'A flavorful one-pan meal with tender chicken, colorful vegetables, and Mediterranean herbs. Perfect for busy weeknights.',
    '1. Preheat oven to 400°F (200°C)\n2. Season chicken breasts with Mediterranean herbs\n3. Arrange chicken and vegetables on a large baking sheet\n4. Drizzle with olive oil and lemon juice\n5. Bake for 25-30 minutes until chicken is cooked through\n6. Let rest for 5 minutes before serving',
    15,
    30,
    4,
    'easy',
    'Mediterranean',
    '["high_protein", "gluten_free", "one_pan"]',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500',
    NULL,
    380,
    35,
    25,
    18,
    8,
    6,
    420,
    '[{"name": "Chicken Breast", "quantity": 600, "unit": "g"}, {"name": "Bell Peppers", "quantity": 300, "unit": "g"}, {"name": "Zucchini", "quantity": 200, "unit": "g"}, {"name": "Cherry Tomatoes", "quantity": 200, "unit": "g"}, {"name": "Olive Oil", "quantity": 30, "unit": "ml"}, {"name": "Lemon", "quantity": 1, "unit": "piece"}]',
    'Use bone-in chicken thighs for more flavor. Add olives and feta cheese for extra Mediterranean taste.',
    'This recipe provides 35g of protein per serving and is rich in vitamins A and C from the vegetables.',
    1,
    true,
    true,
    234,
    67
),
(
    'Quinoa Power Bowl',
    'A nutrient-dense bowl packed with protein, fiber, and essential nutrients. Perfect for meal prep and healthy eating.',
    '1. Rinse quinoa thoroughly under cold water\n2. Cook quinoa with vegetable broth for enhanced flavor\n3. Prepare vegetables: chop, slice, and prepare toppings\n4. Make tahini dressing by whisking tahini, lemon, and water\n5. Assemble bowls with quinoa base, vegetables, and protein\n6. Drizzle with dressing and garnish with seeds',
    20,
    20,
    2,
    'medium',
    'Mediterranean',
    '["vegan", "vegetarian", "gluten_free", "high_protein"]',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    NULL,
    450,
    18,
    55,
    22,
    12,
    8,
    380,
    '[{"name": "Quinoa", "quantity": 150, "unit": "g"}, {"name": "Chickpeas", "quantity": 200, "unit": "g"}, {"name": "Sweet Potato", "quantity": 200, "unit": "g"}, {"name": "Kale", "quantity": 100, "unit": "g"}, {"name": "Tahini", "quantity": 30, "unit": "g"}, {"name": "Pumpkin Seeds", "quantity": 30, "unit": "g"}]',
    'Roast chickpeas with spices for extra crunch. Use different colored vegetables for visual appeal.',
    'This bowl provides 18g of protein and 12g of fiber, making it a complete and satisfying meal.',
    1,
    true,
    true,
    189,
    54
);

-- =====================================================
-- DATABASE SUMMARY
-- =====================================================

SELECT 'NutriPlan Pro Database Setup Complete!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_food_categories FROM food_categories;
SELECT COUNT(*) as total_ingredients FROM ingredients;
SELECT COUNT(*) as total_recipes FROM recipes;
SELECT COUNT(*) as total_meal_suggestions FROM meal_suggestions;
SELECT COUNT(*) as total_recipe_suggestions FROM recipe_suggestions;
SELECT COUNT(*) as total_suggestions FROM suggestions;
SELECT COUNT(*) as total_weekly_meal_suggestions FROM weekly_meal_suggestions;

-- =====================================================
-- USEFUL QUERIES FOR TESTING
-- =====================================================

-- Get all users with their profiles
-- SELECT u.*, up.age, up.gender, up.fitness_goal FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id;

-- Get all recipes with their ingredients
-- SELECT r.*, GROUP_CONCAT(i.name) as ingredients FROM recipes r 
-- LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id 
-- LEFT JOIN ingredients i ON ri.ingredient_id = i.id 
-- GROUP BY r.id;

-- Get meal suggestions by type
-- SELECT * FROM meal_suggestions WHERE meal_type = 'breakfast' AND is_active = true;

-- Get featured recipe suggestions
-- SELECT * FROM recipe_suggestions WHERE is_featured = true AND is_active = true;

-- Get user interactions with suggestions
-- SELECT u.first_name, ms.title, umsi.interaction_type 
-- FROM user_meal_suggestion_interactions umsi 
-- JOIN users u ON umsi.user_id = u.id 
-- JOIN meal_suggestions ms ON umsi.meal_suggestion_id = ms.id;
