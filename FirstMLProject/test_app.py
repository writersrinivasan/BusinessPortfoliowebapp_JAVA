#!/usr/bin/env python3
"""
Test script for the House Price Prediction ML Tutorial
This script runs basic tests to ensure all components work correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all required modules can be imported."""
    print("🧪 Testing imports...")
    
    try:
        import pandas as pd
        import numpy as np
        import sklearn
        import matplotlib.pyplot as plt
        import seaborn as sns
        import plotly.express as px
        import streamlit as st
        print("✅ All core libraries imported successfully")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    
    try:
        from data_utils import load_california_housing, create_sample_housing_data
        from model_utils import ModelTrainer, ModelExplainer
        from config import APP_CONFIG, MODEL_CONFIG
        print("✅ Custom modules imported successfully")
    except ImportError as e:
        print(f"❌ Custom module import error: {e}")
        return False
    
    return True

def test_data_loading():
    """Test data loading functionality."""
    print("\n📊 Testing data loading...")
    
    try:
        from data_utils import load_california_housing, create_sample_housing_data
        
        # Test California housing data
        data, descriptions = load_california_housing()
        assert len(data) > 0, "No data loaded"
        assert len(descriptions) > 0, "No feature descriptions"
        print(f"✅ California housing data: {len(data)} samples, {len(data.columns)} features")
        
        # Test sample data creation
        sample_data = create_sample_housing_data(100)
        assert len(sample_data) == 100, "Sample data size incorrect"
        print(f"✅ Sample data generation: {len(sample_data)} samples")
        
    except Exception as e:
        print(f"❌ Data loading error: {e}")
        return False
    
    return True

def test_model_training():
    """Test model training functionality."""
    print("\n🤖 Testing model training...")
    
    try:
        import pandas as pd
        from data_utils import load_california_housing
        from model_utils import ModelTrainer
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import StandardScaler
        
        # Load and prepare data
        data, _ = load_california_housing()
        features = ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms']  # Subset for testing
        X = data[features]
        y = data['MedHouseVal']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Convert back to DataFrame
        X_train_scaled = pd.DataFrame(X_train_scaled, columns=features)
        X_test_scaled = pd.DataFrame(X_test_scaled, columns=features)
        
        # Initialize and train models
        trainer = ModelTrainer()
        trainer.initialize_models()
        
        # Train a subset of models for testing
        training_results = trainer.train_models(X_train_scaled, y_train, ['Linear Regression'])
        
        assert len(training_results['trained_models']) > 0, "No models trained"
        print(f"✅ Model training: {len(training_results['trained_models'])} models trained")
        
        # Test predictions
        trainer.make_predictions(X_train_scaled, X_test_scaled)
        assert len(trainer.predictions) > 0, "No predictions made"
        print("✅ Model predictions generated")
        
        # Test evaluation
        metrics = trainer.evaluate_models(y_train, y_test)
        assert len(metrics) > 0, "No metrics calculated"
        print(f"✅ Model evaluation: {len(metrics)} models evaluated")
        
    except Exception as e:
        print(f"❌ Model training error: {e}")
        return False
    
    return True

def test_configuration():
    """Test configuration loading."""
    print("\n⚙️ Testing configuration...")
    
    try:
        from config import APP_CONFIG, MODEL_CONFIG, DATA_CONFIG, EDUCATIONAL_CONTENT
        
        assert 'title' in APP_CONFIG, "Missing app title in config"
        assert len(MODEL_CONFIG) > 0, "No models in config"
        assert len(EDUCATIONAL_CONTENT) > 0, "No educational content"
        
        print("✅ Configuration loaded successfully")
        print(f"   - App title: {APP_CONFIG['title']}")
        print(f"   - Models configured: {list(MODEL_CONFIG.keys())}")
        print(f"   - Educational sections: {len(EDUCATIONAL_CONTENT)}")
        
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False
    
    return True

def main():
    """Run all tests."""
    print("🏠 House Price Prediction ML Tutorial - Test Suite")
    print("=" * 60)
    
    all_tests_passed = True
    
    # Run tests
    tests = [
        test_imports,
        test_configuration,
        test_data_loading,
        test_model_training
    ]
    
    for test in tests:
        if not test():
            all_tests_passed = False
    
    # Summary
    print("\n" + "=" * 60)
    if all_tests_passed:
        print("🎉 All tests passed! The ML tutorial is ready to use.")
        print("\n🚀 To start the app, run:")
        print("   python run.py")
        print("   or")
        print("   streamlit run app.py")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
