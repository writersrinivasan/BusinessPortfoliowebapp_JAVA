#!/usr/bin/env python3
"""
Simple test to verify the ML tutorial works after SSL fix
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_ssl_fix():
    """Test if SSL fix resolved the issue."""
    try:
        # Apply SSL fix
        import ssl
        import urllib.request
        import certifi
        
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        https_handler = urllib.request.HTTPSHandler(context=ssl_context)
        opener = urllib.request.build_opener(https_handler)
        urllib.request.install_opener(opener)
        
        print("✅ SSL fix applied")
        return True
    except Exception as e:
        print(f"❌ SSL fix failed: {e}")
        return False

def test_data_loading():
    """Test data loading functionality."""
    try:
        from data_utils import load_california_housing
        data, descriptions = load_california_housing()
        
        if len(data) > 0:
            print(f"✅ Data loaded successfully: {len(data)} samples")
            return True
        else:
            print("❌ No data loaded")
            return False
    except Exception as e:
        print(f"❌ Data loading failed: {e}")
        return False

def test_basic_ml():
    """Test basic ML functionality."""
    try:
        import pandas as pd
        import numpy as np
        from sklearn.model_selection import train_test_split
        from sklearn.linear_model import LinearRegression
        from sklearn.metrics import r2_score
        
        # Create simple test data
        np.random.seed(42)
        X = np.random.randn(100, 3)
        y = X[:, 0] + X[:, 1] * 0.5 + np.random.randn(100) * 0.1
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = LinearRegression()
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        r2 = r2_score(y_test, predictions)
        
        print(f"✅ Basic ML test passed: R² = {r2:.3f}")
        return True
    except Exception as e:
        print(f"❌ Basic ML test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Quick Test Suite for ML Tutorial")
    print("=" * 40)
    
    all_passed = True
    
    # Test SSL fix
    print("\n🔧 Testing SSL configuration...")
    if not test_ssl_fix():
        all_passed = False
    
    # Test data loading
    print("\n📊 Testing data loading...")
    if not test_data_loading():
        all_passed = False
    
    # Test basic ML
    print("\n🤖 Testing basic ML functionality...")
    if not test_basic_ml():
        all_passed = False
    
    # Summary
    print("\n" + "=" * 40)
    if all_passed:
        print("🎉 All tests passed! The app should work correctly.")
        print("\n🚀 Ready to run:")
        print("   streamlit run app.py")
    else:
        print("❌ Some tests failed. Check the errors above.")
        print("\n💡 The app may still work with synthetic data.")

if __name__ == "__main__":
    main()
