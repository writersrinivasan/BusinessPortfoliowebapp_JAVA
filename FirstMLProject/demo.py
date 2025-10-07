#!/usr/bin/env python3
"""
Demo script for the House Price Prediction ML Tutorial
This script demonstrates the core functionality without the web interface.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LinearRegression
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import r2_score, mean_absolute_error
    
    from data_utils import load_california_housing
    from model_utils import ModelTrainer
    
    print("🏠 House Price Prediction ML Tutorial - Demo")
    print("=" * 50)
    
    # Load data
    print("\n📊 Loading California Housing dataset...")
    data, descriptions = load_california_housing()
    print(f"   ✅ Loaded {len(data)} samples with {len(data.columns)} features")
    
    # Prepare data
    print("\n🛠️ Preparing data...")
    features = ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup', 'Latitude', 'Longitude']
    X = data[features]
    y = data['MedHouseVal']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Convert back to DataFrame
    X_train_scaled = pd.DataFrame(X_train_scaled, columns=features)
    X_test_scaled = pd.DataFrame(X_test_scaled, columns=features)
    
    print(f"   ✅ Training set: {X_train_scaled.shape}")
    print(f"   ✅ Test set: {X_test_scaled.shape}")
    
    # Train models
    print("\n🤖 Training models...")
    trainer = ModelTrainer()
    trainer.initialize_models({
        'Random Forest': {
            'n_estimators': 100,
            'max_depth': 10,
            'random_state': 42
        }
    })
    
    # Train models
    results = trainer.train_models(X_train_scaled, y_train, ['Linear Regression', 'Random Forest'])
    print(f"   ✅ Trained models: {', '.join(results['trained_models'])}")
    
    # Make predictions
    print("\n📊 Making predictions...")
    trainer.make_predictions(X_train_scaled, X_test_scaled)
    
    # Evaluate models
    metrics = trainer.evaluate_models(y_train, y_test)
    print("\n🏆 Model Performance:")
    print(metrics[['Model', 'Test_R2', 'Test_MAE', 'Test_RMSE']].round(4))
    
    # Feature importance
    print("\n🎯 Feature Importance (Random Forest):")
    importance = trainer.get_feature_importance(features)
    if 'Random Forest' in importance:
        print(importance['Random Forest'].head().round(4))
    
    print("\n✅ Demo completed successfully!")
    print("\n🚀 To run the full interactive tutorial:")
    print("   python3 run.py")
    print("   or")
    print("   streamlit run app.py")
    
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Please install required packages:")
    print("   pip3 install -r requirements.txt")
    
except Exception as e:
    print(f"❌ Error during demo: {e}")
    print("Please check the installation and try again.")
