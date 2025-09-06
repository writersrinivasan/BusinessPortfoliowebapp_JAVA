const { getAllQuery, getQuery, runQuery } = require('./db-setup');
const { ApiError } = require('../middleware/errorHandler');

const Recipe = {
  getAll: async () => {
    try {
      return await getAllQuery('SELECT * FROM recipes ORDER BY created_at DESC');
    } catch (error) {
      throw new ApiError(500, 'Failed to retrieve recipes', error.message);
    }
  },

  getById: async (id) => {
    try {
      if (!id || isNaN(id)) {
        throw new ApiError(400, 'Invalid recipe ID provided');
      }
      
      const recipe = await getQuery('SELECT * FROM recipes WHERE id = ?', [id]);
      if (!recipe) {
        throw new ApiError(404, `Recipe with ID ${id} not found`);
      }
      
      return recipe;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to retrieve recipe', error.message);
    }
  },

  create: async (recipe) => {
    try {
      if (!recipe || !recipe.title || !recipe.category || !recipe.instructions) {
        throw new ApiError(400, 'Missing required recipe fields');
      }
      
      const result = await runQuery(
        'INSERT INTO recipes (title, category, instructions) VALUES (?, ?, ?)',
        [recipe.title, recipe.category, recipe.instructions]
      );
      
      return { id: result.id, ...recipe };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to create recipe', error.message);
    }
  },

  update: async (id, recipe) => {
    try {
      if (!id || isNaN(id)) {
        throw new ApiError(400, 'Invalid recipe ID provided');
      }
      
      if (!recipe || !recipe.title || !recipe.category || !recipe.instructions) {
        throw new ApiError(400, 'Missing required recipe fields');
      }
      
      // Check if the recipe exists first
      const existingRecipe = await getQuery('SELECT id FROM recipes WHERE id = ?', [id]);
      if (!existingRecipe) {
        throw new ApiError(404, `Recipe with ID ${id} not found`);
      }
      
      await runQuery(
        'UPDATE recipes SET title = ?, category = ?, instructions = ? WHERE id = ?',
        [recipe.title, recipe.category, recipe.instructions, id]
      );
      
      return { id: parseInt(id), ...recipe };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update recipe', error.message);
    }
  },

  delete: async (id) => {
    try {
      if (!id || isNaN(id)) {
        throw new ApiError(400, 'Invalid recipe ID provided');
      }
      
      const result = await runQuery('DELETE FROM recipes WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new ApiError(404, `Recipe with ID ${id} not found`);
      }
      
      return { deleted: true, id };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to delete recipe', error.message);
    }
  }
};

module.exports = Recipe;
