#!/usr/bin/env python3
"""
Quick test to verify the application starts and slot selection works
"""

import os
import sys
import subprocess
import time
import threading
import requests

def start_flask_app():
    """Start Flask app in background"""
    try:
        os.chdir('/Users/srinivasanramanujam/Scheduler-Doctor')
        result = subprocess.run([sys.executable, 'start_app.py'], 
                              capture_output=True, text=True, timeout=10)
        print("Flask output:", result.stdout)
        if result.stderr:
            print("Flask errors:", result.stderr)
    except subprocess.TimeoutExpired:
        print("Flask app started successfully (timeout reached)")
    except Exception as e:
        print(f"Error starting Flask: {e}")

def test_endpoints():
    """Test that the application endpoints work"""
    time.sleep(3)  # Wait for Flask to start
    
    # Try different ports that might be in use
    ports = [5000, 5001, 5002, 8000, 8080]
    
    for port in ports:
        try:
            base_url = f"http://localhost:{port}"
            response = requests.get(base_url, timeout=2)
            if response.status_code == 200:
                print(f"✅ Application running on {base_url}")
                
                # Test booking page
                booking_response = requests.get(f"{base_url}/book/1", timeout=2)
                if booking_response.status_code == 200:
                    print(f"✅ Booking page accessible at {base_url}/book/1")
                    
                    # Check if our fixes are in the HTML
                    content = booking_response.text
                    if 'onclick="selectSlot(' in content:
                        print("✅ Slot selection fixes are present in the HTML")
                    else:
                        print("❌ Slot selection fixes not found in HTML")
                        
                    print(f"\n🌐 Open this URL to test slot selection:")
                    print(f"   {base_url}/book/1")
                    print("\n📝 Test steps:")
                    print("   1. Fill in patient name and phone")
                    print("   2. Click on any time slot")
                    print("   3. Verify it highlights blue")
                    print("   4. Try clicking different slots")
                    print("   5. Click 'Book Appointment' to complete")
                    
                return True
                
        except requests.exceptions.RequestException:
            continue
    
    print("❌ Could not connect to application on any port")
    return False

if __name__ == "__main__":
    print("🚀 Starting Doctor Appointment Scheduler...")
    
    # Start Flask in background thread
    flask_thread = threading.Thread(target=start_flask_app, daemon=True)
    flask_thread.start()
    
    # Test the application
    if test_endpoints():
        print("\n✅ Application is running and ready for testing!")
    else:
        print("\n❌ Failed to start application. Trying manual start...")
        print("\nManual start command:")
        print("   cd /Users/srinivasanramanujam/Scheduler-Doctor")
        print("   python start_app.py")
