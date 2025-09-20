/**
 * Doctor Appointment Scheduler - Main JavaScript
 * Handles frontend interactions, AJAX calls, and UI enhancements
 */

// Global configuration
const AppConfig = {
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    NOTIFICATION_TIMEOUT: 5000,   // 5 seconds
    API_ENDPOINTS: {
        availableSlots: '/api/available_slots/',
        doctorInfo: '/api/doctor_info/',
        bookingTest: '/api/booking_test',
        clearSession: '/api/clear_session'
    },
    // Get base URL dynamically
    getBaseUrl: function() {
        return window.location.origin;
    }
};

// Notification system
class NotificationManager {
    static show(message, type = 'info', timeout = AppConfig.NOTIFICATION_TIMEOUT) {
        const alertTypes = {
            'success': { class: 'alert-success', icon: 'bi-check-circle' },
            'error': { class: 'alert-danger', icon: 'bi-exclamation-triangle' },
            'warning': { class: 'alert-warning', icon: 'bi-exclamation-triangle' },
            'info': { class: 'alert-info', icon: 'bi-info-circle' }
        };

        const alertConfig = alertTypes[type] || alertTypes.info;
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertConfig.class} alert-dismissible fade show slide-in`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            <i class="bi ${alertConfig.icon}"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Find container and insert notification
        const container = document.querySelector('main.container') || document.querySelector('.container');
        if (container) {
            const firstChild = container.firstElementChild;
            if (firstChild) {
                container.insertBefore(alertDiv, firstChild);
            } else {
                container.appendChild(alertDiv);
            }
        }

        // Auto-dismiss after timeout
        if (timeout > 0) {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.classList.remove('show');
                    setTimeout(() => {
                        if (alertDiv.parentNode) {
                            alertDiv.remove();
                        }
                    }, 150);
                }
            }, timeout);
        }

        return alertDiv;
    }

    static clear() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 150);
        });
    }
}

// API service for making requests
class ApiService {
    static async get(url) {
        try {
            const fullUrl = url.startsWith('http') ? url : AppConfig.getBaseUrl() + url;
            console.log('Making GET request to:', fullUrl);
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('GET response:', data);
            return data;
        } catch (error) {
            console.error('API GET error:', error);
            throw error;
        }
    }

    static async post(url, data) {
        try {
            const fullUrl = url.startsWith('http') ? url : AppConfig.getBaseUrl() + url;
            console.log('Making POST request to:', fullUrl, 'with data:', data);
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('POST response:', result);
            return result;
        } catch (error) {
            console.error('API POST error:', error);
            throw error;
        }
    }
}

// Doctor slot management
class SlotManager {
    static async refreshDoctorSlots(doctorId) {
        try {
            console.log(`Refreshing slots for doctor ${doctorId}`);
            const data = await ApiService.get(`${AppConfig.API_ENDPOINTS.availableSlots}${doctorId}`);
            
            if (data.success) {
                console.log(`Got ${data.slots.length} slots for doctor ${doctorId}`);
                this.updateDoctorSlotsDisplay(doctorId, data.slots);
                return data.slots;
            } else {
                console.error('Slot refresh failed:', data.error);
                throw new Error(data.error || 'Failed to fetch slots');
            }
        } catch (error) {
            console.error('Error refreshing slots:', error);
            NotificationManager.show(`Failed to refresh slots: ${error.message}`, 'error');
            return null;
        }
    }

    static updateDoctorSlotsDisplay(doctorId, slots) {
        // Update slot count badge
        const slotCountElement = document.getElementById(`slot-count-${doctorId}`);
        if (slotCountElement) {
            slotCountElement.textContent = slots.length;
            slotCountElement.className = slots.length > 0 ? 'badge bg-success ms-2' : 'badge bg-danger ms-2';
        }

        // Update slots preview
        const slotsPreviewElement = document.getElementById(`slots-preview-${doctorId}`);
        if (slotsPreviewElement) {
            this.renderSlotsPreview(slotsPreviewElement, slots);
        }

        // Update booking page slots if we're on that page
        this.updateBookingPageSlots(slots);
    }

    static renderSlotsPreview(element, slots, maxPreview = 3) {
        let html = '';
        
        if (slots.length === 0) {
            html = '<span class="text-danger small"><i class="bi bi-x-circle"></i> No slots available</span>';
        } else {
            // Show first few slots
            for (let i = 0; i < Math.min(slots.length, maxPreview); i++) {
                html += `<span class="badge bg-light text-dark me-1">${slots[i]}</span>`;
            }
            
            // Show remaining count
            if (slots.length > maxPreview) {
                html += `<span class="text-muted small">+${slots.length - maxPreview} more</span>`;
            }
        }
        
        element.innerHTML = html;
    }

    static updateBookingPageSlots(slots) {
        const slotsGrid = document.getElementById('slots-grid');
        const submitBtn = document.getElementById('submit-btn');
        const availableCount = document.getElementById('available-count');

        if (!slotsGrid) return; // Not on booking page

        // Update available count
        if (availableCount) {
            availableCount.textContent = slots.length;
            availableCount.className = slots.length > 0 ? 'badge bg-success ms-1' : 'badge bg-danger ms-1';
        }

        // Update slots grid
        if (slots.length === 0) {
            slotsGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle"></i>
                        <strong>No slots available</strong> - This doctor currently has no available appointment slots.
                    </div>
                </div>
            `;
            
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
        } else {
            this.renderBookingSlots(slotsGrid, slots);
            
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
            }
        }
    }

    static renderBookingSlots(container, slots) {
        let html = '';
        
        slots.forEach((slot, index) => {
            html += `
                <div class="col-md-4 col-sm-6 mb-2">
                    <div class="form-check">
                        <input class="form-check-input slot-radio" 
                               type="radio" 
                               name="slot" 
                               value="${slot}" 
                               id="slot-${index + 1}"
                               required>
                        <label class="form-check-label slot-label" for="slot-${index + 1}">
                            <i class="bi bi-clock"></i> ${slot}
                        </label>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;

        // Re-attach event listeners
        this.attachSlotEventListeners();
    }

    static attachSlotEventListeners() {
        const slotRadios = document.querySelectorAll('.slot-radio');
        slotRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                // Clear any previous slot selection errors
                FormValidator.clearSlotError();
                
                // Update visual selection
                SlotManager.updateSlotSelection(this.value);
            });
        });
    }

    static updateSlotSelection(selectedSlot) {
        // Remove previous selection styling
        const labels = document.querySelectorAll('.slot-label');
        labels.forEach(label => {
            label.classList.remove('selected-slot');
        });

        // Add selection styling to current slot
        const selectedInput = document.querySelector(`input[value="${selectedSlot}"]`);
        if (selectedInput) {
            const label = selectedInput.nextElementSibling;
            if (label) {
                label.classList.add('selected-slot');
            }
        }
    }
}

// Form validation utilities
class FormValidator {
    static validateBookingForm(form) {
        let isValid = true;
        
        // Validate required text fields
        const requiredFields = ['patient_name', 'patient_phone'];
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`#${fieldName}`);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate slot selection
        const selectedSlot = form.querySelector('input[name="slot"]:checked');
        if (!selectedSlot) {
            this.showSlotError();
            isValid = false;
        }

        return isValid;
    }

    static validateField(field) {
        const value = field.value.trim();
        
        // Clear previous error state
        field.classList.remove('is-invalid', 'is-valid');

        // Check required fields
        if (field.hasAttribute('required') && !value) {
            field.classList.add('is-invalid');
            return false;
        }

        // Validate phone number
        if (field.type === 'tel' && value) {
            const phonePattern = /^[\d\-\(\)\+\s]+$/;
            if (!phonePattern.test(value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }

        // Validate email
        if (field.type === 'email' && value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }

        if (value) {
            field.classList.add('is-valid');
        }
        return true;
    }

    static showSlotError() {
        const errorElement = document.getElementById('slot-error');
        if (errorElement) {
            errorElement.style.display = 'block';
        }
    }

    static clearSlotError() {
        const errorElement = document.getElementById('slot-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    static clearFieldError(field) {
        field.classList.remove('is-invalid');
    }
}

// Loading state management
class LoadingManager {
    static setButtonLoading(button, loadingText = 'Loading...') {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.innerHTML;
        }
        
        button.innerHTML = `<i class="bi bi-hourglass-split"></i> ${loadingText}`;
        button.disabled = true;
        button.classList.add('loading');
    }

    static clearButtonLoading(button) {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
        
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🏥 Doctor Appointment Scheduler initialized');

    // Initialize form validation
    initializeFormValidation();

    // Initialize slot management
    initializeSlotManagement();

    // Initialize auto-refresh
    initializeAutoRefresh();

    // Initialize UI enhancements
    initializeUIEnhancements();

    // Add fade-in animation to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }
}

function initializeFormValidation() {
    const bookingForm = document.getElementById('booking-form');
    
    if (bookingForm) {
        // Form submission handling
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (FormValidator.validateBookingForm(this)) {
                const submitBtn = document.getElementById('submit-btn');
                if (submitBtn) {
                    LoadingManager.setButtonLoading(submitBtn, 'Booking...');
                }
                this.submit();
            }
        });

        // Real-time field validation
        const formInputs = bookingForm.querySelectorAll('input[required]');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                FormValidator.validateField(this);
            });

            input.addEventListener('input', function() {
                FormValidator.clearFieldError(this);
            });
        });
    }
}

function initializeSlotManagement() {
    // Attach event listeners to initial slot radios
    SlotManager.attachSlotEventListeners();

    // Global refresh function for slots
    window.refreshSlots = function() {
        const doctorIdElement = document.querySelector('input[name="doctor_id"]');
        if (!doctorIdElement) return;

        const doctorId = parseInt(doctorIdElement.value);
        const refreshBtn = document.getElementById('refresh-btn');

        if (refreshBtn) {
            LoadingManager.setButtonLoading(refreshBtn, 'Refreshing...');
        }

        SlotManager.refreshDoctorSlots(doctorId)
            .then(slots => {
                if (slots) {
                    NotificationManager.show(
                        `Refreshed! ${slots.length} slots available`, 
                        'success'
                    );
                }
            })
            .finally(() => {
                if (refreshBtn) {
                    LoadingManager.clearButtonLoading(refreshBtn);
                }
            });
    };

    // Global refresh function for homepage
    window.refreshAvailability = function() {
        const doctorCards = document.querySelectorAll('.doctor-card');
        let refreshPromises = [];

        doctorCards.forEach(card => {
            const bookButton = card.querySelector('.btn-book-appointment');
            if (bookButton) {
                const doctorId = parseInt(bookButton.dataset.doctorId);
                if (doctorId) {
                    refreshPromises.push(SlotManager.refreshDoctorSlots(doctorId));
                }
            }
        });

        Promise.all(refreshPromises)
            .then(() => {
                NotificationManager.show('Availability refreshed!', 'success');
            })
            .catch(() => {
                NotificationManager.show('Some slots could not be refreshed', 'warning');
            });
    };
}

function initializeAutoRefresh() {
    // Auto-refresh on homepage
    if (document.querySelector('.doctor-card')) {
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                window.refreshAvailability();
            }
        }, AppConfig.AUTO_REFRESH_INTERVAL);
    }

    // Auto-refresh on booking page
    if (document.getElementById('booking-form')) {
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                window.refreshSlots();
            }
        }, AppConfig.AUTO_REFRESH_INTERVAL);
    }
}

function initializeUIEnhancements() {
    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Allow only numbers and common phone formatting characters
            this.value = this.value.replace(/[^\d\-\(\)\+\s]/g, '');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Enhanced button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });

        button.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0)';
            }
        });
    });

    // Tooltip initialization if Bootstrap tooltips are used
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (window.bootstrap && bootstrap.Tooltip) {
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Utility functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export global functions for template usage
window.NotificationManager = NotificationManager;
window.SlotManager = SlotManager;
window.FormValidator = FormValidator;
window.LoadingManager = LoadingManager;

// Console welcome message
console.log(`
🏥 Doctor Appointment Scheduler
Frontend JavaScript Loaded Successfully

Available Global Functions:
- refreshSlots()
- refreshAvailability()
- NotificationManager.show(message, type)
- SlotManager.refreshDoctorSlots(doctorId)

Happy coding! 🚀
`);
