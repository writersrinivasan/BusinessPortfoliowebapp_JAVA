#!/usr/bin/env python3
"""
Test script to verify slot selection functionality
"""

import os
import sys
import subprocess
import time
import requests
from threading import Thread

def start_server():
    """Start the Flask server in a separate thread"""
    os.chdir('/Users/srinivasanramanujam/Scheduler-Doctor')
    try:
        subprocess.run([sys.executable, 'app.py'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")

def test_server():
    """Test if server is running and endpoints work"""
    base_url = "http://localhost:5000"
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        # Test home page
        response = requests.get(base_url)
        print(f"Home page status: {response.status_code}")
        
        # Test booking page for doctor 1
        response = requests.get(f"{base_url}/book/1")
        print(f"Booking page status: {response.status_code}")
        
        # Test API endpoint
        response = requests.get(f"{base_url}/api/available_slots/1")
        print(f"API endpoint status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Available slots: {data.get('slots', [])}")
        
        print("\nServer is running! You can test the slot selection at:")
        print(f"{base_url}/book/1")
        print("\nTo test slot selection:")
        print("1. Open the above URL in your browser")
        print("2. Fill in patient information")
        print("3. Click on any time slot to select it")
        print("4. The slot should highlight and be selectable")
        print("5. Click 'Book Appointment' to test the full flow")
        
    except requests.exceptions.ConnectionError:
        print("Could not connect to server. Make sure Flask is running.")
    except Exception as e:
        print(f"Error testing server: {e}")

if __name__ == "__main__":
    print("Starting Flask server...")
    
    # Start server in background thread
    server_thread = Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Test the server
    test_server()
    
    print("\nPress Ctrl+C to stop the server")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")
