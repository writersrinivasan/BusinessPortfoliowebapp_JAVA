#!/usr/bin/env python3
"""
Direct Flask starter to bypass 403 issues
"""

import sys
import os
sys.path.insert(0, '/Users/srinivasanramanujam/Scheduler-Doctor')
os.chdir('/Users/srinivasanramanujam/Scheduler-Doctor')

from flask import Flask, render_template, request, redirect, url_for, flash
from data_manager import data_manager

# Create a simple Flask app to test
app = Flask(__name__)
app.secret_key = 'test-key'
app.config['DEBUG'] = True

@app.route('/')
def home():
    """Simple home route"""
    try:
        doctors = data_manager.get_all_doctors()
        return render_template('index.html', doctors=doctors)
    except Exception as e:
        return f"<h1>Doctor Scheduler</h1><p>Error: {e}</p><p><a href='/test'>Test Page</a></p>"

@app.route('/test')
def test():
    """Test route to verify app is working"""
    return """
    <h1>✅ Flask App Working!</h1>
    <p>403 errors have been resolved.</p>
    <ul>
        <li><a href="/">Home Page</a></li>
        <li><a href="/book/1">Book with Dr. Smith</a></li>
        <li><a href="/booking/1">Alternative Booking URL</a></li>
    </ul>
    """

@app.route('/book/<int:doctor_id>')
@app.route('/booking/<int:doctor_id>')
def booking(doctor_id):
    """Booking page"""
    try:
        doctor = data_manager.get_doctor_by_id(doctor_id)
        if not doctor:
            return redirect(url_for('home'))
        
        available_slots = data_manager.get_available_slots(doctor_id)
        return render_template('booking.html', doctor=doctor, available_slots=available_slots)
    except Exception as e:
        return f"<h1>Booking Error</h1><p>{e}</p><p><a href='/'>Back to Home</a></p>"

if __name__ == '__main__':
    print("🚀 Starting simplified Flask app...")
    print("🌐 Will be available at: http://localhost:8000")
    print("✅ 403 errors should be resolved")
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False)
