/**
 * Error handling utilities for client-side code
 */

// Display an error notification to the user
function showErrorNotification(message) {
  // Create error notification element
  const errorNotification = document.createElement('div');
  errorNotification.className = 'error-notification';
  errorNotification.innerHTML = `
    <div class="error-icon">❌</div>
    <div class="error-message">${message}</div>
    <button class="error-close">×</button>
  `;
  
  // Add to DOM
  document.body.appendChild(errorNotification);
  
  // Add close button functionality
  const closeButton = errorNotification.querySelector('.error-close');
  closeButton.addEventListener('click', () => {
    errorNotification.remove();
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(errorNotification)) {
      errorNotification.remove();
    }
  }, 5000);
}

// Handle API responses and errors consistently
async function handleApiResponse(response) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (err) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  return await response.json();
}

// Make API requests with consistent error handling
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return await handleApiResponse(response);
  } catch (error) {
    showErrorNotification(error.message || 'An unexpected error occurred');
    throw error;
  }
}

// Export utilities
window.errorHandling = {
  showErrorNotification,
  handleApiResponse,
  apiRequest
};
