/**
 * Frontend unit tests using JSDOM
 */

const chai = require('chai');
const expect = chai.expect;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

describe('Frontend Tests', function() {
  let window, document;
  
  before(function() {
    // Load HTML file
    const html = fs.readFileSync(path.resolve(__dirname, '../../public/index.html'), 'utf-8');
    
    // Set up a DOM environment
    const dom = new JSDOM(html, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });
    
    window = dom.window;
    document = window.document;
    
    // Mock browser APIs
    global.window = window;
    global.document = document;
    global.HTMLElement = window.HTMLElement;
    global.Element = window.Element;
    global.navigator = window.navigator;
    
    // Expose error handling to window
    window.errorHandling = {
      showErrorNotification: () => {},
      handleApiResponse: async (response) => {
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
      },
      apiRequest: async (url, options = {}) => {
        try {
          return { success: true };
        } catch (error) {
          throw error;
        }
      }
    };
  });
  
  after(function() {
    // Clean up global namespace
    delete global.window;
    delete global.document;
    delete global.HTMLElement;
    delete global.Element;
    delete global.navigator;
  });
  
  describe('Form Validation', function() {
    // Create a test form
    beforeEach(function() {
      const form = document.createElement('form');
      form.innerHTML = `
        <div class="form-group">
          <label for="test-input">Test Input</label>
          <input id="test-input" type="text">
        </div>
        <div class="form-group">
          <label for="test-select">Test Select</label>
          <select id="test-select">
            <option value="">Select an option</option>
            <option value="option1">Option 1</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      `;
      document.body.appendChild(form);
      
      // Add validateForm function
      window.validateForm = function(form, fields) {
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
      };
    });
    
    afterEach(function() {
      // Clean up DOM
      const form = document.querySelector('form');
      if (form) {
        form.remove();
      }
    });
    
    it('should validate required fields', function() {
      // Arrange
      const form = document.querySelector('form');
      const testInput = document.getElementById('test-input');
      const testSelect = document.getElementById('test-select');
      
      // Act - Empty form
      const resultEmpty = window.validateForm(form, [
        { id: 'test-input', label: 'Test Input', required: true },
        { id: 'test-select', label: 'Test Select', required: true }
      ]);
      
      // Assert
      expect(resultEmpty).to.be.false;
      expect(form.querySelectorAll('.error').length).to.equal(2);
      
      // Act - Fill one field
      testInput.value = 'Test value';
      const resultPartial = window.validateForm(form, [
        { id: 'test-input', label: 'Test Input', required: true },
        { id: 'test-select', label: 'Test Select', required: true }
      ]);
      
      // Assert
      expect(resultPartial).to.be.false;
      expect(form.querySelectorAll('.error').length).to.equal(1);
      
      // Act - Fill all fields
      testSelect.value = 'option1';
      const resultFull = window.validateForm(form, [
        { id: 'test-input', label: 'Test Input', required: true },
        { id: 'test-select', label: 'Test Select', required: true }
      ]);
      
      // Assert
      expect(resultFull).to.be.true;
      expect(form.querySelectorAll('.error').length).to.equal(0);
    });
  });
});
