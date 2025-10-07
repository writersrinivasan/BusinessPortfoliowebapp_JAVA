#!/usr/bin/env python3
"""
Run script for the House Price Prediction ML Tutorial
This script sets up the environment and launches the Streamlit app.
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required.")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    else:
        print(f"✅ Python version: {sys.version.split()[0]}")

def check_requirements():
    """Check if required packages are installed."""
    required_packages = [
        'streamlit',
        'pandas', 
        'numpy',
        'scikit-learn',
        'matplotlib',
        'seaborn',
        'plotly'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', 
                *missing_packages
            ])
            print("✅ All packages installed successfully!")
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages. Please install manually:")
            print(f"pip install {' '.join(missing_packages)}")
            sys.exit(1)

def launch_app():
    """Launch the Streamlit app."""
    app_path = Path(__file__).parent / "app.py"
    
    if not app_path.exists():
        print("❌ Error: app.py not found!")
        sys.exit(1)
    
    print("\n🚀 Launching House Price Prediction ML Tutorial...")
    print("📱 The app will open in your default browser")
    print("🔗 URL: http://localhost:8501")
    print("\n📝 Instructions:")
    print("1. Click 'Load Dataset' in the sidebar")
    print("2. Follow the tutorial sections in order")
    print("3. Experiment with different settings!")
    print("\n⏹️  Press Ctrl+C to stop the app")
    print("-" * 50)
    
    try:
        subprocess.run([
            sys.executable, '-m', 'streamlit', 'run', str(app_path),
            '--server.address', 'localhost',
            '--server.port', '8501',
            '--browser.gatherUsageStats', 'false'
        ])
    except KeyboardInterrupt:
        print("\n\n👋 Thanks for using the ML Tutorial!")
    except FileNotFoundError:
        print("❌ Error: Streamlit not found. Please install it:")
        print("pip install streamlit")
        sys.exit(1)

def main():
    """Main function to run the setup and launch sequence."""
    print("🏠 House Price Prediction ML Tutorial")
    print("=" * 50)
    
    # Check Python version
    print("\n📋 Checking Python version...")
    check_python_version()
    
    # Check requirements
    print("\n📦 Checking required packages...")
    check_requirements()
    
    # Launch app
    launch_app()

if __name__ == "__main__":
    main()
