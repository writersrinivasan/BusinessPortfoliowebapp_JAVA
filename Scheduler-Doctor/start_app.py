#!/usr/bin/env python3
"""
Simple script to start the Doctor Appointment Scheduler
"""

import os
import sys
import socket

def find_free_port():
    """Find an available port"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.listen(1)
        port = s.getsockname()[1]
    return port

def main():
    """Start the Flask application"""
    # Change to the project directory
    project_dir = '/Users/srinivasanramanujam/Scheduler-Doctor'
    os.chdir(project_dir)
    
    print("🏥 Starting Doctor Appointment Scheduler...")
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Find an available port
    port = find_free_port()
    
    # Import and run the Flask app
    try:
        sys.path.insert(0, project_dir)
        from app import app
        
        print("✅ Flask app imported successfully")
        print(f"🌐 Starting server on http://localhost:{port}")
        print(f"\n📋 To test slot selection:")
        print(f"   1. Open http://localhost:{port} in your browser")
        print("   2. Click 'Book Appointment' for any doctor")
        print("   3. Fill in patient information")
        print("   4. Click on any time slot to select it")
        print("   5. Verify the slot highlights properly")
        print("   6. Click 'Book Appointment' to complete booking")
        print("\n⏹️  Press Ctrl+C to stop the server\n")
        
        # Run the app
        app.run(host='127.0.0.1', port=port, debug=False, use_reloader=False)
        
    except ImportError as e:
        print(f"❌ Error importing app: {e}")
        return 1
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
