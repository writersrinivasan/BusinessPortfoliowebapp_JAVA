const express = require('express');
const Recipe = require('../models/recipe');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// Get all recipes
router.get('/', async (req, res, next) => {
  try {
    const recipes = await Recipe.getAll();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Get a single recipe
router.get('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.getById(req.params.id);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Create a new recipe
router.post('/', async (req, res, next) => {
  try {
    const { title, category, instructions } = req.body;
    
    if (!title || !category || !instructions) {
      throw new ApiError(400, 'Title, category, and instructions are required');
    }
    
    const newRecipe = await Recipe.create({ title, category, instructions });
    res.status(201).json(newRecipe);
  } catch (error) {
    next(error);
  }
});

// Update a recipe
router.put('/:id', async (req, res, next) => {
  try {
    const { title, category, instructions } = req.body;
    
    if (!title || !category || !instructions) {
      throw new ApiError(400, 'Title, category, and instructions are required');
    }
    
    const updatedRecipe = await Recipe.update(req.params.id, { title, category, instructions });
    res.json(updatedRecipe);
  } catch (error) {
    next(error);
  }
});

// Delete a recipe
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await Recipe.delete(req.params.id);
    res.json({ message: 'Recipe deleted successfully', id: result.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
