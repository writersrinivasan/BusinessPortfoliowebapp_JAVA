#!/usr/bin/env python3
"""
Quick System Test - Verify Flask App is Working
"""

import os
import sys
import subprocess
import time
from threading import Thread

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_server():
    """Test if the server starts and responds correctly"""
    
    print("🧪 Running Flask Application Test")
    print("=" * 40)
    
    # Test 1: Import test
    print("📦 Testing imports...")
    try:
        import app
        from data_manager import DataManager
        print("✅ All imports successful")
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Test 2: Data manager test
    print("\n📊 Testing data manager...")
    try:
        dm = DataManager()
        doctors = dm.get_all_doctors()
        print(f"✅ Data manager working - {len(doctors)} doctors found")
    except Exception as e:
        print(f"❌ Data manager failed: {e}")
        return False
    
    # Test 3: Flask app configuration
    print("\n⚙️  Testing Flask app configuration...")
    try:
        test_client = app.app.test_client()
        response = test_client.get('/health')
        
        if response.status_code == 200:
            print("✅ Flask app configured correctly")
            print(f"   Health endpoint returns: {response.status_code}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Flask app test failed: {e}")
        return False
    
    # Test 4: Template rendering
    print("\n🎨 Testing template rendering...")
    try:
        response = test_client.get('/')
        if response.status_code == 200:
            print("✅ Homepage renders successfully")
        else:
            print(f"❌ Homepage failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Template test failed: {e}")
        return False
    
    print("\n🎉 All tests passed! The application is ready.")
    print("\n📋 Manual Start Instructions:")
    print("1. Open a terminal in the project directory")
    print("2. Run: source .venv/bin/activate")
    print("3. Run: python app.py")
    print("4. Open browser to: http://localhost:8000")
    
    return True

if __name__ == "__main__":
    success = test_server()
    if success:
        print("\n🚀 Would you like to start the server now? (y/n)")
        # Note: Since we can't get input in this environment, 
        # we'll just show the instructions
        print("\n💡 To start manually:")
        print("   cd /Users/srinivasanramanujam/Scheduler-Doctor")
        print("   source .venv/bin/activate") 
        print("   python app.py")
    
    sys.exit(0 if success else 1)
