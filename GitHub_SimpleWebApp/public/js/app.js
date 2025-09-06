// DOM Elements
const tabs = document.querySelectorAll('.tabs a');
const tabContents = document.querySelectorAll('.tab-content');

// Form Elements
const recipeForm = document.getElementById('recipe-form');
const habitForm = document.getElementById('habit-form');
const blogForm = document.getElementById('blog-form');

// List Containers
const recipeList = document.getElementById('recipe-list');
const habitList = document.getElementById('habit-list');
const blogList = document.getElementById('blog-list');

// Cancel Edit Buttons
const cancelEditRecipe = document.getElementById('cancel-edit-recipe');
const cancelEditBlog = document.getElementById('cancel-edit-blog');

// API URL
const API_URL = 'http://localhost:3000/api';

// Tab Switching
tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active class from all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    const target = tab.getAttribute('data-tab');
    tab.classList.add('active');
    document.getElementById(target).classList.add('active');
    
    // Load data for the selected tab if it's not already loaded
    if (target === 'recipes' && recipeList.children.length === 0) {
      loadRecipes();
    } else if (target === 'habits' && habitList.children.length === 0) {
      loadHabits();
    } else if (target === 'blog' && blogList.children.length === 0) {
      loadBlogPosts();
    }
  });
});

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Get Today's Date in YYYY-MM-DD format
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// ---------- RECIPES ----------

// Load Recipes
async function loadRecipes() {
  // Show loading state
  recipeList.innerHTML = '<p>Loading recipes...</p>';
  
  try {
    const recipes = await safeFetch(`${API_URL}/recipes`);
    
    recipeList.innerHTML = '';
    
    if (!recipes) {
      // safeFetch returned null, indicating an error
      recipeList.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
      return;
    }
    
    if (recipes.length === 0) {
      recipeList.innerHTML = '<p>No recipes yet. Add your first one above!</p>';
      return;
    }
    
    recipes.forEach(recipe => {
      const recipeElement = document.createElement('div');
      recipeElement.className = 'list-item';
      recipeElement.innerHTML = `
        <h4>${recipe.title}</h4>
        <div class="meta">Category: ${recipe.category}</div>
        <p>${recipe.instructions}</p>
        <div class="meta">Added: ${formatDate(recipe.created_at)}</div>
        <div class="actions">
          <button class="edit" data-id="${recipe.id}">Edit</button>
          <button class="delete" data-id="${recipe.id}">Delete</button>
        </div>
      `;
      
      // Add event listeners for edit and delete buttons
      recipeElement.querySelector('.edit').addEventListener('click', () => editRecipe(recipe));
      recipeElement.querySelector('.delete').addEventListener('click', () => deleteRecipe(recipe.id));
      
      recipeList.appendChild(recipeElement);
    });
  } catch (error) {
    console.error('Error loading recipes:', error);
    recipeList.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
    window.errorHandling.showErrorNotification('Failed to load recipes');
  }
}

// Create or Update Recipe
async function saveRecipe(e) {
  e.preventDefault();
  
  // Validate form fields
  const isValid = validateForm(recipeForm, [
    { id: 'recipe-title', label: 'Title', required: true },
    { id: 'recipe-category', label: 'Category', required: true },
    { id: 'recipe-instructions', label: 'Instructions', required: true }
  ]);
  
  if (!isValid) {
    return;
  }
  
  const recipeId = document.getElementById('recipe-id').value;
  const title = document.getElementById('recipe-title').value.trim();
  const category = document.getElementById('recipe-category').value;
  const instructions = document.getElementById('recipe-instructions').value.trim();
  
  const recipeData = {
    title,
    category,
    instructions
  };
  
  // Disable the form while submitting
  const submitButton = recipeForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.innerHTML = `${originalButtonText} <span class="loading-indicator"></span>`;
  
  try {
    let url = `${API_URL}/recipes`;
    let method = 'POST';
    
    if (recipeId) {
      url += `/${recipeId}`;
      method = 'PUT';
    }
    
    const result = await safeFetch(url, {
      method,
      body: JSON.stringify(recipeData)
    });
    
    if (result) {
      resetRecipeForm();
      loadRecipes();
    }
  } catch (error) {
    console.error('Error saving recipe:', error);
    // Error notification handled by safeFetch/apiRequest
  } finally {
    // Re-enable the form
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

// Edit Recipe
function editRecipe(recipe) {
  document.getElementById('recipe-id').value = recipe.id;
  document.getElementById('recipe-title').value = recipe.title;
  document.getElementById('recipe-category').value = recipe.category;
  document.getElementById('recipe-instructions').value = recipe.instructions;
  
  document.getElementById('cancel-edit-recipe').style.display = 'inline-block';
  recipeForm.querySelector('button[type="submit"]').textContent = 'Update Recipe';
  
  // Scroll to the form
  recipeForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete Recipe
async function deleteRecipe(id) {
  if (!confirm('Are you sure you want to delete this recipe?')) {
    return;
  }
  
  // Show deletion in progress
  const recipeElement = document.querySelector(`.list-item button.delete[data-id="${id}"]`).closest('.list-item');
  recipeElement.style.opacity = '0.5';
  
  try {
    const result = await safeFetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE'
    });
    
    if (result) {
      // If successful, reload the recipes
      loadRecipes();
    } else {
      // If error, restore the opacity
      recipeElement.style.opacity = '1';
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    recipeElement.style.opacity = '1';
  }
}

// Reset Recipe Form
function resetRecipeForm() {
  document.getElementById('recipe-id').value = '';
  document.getElementById('recipe-title').value = '';
  document.getElementById('recipe-category').value = '';
  document.getElementById('recipe-instructions').value = '';
  
  document.getElementById('cancel-edit-recipe').style.display = 'none';
  recipeForm.querySelector('button[type="submit"]').textContent = 'Save Recipe';
}

// ---------- HABITS ----------

// Load Habits
async function loadHabits() {
  try {
    const response = await fetch(`${API_URL}/habits`);
    const habits = await response.json();
    
    habitList.innerHTML = '';
    
    if (habits.length === 0) {
      habitList.innerHTML = '<p>No habits yet. Add your first one above!</p>';
      return;
    }
    
    habits.forEach(habit => {
      const habitElement = document.createElement('div');
      habitElement.className = 'list-item habit-item';
      
      const isCheckedToday = habit.completed_today === 1;
      
      habitElement.innerHTML = `
        <div class="habit-info">
          <h4>
            ${habit.title}
            ${habit.current_streak > 0 ? `<span class="streak">${habit.current_streak} day streak</span>` : ''}
          </h4>
          <div class="meta">Started: ${formatDate(habit.created_at)}</div>
        </div>
        <div class="habit-actions">
          <label class="habit-check">
            <input type="checkbox" data-id="${habit.id}" ${isCheckedToday ? 'checked' : ''}>
            Today
          </label>
          <button class="delete" data-id="${habit.id}">Delete</button>
        </div>
      `;
      
      // Add event listeners for checkbox and delete button
      habitElement.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        toggleHabitCompletion(habit.id, e.target.checked);
      });
      
      habitElement.querySelector('.delete').addEventListener('click', () => deleteHabit(habit.id));
      
      habitList.appendChild(habitElement);
    });
  } catch (error) {
    console.error('Error loading habits:', error);
    habitList.innerHTML = '<p>Error loading habits. Please try again.</p>';
  }
}

// Create Habit
async function createHabit(e) {
  e.preventDefault();
  
  const title = document.getElementById('habit-title').value;
  
  try {
    const response = await fetch(`${API_URL}/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create habit');
    }
    
    document.getElementById('habit-title').value = '';
    loadHabits();
  } catch (error) {
    console.error('Error creating habit:', error);
    alert('Error creating habit. Please try again.');
  }
}

// Toggle Habit Completion
async function toggleHabitCompletion(habitId, completed) {
  try {
    const response = await fetch(`${API_URL}/habits/${habitId}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: getTodayString() })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update habit');
    }
    
    // Reload habits to update streaks
    loadHabits();
  } catch (error) {
    console.error('Error updating habit:', error);
    alert('Error updating habit. Please try again.');
  }
}

// Delete Habit
async function deleteHabit(id) {
  if (!confirm('Are you sure you want to delete this habit?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/habits/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete habit');
    }
    
    loadHabits();
  } catch (error) {
    console.error('Error deleting habit:', error);
    alert('Error deleting habit. Please try again.');
  }
}

// ---------- BLOG POSTS ----------

// Load Blog Posts
async function loadBlogPosts() {
  try {
    const response = await fetch(`${API_URL}/blog`);
    const posts = await response.json();
    
    blogList.innerHTML = '';
    
    if (posts.length === 0) {
      blogList.innerHTML = '<p>No blog posts yet. Write your first one above!</p>';
      return;
    }
    
    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'list-item';
      postElement.innerHTML = `
        <h4>${post.title}</h4>
        <div class="blog-date">Published: ${formatDate(post.created_at)}</div>
        <div class="blog-content">${post.body}</div>
        <div class="actions">
          <button class="edit" data-id="${post.id}">Edit</button>
          <button class="delete" data-id="${post.id}">Delete</button>
        </div>
      `;
      
      // Add event listeners for edit and delete buttons
      postElement.querySelector('.edit').addEventListener('click', () => editBlogPost(post));
      postElement.querySelector('.delete').addEventListener('click', () => deleteBlogPost(post.id));
      
      blogList.appendChild(postElement);
    });
  } catch (error) {
    console.error('Error loading blog posts:', error);
    blogList.innerHTML = '<p>Error loading blog posts. Please try again.</p>';
  }
}

// Create or Update Blog Post
async function saveBlogPost(e) {
  e.preventDefault();
  
  const postId = document.getElementById('blog-id').value;
  const title = document.getElementById('blog-title').value;
  const body = document.getElementById('blog-body').value;
  
  const postData = {
    title,
    body
  };
  
  try {
    let url = `${API_URL}/blog`;
    let method = 'POST';
    
    if (postId) {
      url += `/${postId}`;
      method = 'PUT';
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save blog post');
    }
    
    resetBlogForm();
    loadBlogPosts();
  } catch (error) {
    console.error('Error saving blog post:', error);
    alert('Error saving blog post. Please try again.');
  }
}

// Edit Blog Post
function editBlogPost(post) {
  document.getElementById('blog-id').value = post.id;
  document.getElementById('blog-title').value = post.title;
  document.getElementById('blog-body').value = post.body;
  
  document.getElementById('cancel-edit-blog').style.display = 'inline-block';
  blogForm.querySelector('button[type="submit"]').textContent = 'Update Post';
  
  // Scroll to the form
  blogForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete Blog Post
async function deleteBlogPost(id) {
  if (!confirm('Are you sure you want to delete this blog post?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/blog/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete blog post');
    }
    
    loadBlogPosts();
  } catch (error) {
    console.error('Error deleting blog post:', error);
    alert('Error deleting blog post. Please try again.');
  }
}

// Reset Blog Form
function resetBlogForm() {
  document.getElementById('blog-id').value = '';
  document.getElementById('blog-title').value = '';
  document.getElementById('blog-body').value = '';
  
  document.getElementById('cancel-edit-blog').style.display = 'none';
  blogForm.querySelector('button[type="submit"]').textContent = 'Publish Post';
}

// ---------- EVENT LISTENERS ----------

// Form submissions
recipeForm.addEventListener('submit', saveRecipe);
habitForm.addEventListener('submit', createHabit);
blogForm.addEventListener('submit', saveBlogPost);

// Cancel edit buttons
cancelEditRecipe.addEventListener('click', resetRecipeForm);
cancelEditBlog.addEventListener('click', resetBlogForm);

// ---------- ERROR HANDLING & VALIDATION ----------

// Form validation
function validateForm(form, fields) {
  let isValid = true;
  
  // Clear previous errors
  form.querySelectorAll('.form-group').forEach(group => {
    group.classList.remove('error');
    const errorText = group.querySelector('.error-text');
    if (errorText) {
      errorText.remove();
    }
  });
  
  // Check each field
  fields.forEach(field => {
    const input = document.getElementById(field.id);
    const formGroup = input.closest('.form-group');
    
    if (field.required && !input.value.trim()) {
      isValid = false;
      formGroup.classList.add('error');
      
      // Add error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-text';
      errorMessage.textContent = `${field.label} is required`;
      formGroup.appendChild(errorMessage);
    }
  });
  
  return isValid;
}

// Network status monitoring
function setupNetworkStatusMonitoring() {
  const statusElement = document.getElementById('network-status');
  
  function updateOnlineStatus() {
    if (navigator.onLine) {
      statusElement.className = 'network-status online';
      statusElement.textContent = 'You are online';
      setTimeout(() => {
        statusElement.style.display = 'none';
      }, 3000);
    } else {
      statusElement.style.display = 'block';
      statusElement.className = 'network-status offline';
      statusElement.textContent = 'You are offline. Changes will sync when you reconnect.';
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial status check
  updateOnlineStatus();
}

// Generic error handler for fetch operations
async function safeFetch(url, options = {}) {
  try {
    return await window.errorHandling.apiRequest(url, options);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    // Return null to indicate error, handled by the caller
    return null;
  }
}

// ---------- INITIALIZATION ----------

// Load recipes on initial page load
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
  setupNetworkStatusMonitoring();
});
