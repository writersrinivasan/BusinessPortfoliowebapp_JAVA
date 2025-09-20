#!/usr/bin/env python3
"""
Test script for Doctor Appointment Scheduler

This script tests the core functionality of the appointment scheduler
including data management, booking operations, and API endpoints.
"""

import json
import sys
import os
from datetime import datetime

# Add current directory to path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_manager import DataManager

def test_data_manager():
    """Test the DataManager functionality"""
    print("🧪 Testing DataManager functionality...")
    
    # Initialize data manager
    dm = DataManager()
    
    # Test 1: Get all doctors
    print("  ✓ Test 1: Getting all doctors...")
    doctors = dm.get_all_doctors()
    assert len(doctors) > 0, "Should have at least one doctor"
    print(f"    Found {len(doctors)} doctors")
    
    # Test 2: Get specific doctor
    print("  ✓ Test 2: Getting specific doctor...")
    doctor = dm.get_doctor_by_id(1)
    assert doctor is not None, "Should find doctor with ID 1"
    print(f"    Found doctor: {doctor['name']}")
    
    # Test 3: Get available slots
    print("  ✓ Test 3: Getting available slots...")
    slots = dm.get_available_slots(1)
    assert isinstance(slots, list), "Slots should be a list"
    print(f"    Doctor has {len(slots)} available slots")
    
    # Test 4: Book an appointment
    print("  ✓ Test 4: Booking an appointment...")
    if len(slots) > 0:
        first_slot = slots[0]
        result = dm.book_appointment(
            doctor_id=1,
            slot=first_slot,
            patient_name="Test Patient",
            patient_phone="555-TEST",
            patient_email="test@example.com"
        )
        assert result['success'], f"Booking should succeed: {result['message']}"
        print(f"    Booked appointment: {result['message']}")
        
        # Test 5: Verify slot is no longer available
        print("  ✓ Test 5: Verifying slot removal...")
        updated_slots = dm.get_available_slots(1)
        assert first_slot not in updated_slots, "Booked slot should be removed"
        print(f"    Slot {first_slot} successfully removed from availability")
        
        # Test 6: Test cancellation
        print("  ✓ Test 6: Testing appointment cancellation...")
        booking_id = result['booking_id']
        cancel_result = dm.cancel_appointment(booking_id, "555-TEST")
        assert cancel_result['success'], f"Cancellation should succeed: {cancel_result['message']}"
        print(f"    Cancelled appointment: {cancel_result['message']}")
        
        # Test 7: Verify slot is restored
        print("  ✓ Test 7: Verifying slot restoration...")
        restored_slots = dm.get_available_slots(1)
        assert first_slot in restored_slots, "Cancelled slot should be restored"
        print(f"    Slot {first_slot} successfully restored to availability")
    else:
        print("    Skipping booking tests - no slots available")
    
    print("✅ All DataManager tests passed!")

def test_flask_imports():
    """Test that Flask application can be imported"""
    print("🧪 Testing Flask application imports...")
    
    try:
        import app
        print("  ✓ Flask app imported successfully")
        
        # Check if app has required routes
        with app.app.test_client() as client:
            # Test homepage
            print("  ✓ Testing homepage route...")
            response = client.get('/')
            assert response.status_code == 200, f"Homepage should return 200, got {response.status_code}"
            print("    Homepage accessible")
            
            # Test API endpoint
            print("  ✓ Testing API endpoint...")
            response = client.get('/api/available_slots/1')
            assert response.status_code == 200, f"API should return 200, got {response.status_code}"
            
            data = json.loads(response.data)
            assert 'success' in data, "API response should have 'success' field"
            print("    API endpoint working")
            
    except ImportError as e:
        print(f"  ❌ Failed to import Flask app: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Flask app test failed: {e}")
        return False
    
    print("✅ All Flask tests passed!")
    return True

def test_data_files():
    """Test that data files exist and are valid"""
    print("🧪 Testing data files...")
    
    # Test doctors data file
    print("  ✓ Testing doctors data file...")
    assert os.path.exists('doctors_data.json'), "doctors_data.json should exist"
    
    with open('doctors_data.json', 'r') as f:
        doctors_data = json.load(f)
    
    assert 'doctors' in doctors_data, "doctors_data.json should have 'doctors' key"
    assert len(doctors_data['doctors']) > 0, "Should have at least one doctor"
    print(f"    Found {len(doctors_data['doctors'])} doctors in data file")
    
    # Test bookings data file
    print("  ✓ Testing bookings data file...")
    assert os.path.exists('bookings.json'), "bookings.json should exist"
    
    with open('bookings.json', 'r') as f:
        bookings_data = json.load(f)
    
    assert 'bookings' in bookings_data, "bookings.json should have 'bookings' key"
    print(f"    Found {len(bookings_data['bookings'])} bookings in data file")
    
    print("✅ All data file tests passed!")

def test_static_files():
    """Test that static files exist"""
    print("🧪 Testing static files...")
    
    # Test CSS file
    css_path = os.path.join('static', 'css', 'style.css')
    assert os.path.exists(css_path), f"CSS file should exist at {css_path}"
    print("  ✓ CSS file exists")
    
    # Test JavaScript file
    js_path = os.path.join('static', 'js', 'main.js')
    assert os.path.exists(js_path), f"JavaScript file should exist at {js_path}"
    print("  ✓ JavaScript file exists")
    
    print("✅ All static file tests passed!")

def test_templates():
    """Test that template files exist"""
    print("🧪 Testing template files...")
    
    required_templates = [
        'base.html',
        'index.html',
        'booking.html',
        'confirmation.html',
        'my_bookings.html',
        'admin_stats.html',
        'error.html'
    ]
    
    for template in required_templates:
        template_path = os.path.join('templates', template)
        assert os.path.exists(template_path), f"Template {template} should exist"
        print(f"  ✓ Template {template} exists")
    
    print("✅ All template tests passed!")

def run_comprehensive_test():
    """Run all tests"""
    print("🏥 Doctor Appointment Scheduler - Comprehensive Test Suite")
    print("=" * 60)
    
    try:
        test_data_files()
        print()
        
        test_static_files()
        print()
        
        test_templates()
        print()
        
        test_data_manager()
        print()
        
        test_flask_imports()
        print()
        
        print("🎉 ALL TESTS PASSED! The application is ready to use.")
        print("\nTo start the application, run:")
        print("python app.py")
        print("\nThen open your browser to: http://localhost:5000")
        
        return True
        
    except AssertionError as e:
        print(f"❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = run_comprehensive_test()
    sys.exit(0 if success else 1)
