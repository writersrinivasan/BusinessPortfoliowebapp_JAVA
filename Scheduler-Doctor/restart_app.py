#!/usr/bin/env python3
"""
Restart the Flask application with 403 error fixes
"""

import os
import sys
import socket
import subprocess
import time

def kill_existing_processes():
    """Kill any existing Flask processes"""
    try:
        subprocess.run(['pkill', '-f', 'python.*app.py'], check=False)
        subprocess.run(['pkill', '-f', 'python.*start_app.py'], check=False)
        time.sleep(2)
        print("✅ Stopped existing Flask processes")
    except:
        pass

def find_free_port(start_port=5000):
    """Find a free port"""
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def main():
    os.chdir('/Users/srinivasanramanujam/Scheduler-Doctor')
    
    print("🔄 Restarting Doctor Appointment Scheduler...")
    
    # Kill existing processes
    kill_existing_processes()
    
    # Find free port
    port = find_free_port()
    if not port:
        print("❌ Could not find free port")
        return 1
    
    # Start the application
    try:
        from app import app
        print(f"🌐 Restarting on http://localhost:{port}")
        print("🔧 Applied fixes for 403 errors:")
        print("   • Enhanced CORS headers")
        print("   • Added OPTIONS request handling")
        print("   • Added proper error handlers")
        print("   • Added /book/<id> route alias")
        print(f"\n🔗 Open: http://localhost:{port}")
        
        app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)
        
    except Exception as e:
        print(f"❌ Error starting app: {e}")
        return 1

if __name__ == "__main__":
    main()
