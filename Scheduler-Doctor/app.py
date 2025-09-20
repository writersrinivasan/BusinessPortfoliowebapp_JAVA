"""
Doctor Appointment Scheduler - Main Flask Application

A modern web application that allows patients to book appointments with doctors.
Features real-time slot availability, data persistence, and a responsive UI.

Author: Senior Full-Stack Python Developer
Date: September 2025
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from data_manager import data_manager
import os
from datetime import datetime

# Initialize Flask application
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['DEBUG'] = True

# Add logging for debugging
import logging
logging.basicConfig(level=logging.DEBUG)

# Error handlers
@app.errorhandler(403)
def forbidden_error(error):
    """Handle 403 Forbidden errors"""
    app.logger.error(f"403 Forbidden error: {request.url}")
    return render_template('error.html', 
                         error_code=403,
                         error_message="Forbidden - Access denied to this resource"), 403

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 Not Found errors"""
    app.logger.error(f"404 Not Found error: {request.url}")
    return render_template('error.html',
                         error_code=404,
                         error_message="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server errors"""
    app.logger.error(f"500 Internal error: {error}")
    return render_template('error.html',
                         error_code=500,
                         error_message="Internal server error"), 500

# Add CORS headers for AJAX requests
@app.after_request
def after_request(response):
    """Add headers to enable AJAX requests and handle 403 errors"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    
    # Handle preflight requests
    if request.method == 'OPTIONS':
        response.status_code = 200
    
    return response

# Handle OPTIONS requests for CORS preflight
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    """Handle OPTIONS requests for CORS preflight"""
    return '', 200

@app.route('/')
def index():
    """
    Homepage - Display list of available doctors
    """
    try:
        doctors = data_manager.get_all_doctors()
        return render_template('index.html', doctors=doctors)
    except Exception as e:
        flash(f'Error loading doctors: {str(e)}', 'error')
        return render_template('index.html', doctors=[])

@app.route('/booking/<int:doctor_id>')
@app.route('/book/<int:doctor_id>')
def booking_page(doctor_id):
    """
    Booking page - Display booking form for specific doctor
    
    Args:
        doctor_id (int): ID of the doctor to book with
    """
    try:
        doctor = data_manager.get_doctor_by_id(doctor_id)
        if not doctor:
            flash('Doctor not found', 'error')
            return redirect(url_for('index'))
        
        available_slots = data_manager.get_available_slots(doctor_id)
        return render_template('booking.html', doctor=doctor, available_slots=available_slots)
    
    except Exception as e:
        flash(f'Error loading booking page: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/api/available_slots/<int:doctor_id>')
def get_available_slots_api(doctor_id):
    """
    API endpoint to get available slots for a doctor (AJAX endpoint)
    
    Args:
        doctor_id (int): ID of the doctor
        
    Returns:
        JSON: List of available slots
    """
    try:
        # Validate doctor exists
        doctor = data_manager.get_doctor_by_id(doctor_id)
        if not doctor:
            return jsonify({
                'success': False,
                'error': f'Doctor with ID {doctor_id} not found',
                'slots': []
            }), 404
        
        slots = data_manager.get_available_slots(doctor_id)
        return jsonify({
            'success': True,
            'slots': slots,
            'count': len(slots),
            'doctor_name': doctor['name'],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        app.logger.error(f"Error getting slots for doctor {doctor_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'slots': []
        }), 500

@app.route('/book_appointment', methods=['POST'])
def book_appointment():
    """
    Handle appointment booking submission
    
    Processes form data and creates new appointment booking
    """
    try:
        # Get form data with validation
        doctor_id = request.form.get('doctor_id')
        slot = request.form.get('slot')
        patient_name = request.form.get('patient_name', '').strip()
        patient_phone = request.form.get('patient_phone', '').strip()
        patient_email = request.form.get('patient_email', '').strip()
        
        # Server-side validation
        errors = []
        
        if not doctor_id:
            errors.append('Doctor ID is required')
        else:
            try:
                doctor_id = int(doctor_id)
            except ValueError:
                errors.append('Invalid doctor ID')
        
        if not slot:
            errors.append('Time slot is required')
        
        if not patient_name:
            errors.append('Patient name is required')
        elif len(patient_name) < 2:
            errors.append('Patient name must be at least 2 characters')
        
        if not patient_phone:
            errors.append('Patient phone is required')
        elif len(patient_phone) < 10:
            errors.append('Please enter a valid phone number')
        
        # If there are validation errors, show them
        if errors:
            for error in errors:
                flash(error, 'error')
            return redirect(url_for('booking_page', doctor_id=doctor_id) if doctor_id else url_for('index'))
        
        # Verify doctor exists
        doctor = data_manager.get_doctor_by_id(doctor_id)
        if not doctor:
            flash('Selected doctor not found', 'error')
            return redirect(url_for('index'))
        
        # Attempt to book the appointment
        result = data_manager.book_appointment(
            doctor_id=doctor_id,
            slot=slot,
            patient_name=patient_name,
            patient_phone=patient_phone,
            patient_email=patient_email
        )
        
        if result['success']:
            # Store booking info in session for confirmation
            session['last_booking'] = {
                'booking_id': result.get('booking_id'),
                'doctor_name': doctor['name'],
                'slot': slot,
                'patient_name': patient_name,
                'timestamp': datetime.now().isoformat()
            }
            flash(result['message'], 'success')
            return redirect(url_for('booking_confirmation'))
        else:
            flash(result['message'], 'error')
            return redirect(url_for('booking_page', doctor_id=doctor_id))
    
    except Exception as e:
        app.logger.error(f"Booking error: {e}")
        flash(f'Booking failed due to system error. Please try again.', 'error')
        return redirect(url_for('index'))

@app.route('/confirmation')
def booking_confirmation():
    """
    Display booking confirmation page
    """
    booking_info = session.get('last_booking')
    if not booking_info:
        flash('No recent booking found', 'warning')
        return redirect(url_for('index'))
    
    return render_template('confirmation.html', booking=booking_info)

@app.route('/my_bookings', methods=['GET', 'POST'])
def my_bookings():
    """
    Display patient's bookings and handle cancellations
    """
    if request.method == 'POST':
        # Handle booking cancellation
        booking_id = request.form.get('booking_id')
        patient_phone = request.form.get('patient_phone')
        
        if booking_id and patient_phone:
            result = data_manager.cancel_appointment(booking_id, patient_phone)
            if result['success']:
                flash(result['message'], 'success')
            else:
                flash(result['message'], 'error')
        else:
            flash('Invalid cancellation request', 'error')
    
    # Get bookings for display
    patient_phone = request.form.get('patient_phone') or request.args.get('phone', '')
    bookings = []
    
    if patient_phone:
        bookings = data_manager.get_patient_bookings(patient_phone)
    
    return render_template('my_bookings.html', bookings=bookings, phone=patient_phone)

@app.route('/api/doctor_info/<int:doctor_id>')
def get_doctor_info_api(doctor_id):
    """
    API endpoint to get doctor information (AJAX endpoint)
    
    Args:
        doctor_id (int): ID of the doctor
        
    Returns:
        JSON: Doctor information with available slots
    """
    try:
        doctor = data_manager.get_doctor_by_id(doctor_id)
        if not doctor:
            return jsonify({
                'success': False,
                'error': 'Doctor not found'
            }), 404
        
        return jsonify({
            'success': True,
            'doctor': doctor,
            'available_slots': data_manager.get_available_slots(doctor_id)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/admin/stats')
def admin_stats():
    """
    Admin endpoint to view booking statistics
    """
    try:
        stats = data_manager.get_booking_stats()
        all_bookings = data_manager.get_all_bookings()
        doctors = data_manager.get_all_doctors()
        
        return render_template('admin_stats.html', 
                             stats=stats, 
                             bookings=all_bookings, 
                             doctors=doctors)
    except Exception as e:
        flash(f'Error loading admin stats: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/health')
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Doctor Appointment Scheduler is running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/test')
def test_page():
    """Simple test page to verify server is working"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Page - Doctor Scheduler</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #007bff; }
            .status { padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; color: #155724; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏥 Doctor Appointment Scheduler - Test Page</h1>
            <div class="status">
                ✅ Server is running successfully!
            </div>
            <p><strong>Server Time:</strong> ''' + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + '''</p>
            <p><a href="/">Go to Main Application</a></p>
        </div>
    </body>
    </html>
    '''

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    return render_template('error.html', 
                         error_code=404, 
                         error_message="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return render_template('error.html', 
                         error_code=500, 
                         error_message="Internal server error"), 500

@app.context_processor
def inject_global_vars():
    """Inject global variables into all templates"""
    return {
        'current_year': datetime.now().year,
        'app_name': 'Doctor Appointment Scheduler'
    }

@app.route('/api/booking_test', methods=['POST'])
def booking_test_api():
    """Test endpoint for AJAX booking validation"""
    try:
        data = request.get_json() or {}
        doctor_id = data.get('doctor_id')
        slot = data.get('slot')
        
        if not doctor_id or not slot:
            return jsonify({
                'success': False,
                'error': 'Doctor ID and slot are required'
            }), 400
        
        # Check if slot is still available
        available_slots = data_manager.get_available_slots(int(doctor_id))
        
        return jsonify({
            'success': True,
            'slot_available': slot in available_slots,
            'available_slots': available_slots
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/clear_session', methods=['POST'])
def clear_session_api():
    """Clear session data (called from confirmation page)"""
    try:
        if 'last_booking' in session:
            del session['last_booking']
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    # Test data manager before starting
    try:
        from data_manager import data_manager
        doctors = data_manager.get_all_doctors()
        print(f"✅ Data manager working - found {len(doctors)} doctors")
    except Exception as e:
        print(f"❌ Data manager error: {e}")
        exit(1)
    
    # Run the application
    print("="*50)
    print("🏥 Doctor Appointment Scheduler")
    print("="*50)
    print("Starting Flask application...")
    print("Available endpoints:")
    print("  🏠 Homepage: http://localhost:8000")
    print("  📅 Booking: http://localhost:8000/booking/<doctor_id>")
    print("  📋 My Bookings: http://localhost:8000/my_bookings")
    print("  📊 Admin Stats: http://localhost:8000/admin/stats")
    print("  🔧 Test Page: http://localhost:8000/test")
    print("  ❤️  Health Check: http://localhost:8000/health")
    print("  ✅ Health Check: http://localhost:5000/health")
    print("  🧪 Test Page: http://localhost:5000/test")
    print("="*50)
    print("🔧 Server Configuration:")
    print("  • Host: 127.0.0.1 (localhost only)")
    print("  • Port: 8000 (avoiding conflicts)")
    print("  • Debug: True")
    print("  • Threaded: True")
    print("="*50)
    
    # Function to find available port
    def find_available_port(start_port=8000):
        import socket
        for port in range(start_port, start_port + 20):
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                sock.bind(('127.0.0.1', port))
                sock.close()
                return port
            except OSError:
                continue
        return None
    
    # Find an available port
    available_port = find_available_port(8000)
    
    if available_port is None:
        print("❌ Could not find any available port between 8000-8019")
        print("💡 Please close other applications and try again")
        print("💡 Or use: python auto_start.py (recommended)")
        exit(1)
    
    print(f"✅ Using port {available_port}")
    print(f"🌐 Open browser to: http://localhost:{available_port}")
    
    try:
        app.run(
            debug=True, 
            host='127.0.0.1', 
            port=available_port, 
            threaded=True,
            use_reloader=False  # Disable reloader to prevent port conflicts
        )
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("💡 Try running: python auto_start.py")
        exit(1)
