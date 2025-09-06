const express = require('express');
const Habit = require('../models/habit');

const router = express.Router();

// Get all habits with completion data
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.getAll();
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new habit
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newHabit = await Habit.create({ title });
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle habit completion for a specific date
router.post('/:id/toggle', async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const result = await Habit.toggleCompletion(req.params.id, date);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const result = await Habit.delete(req.params.id);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
