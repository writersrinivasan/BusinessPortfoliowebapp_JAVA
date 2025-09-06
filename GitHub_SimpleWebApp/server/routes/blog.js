const express = require('express');
const BlogPost = require('../models/blog');

const router = express.Router();

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.getAll();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single blog post
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.getById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new blog post
router.post('/', async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    
    const newPost = await BlogPost.create({ title, body });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a blog post
router.put('/:id', async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    
    const updatedPost = await BlogPost.update(req.params.id, { title, body });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a blog post
router.delete('/:id', async (req, res) => {
  try {
    const result = await BlogPost.delete(req.params.id);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
