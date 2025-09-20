#!/usr/bin/env python3
"""
Direct Flask Server Starter
Run this to start the Flask server directly without background processes
"""

import os
import sys

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set environment variables
os.environ['FLASK_APP'] = 'app.py'
os.environ['FLASK_ENV'] = 'development'
os.environ['FLASK_DEBUG'] = '1'

def main():
    print("🏥 Doctor Appointment Scheduler - Direct Starter")
    print("=" * 50)
    
    # Test imports first
    try:
        from flask import Flask
        print("✅ Flask imported successfully")
        
        from data_manager import DataManager
        print("✅ DataManager imported successfully")
        
        # Test data manager
        dm = DataManager()
        doctors = dm.get_all_doctors()
        print(f"✅ Found {len(doctors)} doctors in database")
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False
    
    # Try to start the server
    try:
        print("\n🚀 Starting Flask development server...")
        print("📝 Server will run on http://127.0.0.1:8000")
        print("📝 Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Import and run the app
        import app
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        return True
    except Exception as e:
        print(f"❌ Server error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
