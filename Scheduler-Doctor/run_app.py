#!/usr/bin/env python3
"""
Robust Flask startup script that handles all port conflicts
"""

import os
import sys
import socket
import subprocess
import time
import threading
import signal

def find_available_port():
    """Find any available port dynamically"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.listen(1)
        port = s.getsockname()[1]
    return port

def is_port_in_use(port):
    """Check if a specific port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            return False
        except OSError:
            return True

def kill_process_on_port(port):
    """Kill any process using the specified port"""
    try:
        # For macOS/Linux
        result = subprocess.run(['lsof', '-ti', f':{port}'], 
                              capture_output=True, text=True, check=False)
        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid:
                    subprocess.run(['kill', '-9', pid], check=False)
                    print(f"✅ Killed process {pid} on port {port}")
        
        time.sleep(1)  # Give time for process to die
        
    except Exception as e:
        print(f"Note: Could not kill processes on port {port}: {e}")

def start_flask_app(port):
    """Start the Flask application on specified port"""
    try:
        # Set working directory
        project_dir = '/Users/srinivasanramanujam/Scheduler-Doctor'
        os.chdir(project_dir)
        sys.path.insert(0, project_dir)
        
        # Import Flask app
        from app import app
        
        print(f"🚀 Starting Flask server on port {port}")
        print(f"🌐 URL: http://localhost:{port}")
        print(f"📋 Booking URL: http://localhost:{port}/book/1")
        print("✅ All slot selection fixes applied!")
        print("\n" + "="*60)
        print("🧪 TEST INSTRUCTIONS:")
        print("1. Open the URL above in your browser")
        print("2. Click 'Book Appointment' for any doctor")
        print("3. Fill in name and phone number") 
        print("4. Click any time slot - should highlight blue instantly")
        print("5. Use '🐛 Debug Form' button if needed")
        print("6. Submit the form")
        print("="*60)
        print("\n⏹️  Press Ctrl+C to stop\n")
        
        # Configure Flask app
        app.config['DEBUG'] = False
        app.config['TESTING'] = False
        
        # Start server
        app.run(
            host='0.0.0.0',
            port=port,
            debug=False,
            use_reloader=False,
            threaded=True
        )
        
    except Exception as e:
        print(f"❌ Error starting Flask app: {e}")
        raise

def main():
    """Main startup function"""
    print("🏥 Doctor Appointment Scheduler - Smart Port Detection")
    print("="*60)
    
    # Try preferred ports first
    preferred_ports = [5000, 5001, 5002, 8000, 8080, 3000]
    available_port = None
    
    print("🔍 Checking for available ports...")
    
    # First, try to free up preferred ports
    for port in preferred_ports:
        if is_port_in_use(port):
            print(f"⚠️  Port {port} is busy, attempting to free it...")
            kill_process_on_port(port)
    
    # Wait a moment for ports to be freed
    time.sleep(2)
    
    # Now find an available port
    for port in preferred_ports:
        if not is_port_in_use(port):
            available_port = port
            print(f"✅ Found available port: {port}")
            break
    
    # If no preferred port is available, find any available port
    if available_port is None:
        available_port = find_available_port()
        print(f"✅ Using dynamic port: {available_port}")
    
    try:
        # Start the Flask application
        start_flask_app(available_port)
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        return 0
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
