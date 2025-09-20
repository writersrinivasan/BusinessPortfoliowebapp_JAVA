#!/usr/bin/env python3
"""
Port Finder and Flask Starter
Automatically finds an available port and starts the Flask server
"""

import socket
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def find_free_port(start_port=8000, max_attempts=10):
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            # Try to bind to the port
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            result = sock.bind(('127.0.0.1', port))
            sock.close()
            return port
        except OSError:
            continue
    return None

def start_flask_server():
    """Start Flask server on an available port"""
    
    print("🔍 Finding available port...")
    
    # Try to find a free port
    port = find_free_port(8000)
    
    if port is None:
        # Try higher range if lower ports are busy
        port = find_free_port(9000)
    
    if port is None:
        print("❌ Could not find any available port!")
        print("💡 Please close other applications and try again")
        return False
    
    print(f"✅ Found available port: {port}")
    
    # Import Flask app
    try:
        from app import app
        print("✅ Flask app imported successfully")
    except Exception as e:
        print(f"❌ Failed to import Flask app: {e}")
        return False
    
    # Test data manager
    try:
        from data_manager import data_manager
        doctors = data_manager.get_all_doctors()
        print(f"✅ Data manager working - found {len(doctors)} doctors")
    except Exception as e:
        print(f"❌ Data manager error: {e}")
        return False
    
    # Start the server
    print("\n🏥 Doctor Appointment Scheduler")
    print("=" * 50)
    print(f"🚀 Starting server on port {port}...")
    print(f"🌐 Open your browser to: http://localhost:{port}")
    print("=" * 50)
    print("📋 Available pages:")
    print(f"  🏠 Homepage: http://localhost:{port}")
    print(f"  🔧 Test Page: http://localhost:{port}/test")
    print(f"  ❤️  Health: http://localhost:{port}/health")
    print(f"  📅 Booking: http://localhost:{port}/booking/1")
    print(f"  📋 My Bookings: http://localhost:{port}/my_bookings")
    print(f"  📊 Admin Stats: http://localhost:{port}/admin/stats")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(
            host='127.0.0.1',
            port=port,
            debug=True,
            threaded=True,
            use_reloader=False  # Disable reloader to avoid port conflicts
        )
        return True
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        return False

if __name__ == "__main__":
    success = start_flask_server()
    sys.exit(0 if success else 1)
