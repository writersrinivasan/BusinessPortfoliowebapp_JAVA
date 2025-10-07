#!/usr/bin/env python3
"""
SSL Certificate Fix for macOS
This script helps resolve SSL certificate verification issues on macOS
when downloading datasets with scikit-learn.
"""

import ssl
import urllib.request
import certifi
import sys
import os

def fix_ssl_certificates():
    """
    Fix SSL certificate issues on macOS.
    """
    print("🔧 Fixing SSL certificate issues for macOS...")
    
    try:
        # Method 1: Install certificates using certifi
        import certifi
        
        # Create SSL context with certifi certificates
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        
        # Install the context globally
        https_handler = urllib.request.HTTPSHandler(context=ssl_context)
        opener = urllib.request.build_opener(https_handler)
        urllib.request.install_opener(opener)
        
        print("✅ SSL certificates fixed using certifi")
        return True
        
    except ImportError:
        print("❌ certifi not found, trying alternative method...")
        
        # Method 2: Disable verification (less secure but works)
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        https_handler = urllib.request.HTTPSHandler(context=ssl_context)
        opener = urllib.request.build_opener(https_handler)
        urllib.request.install_opener(opener)
        
        print("⚠️  SSL verification disabled (less secure but functional)")
        return True
    
    except Exception as e:
        print(f"❌ Could not fix SSL certificates: {e}")
        return False

def install_certificates():
    """
    Run the Install Certificates.command that comes with Python on macOS.
    """
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}"
    cert_command_paths = [
        f"/Applications/Python {python_version}/Install Certificates.command",
        f"/Library/Frameworks/Python.framework/Versions/{python_version}/Install Certificates.command",
        "/Applications/Python*/Install Certificates.command"
    ]
    
    for path in cert_command_paths:
        if os.path.exists(path):
            print(f"Found certificate installer: {path}")
            print("Please run this command manually to fix SSL certificates:")
            print(f"  {path}")
            return True
    
    print("❌ Certificate installer not found")
    return False

def main():
    """Main function to fix SSL certificates."""
    print("🏠 House Price Prediction ML Tutorial - SSL Fix")
    print("=" * 50)
    
    print("\n🔍 Checking SSL certificate configuration...")
    
    # Test SSL connection
    try:
        import urllib.request
        urllib.request.urlopen('https://www.google.com', timeout=5)
        print("✅ Basic SSL connectivity works")
    except Exception as e:
        print(f"❌ SSL connectivity issue: {e}")
    
    # Try to fix SSL certificates
    print("\n🔧 Attempting to fix SSL certificates...")
    
    if fix_ssl_certificates():
        print("\n✅ SSL certificates fixed!")
        print("\n🚀 You can now run the ML tutorial:")
        print("   python run.py")
        print("   or")
        print("   streamlit run app.py")
    else:
        print("\n❌ Could not automatically fix SSL certificates")
        print("\n🛠️  Manual solutions:")
        print("1. Install certificates manually:")
        install_certificates()
        print("\n2. Or install certifi:")
        print("   pip install certifi")
        print("\n3. Or use the synthetic data option in the app")

if __name__ == "__main__":
    main()
