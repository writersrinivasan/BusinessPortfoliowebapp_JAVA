#!/usr/bin/env python3
"""
Simple Direct Flask Starter - Fixed Backend Integration
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    try:
        # Import the Flask app
        from app import app
        from data_manager import data_manager
        
        print("🏥 Doctor Appointment Scheduler - Fixed Integration")
        print("=" * 60)
        
        # Test data manager
        doctors = data_manager.get_all_doctors()
        print(f"✅ Found {len(doctors)} doctors")
        
        # Configure app
        app.config['DEBUG'] = True
        app.config['TESTING'] = False
        
        print("🚀 Starting server on http://localhost:8000")
        print("🔧 Backend integration fixes applied:")
        print("  • CORS headers added for AJAX requests")
        print("  • Improved error handling")
        print("  • Enhanced API endpoints")
        print("  • Fixed form validation")
        print("  • Added debug logging")
        print("=" * 60)
        print("📱 Test these URLs:")
        print("  🏠 Homepage: http://localhost:8000")
        print("  🔧 Test Page: http://localhost:8000/test")
        print("  ❤️  Health: http://localhost:8000/health")
        print("  📅 API Test: http://localhost:8000/api/available_slots/1")
        print("=" * 60)
        print("Press Ctrl+C to stop")
        print()
        
        # Start the server
        app.run(
            host='127.0.0.1',
            port=8000,
            debug=True,
            threaded=True,
            use_reloader=False
        )
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()
