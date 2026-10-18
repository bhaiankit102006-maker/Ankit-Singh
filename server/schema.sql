-- NutriTrack MySQL Database Schema
-- Database: diet_app
-- Port: 3307 / 3306

CREATE DATABASE IF NOT EXISTS `diet_app` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `diet_app`;

-- 1. Users Table (Preserving compatibility with existing projects)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'user',
  `is_verified` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. User Profiles (Biometrics, BMR, Goals, Dietary Preferences)
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `age` INT DEFAULT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other', 'prefer_not_to_say') DEFAULT 'prefer_not_to_say',
  `height_cm` DECIMAL(5,2) DEFAULT NULL,
  `current_weight_kg` DECIMAL(5,2) DEFAULT NULL,
  `target_weight_kg` DECIMAL(5,2) DEFAULT NULL,
  `activity_level` ENUM('sedentary', 'light', 'moderate', 'active', 'very_active') DEFAULT 'sedentary',
  `goal` ENUM('lose_weight', 'maintain_weight', 'gain_weight') DEFAULT 'maintain_weight',
  `dietary_preference` ENUM('omnivore', 'vegetarian', 'vegan', 'eggetarian', 'pescatarian', 'keto') DEFAULT 'omnivore',
  `allergies` TEXT DEFAULT NULL,
  `meals_per_day` INT DEFAULT 3,
  `bmr` DECIMAL(7,2) DEFAULT NULL,
  `tdee` DECIMAL(7,2) DEFAULT NULL,
  `daily_calorie_target` INT NOT NULL DEFAULT 2000,
  `protein_target_g` DECIMAL(6,2) NOT NULL DEFAULT 120.00,
  `carbs_target_g` DECIMAL(6,2) NOT NULL DEFAULT 220.00,
  `fat_target_g` DECIMAL(6,2) NOT NULL DEFAULT 65.00,
  `water_target_ml` INT NOT NULL DEFAULT 2500,
  `health_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Food Items (Verified Seed and Custom User Foods)
CREATE TABLE IF NOT EXISTS `food_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `brand` VARCHAR(120) DEFAULT NULL,
  `category` VARCHAR(80) NOT NULL DEFAULT 'General',
  `serving_size` DECIMAL(7,2) NOT NULL DEFAULT 100.00,
  `serving_unit` VARCHAR(50) NOT NULL DEFAULT 'g',
  `calories` DECIMAL(7,2) NOT NULL DEFAULT 0.00,
  `protein` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `carbs` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `fat` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `fiber` DECIMAL(6,2) DEFAULT 0.00,
  `sugar` DECIMAL(6,2) DEFAULT 0.00,
  `sodium` DECIMAL(7,2) DEFAULT 0.00,
  `source` VARCHAR(80) DEFAULT 'NutriTrack Database',
  `is_custom` TINYINT(1) DEFAULT 0,
  `created_by_user_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_food_name` (`name`),
  INDEX `idx_food_category` (`category`),
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Food Favorites
CREATE TABLE IF NOT EXISTS `food_favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `food_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_user_food` (`user_id`, `food_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Meal Diary Entries (Historical Nutrition Snapshot Saved)
CREATE TABLE IF NOT EXISTS `meal_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `meal_type` ENUM('breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner') NOT NULL,
  `food_id` INT DEFAULT NULL,
  `food_name` VARCHAR(200) NOT NULL,
  `portion_quantity` DECIMAL(7,2) NOT NULL DEFAULT 100.00,
  `portion_unit` VARCHAR(50) NOT NULL DEFAULT 'g',
  `calories` DECIMAL(7,2) NOT NULL DEFAULT 0.00,
  `protein` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `carbs` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `fat` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `fiber` DECIMAL(6,2) DEFAULT 0.00,
  `sugar` DECIMAL(6,2) DEFAULT 0.00,
  `sodium` DECIMAL(7,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_meals_user_date` (`user_id`, `date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Water Consumption Entries
CREATE TABLE IF NOT EXISTS `water_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `amount_ml` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_water_user_date` (`user_id`, `date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Weight Entries
CREATE TABLE IF NOT EXISTS `weight_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `weight_kg` DECIMAL(5,2) NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_weight_user_date` (`user_id`, `date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Meal Plans
CREATE TABLE IF NOT EXISTS `meal_plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `day_of_week` ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'any') DEFAULT 'any',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Meal Plan Items
CREATE TABLE IF NOT EXISTS `meal_plan_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meal_plan_id` INT NOT NULL,
  `meal_type` ENUM('breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner') NOT NULL,
  `food_id` INT DEFAULT NULL,
  `food_name` VARCHAR(200) NOT NULL,
  `portion_quantity` DECIMAL(7,2) NOT NULL DEFAULT 100.00,
  `portion_unit` VARCHAR(50) NOT NULL DEFAULT 'g',
  `calories` DECIMAL(7,2) NOT NULL DEFAULT 0.00,
  `protein` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `carbs` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `fat` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (`meal_plan_id`) REFERENCES `meal_plans`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. User Settings
CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `unit_system` ENUM('metric', 'imperial') DEFAULT 'metric',
  `daily_water_target_ml` INT DEFAULT 2500,
  `notifications_enabled` TINYINT(1) DEFAULT 1,
  `privacy_analytics` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
