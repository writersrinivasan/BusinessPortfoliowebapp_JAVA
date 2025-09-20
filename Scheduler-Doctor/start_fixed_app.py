#!/usr/bin/env python3
"""
Production-ready Flask startup script with all fixes integrated
"""

import os
import sys
import socket
import subprocess
import time

def find_free_port(start_port=5000):
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def kill_existing_processes():
    """Kill any existing Flask processes on common ports"""
    try:
        subprocess.run(['pkill', '-f', 'python.*app.py'], check=False)
        subprocess.run(['pkill', '-f', 'flask'], check=False)
        time.sleep(2)
        print("✅ Stopped existing Flask processes")
    except Exception:
        pass

def main():
    """Start the Flask application with all fixes"""
    # Change to project directory
    project_dir = '/Users/srinivasanramanujam/Scheduler-Doctor'
    os.chdir(project_dir)
    
    print("🏥 Doctor Appointment Scheduler - Production Start")
    print("=" * 50)
    
    # Kill existing processes
    kill_existing_processes()
    
    # Find free port
    port = find_free_port()
    if not port:
        print("❌ Could not find available port")
        return 1
    
    try:
        # Import Flask app
        sys.path.insert(0, project_dir)
        from app import app
        
        print(f"✅ Flask app loaded successfully")
        print(f"🌐 Starting server on http://localhost:{port}")
        print()
        print("🔧 Applied Fixes:")
        print("   ✅ Slot selection radio button issues resolved")
        print("   ✅ CORS headers and 403 errors fixed")
        print("   ✅ Form validation enhanced with debugging")
        print("   ✅ CSS conflicts resolved")
        print("   ✅ Event handling improved")
        print()
        print(f"🔗 Open in browser: http://localhost:{port}")
        print(f"📋 Test booking: http://localhost:{port}/book/1")
        print()
        print("📝 Testing Instructions:")
        print("   1. Click 'Book Appointment' for any doctor")
        print("   2. Fill in patient name and phone number")
        print("   3. Click on any time slot (should highlight blue)")
        print("   4. Click 'Book Appointment' to submit")
        print("   5. Use '🐛 Debug Form' button if issues occur")
        print()
        print("⏹️  Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Start Flask with production settings
        app.run(
            host='0.0.0.0',
            port=port,
            debug=False,
            use_reloader=False,
            threaded=True
        )
        
    except ImportError as e:
        print(f"❌ Error importing Flask app: {e}")
        print("   Make sure you're in the correct directory and Flask is installed")
        return 1
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
