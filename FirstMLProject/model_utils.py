"""
Model utilities for the House Price Prediction ML Tutorial
This module provides classes and functions for model training and evaluation.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.model_selection import cross_val_score
from typing import Dict, List, Tuple, Any
import matplotlib.pyplot as plt
import seaborn as sns

class ModelTrainer:
    """A class to handle model training and evaluation for the ML tutorial."""
    
    def __init__(self):
        self.models = {}
        self.trained_models = {}
        self.predictions = {}
        self.metrics = {}
        
    def initialize_models(self, hyperparameters: Dict[str, Dict] = None) -> None:
        """
        Initialize ML models with given hyperparameters.
        
        Args:
            hyperparameters: Dictionary containing hyperparameters for each model
        """
        if hyperparameters is None:
            hyperparameters = {}
        
        # Linear Regression
        lr_params = hyperparameters.get('Linear Regression', {})
        self.models['Linear Regression'] = LinearRegression(**lr_params)
        
        # Random Forest
        rf_params = hyperparameters.get('Random Forest', {
            'n_estimators': 100,
            'max_depth': 10,
            'random_state': 42
        })
        self.models['Random Forest'] = RandomForestRegressor(**rf_params)
        
        # Gradient Boosting
        gb_params = hyperparameters.get('Gradient Boosting', {
            'n_estimators': 100,
            'learning_rate': 0.1,
            'max_depth': 6,
            'random_state': 42
        })
        self.models['Gradient Boosting'] = GradientBoostingRegressor(**gb_params)
    
    def train_models(self, X_train: pd.DataFrame, y_train: pd.Series, 
                    models_to_train: List[str] = None) -> Dict[str, Any]:
        """
        Train selected models on the training data.
        
        Args:
            X_train: Training features
            y_train: Training target
            models_to_train: List of model names to train
            
        Returns:
            Dictionary with training results
        """
        if models_to_train is None:
            models_to_train = list(self.models.keys())
        
        training_results = {
            'trained_models': [],
            'training_time': {},
            'errors': []
        }
        
        for model_name in models_to_train:
            if model_name not in self.models:
                training_results['errors'].append(f"Model '{model_name}' not found")
                continue
            
            try:
                import time
                start_time = time.time()
                
                # Train the model
                model = self.models[model_name]
                model.fit(X_train, y_train)
                
                # Store trained model
                self.trained_models[model_name] = model
                
                # Record training time
                training_time = time.time() - start_time
                training_results['training_time'][model_name] = training_time
                
                training_results['trained_models'].append(model_name)
                
            except Exception as e:
                training_results['errors'].append(f"Error training {model_name}: {str(e)}")
        
        return training_results
    
    def make_predictions(self, X_train: pd.DataFrame, X_test: pd.DataFrame) -> None:
        """
        Make predictions using trained models.
        
        Args:
            X_train: Training features
            X_test: Testing features
        """
        for model_name, model in self.trained_models.items():
            train_pred = model.predict(X_train)
            test_pred = model.predict(X_test)
            
            self.predictions[model_name] = {
                'train': train_pred,
                'test': test_pred
            }
    
    def evaluate_models(self, y_train: pd.Series, y_test: pd.Series) -> pd.DataFrame:
        """
        Evaluate all trained models and return metrics.
        
        Args:
            y_train: Training target values
            y_test: Testing target values
            
        Returns:
            DataFrame with evaluation metrics
        """
        metrics_data = []
        
        for model_name in self.trained_models.keys():
            if model_name not in self.predictions:
                continue
            
            train_pred = self.predictions[model_name]['train']
            test_pred = self.predictions[model_name]['test']
            
            # Calculate metrics
            train_r2 = r2_score(y_train, train_pred)
            test_r2 = r2_score(y_test, test_pred)
            train_mae = mean_absolute_error(y_train, train_pred)
            test_mae = mean_absolute_error(y_test, test_pred)
            train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))
            test_rmse = np.sqrt(mean_squared_error(y_test, test_pred))
            
            # Calculate overfitting indicator
            overfitting_score = train_r2 - test_r2
            
            metrics_data.append({
                'Model': model_name,
                'Train R²': train_r2,
                'Test R²': test_r2,
                'Train MAE': train_mae,
                'Test MAE': test_mae,
                'Train RMSE': train_rmse,
                'Test RMSE': test_rmse,
                'Overfitting': overfitting_score
            })
        
        metrics_df = pd.DataFrame(metrics_data)
        self.metrics = metrics_df
        return metrics_df
    
    def get_feature_importance(self, feature_names: List[str]) -> Dict[str, pd.DataFrame]:
        """
        Get feature importance for tree-based models.
        
        Args:
            feature_names: List of feature names
            
        Returns:
            Dictionary with feature importance DataFrames for each model
        """
        importance_data = {}
        
        for model_name, model in self.trained_models.items():
            if hasattr(model, 'feature_importances_'):
                importance_df = pd.DataFrame({
                    'Feature': feature_names,
                    'Importance': model.feature_importances_
                }).sort_values('Importance', ascending=False)
                
                importance_data[model_name] = importance_df
        
        return importance_data
    
    def cross_validate_models(self, X: pd.DataFrame, y: pd.Series, 
                            cv: int = 5) -> pd.DataFrame:
        """
        Perform cross-validation on all models.
        
        Args:
            X: Features
            y: Target
            cv: Number of cross-validation folds
            
        Returns:
            DataFrame with cross-validation results
        """
        cv_results = []
        
        for model_name, model in self.models.items():
            try:
                scores = cross_val_score(model, X, y, cv=cv, scoring='r2')
                
                cv_results.append({
                    'Model': model_name,
                    'CV Mean R²': scores.mean(),
                    'CV Std R²': scores.std(),
                    'CV Min R²': scores.min(),
                    'CV Max R²': scores.max()
                })
            except Exception as e:
                print(f"Error in cross-validation for {model_name}: {e}")
        
        return pd.DataFrame(cv_results)

class ModelExplainer:
    """A class to provide explanations and insights about ML models."""
    
    @staticmethod
    def explain_model(model_name: str) -> Dict[str, str]:
        """
        Provide explanation for a given model.
        
        Args:
            model_name: Name of the model
            
        Returns:
            Dictionary with model explanation
        """
        explanations = {
            'Linear Regression': {
                'description': 'A linear approach to modeling the relationship between features and target.',
                'strengths': [
                    'Simple and interpretable',
                    'Fast training and prediction',
                    'Good baseline model',
                    'Works well with linear relationships'
                ],
                'weaknesses': [
                    'Assumes linear relationship',
                    'Sensitive to outliers',
                    'Cannot capture complex patterns',
                    'Requires feature scaling for optimal performance'
                ],
                'use_cases': [
                    'When interpretability is crucial',
                    'As a baseline model',
                    'When data has linear patterns',
                    'Small datasets'
                ]
            },
            'Random Forest': {
                'description': 'An ensemble method that combines multiple decision trees.',
                'strengths': [
                    'Handles non-linear relationships',
                    'Resistant to overfitting',
                    'Provides feature importance',
                    'Works with mixed data types'
                ],
                'weaknesses': [
                    'Can be less interpretable',
                    'Memory intensive',
                    'May overfit with very noisy data',
                    'Biased towards categorical features with more levels'
                ],
                'use_cases': [
                    'When you need good performance out-of-the-box',
                    'Mixed data types',
                    'When feature importance is needed',
                    'Medium to large datasets'
                ]
            },
            'Gradient Boosting': {
                'description': 'A sequential ensemble method that builds models to correct previous errors.',
                'strengths': [
                    'Often achieves highest accuracy',
                    'Handles complex patterns well',
                    'Good with various data types',
                    'Provides feature importance'
                ],
                'weaknesses': [
                    'Prone to overfitting',
                    'Requires careful hyperparameter tuning',
                    'Slower training',
                    'Sensitive to outliers'
                ],
                'use_cases': [
                    'When highest accuracy is needed',
                    'Competitions and benchmarks',
                    'Complex, non-linear patterns',
                    'When you have time for hyperparameter tuning'
                ]
            }
        }
        
        return explanations.get(model_name, {})
    
    @staticmethod
    def explain_metrics() -> Dict[str, str]:
        """
        Provide explanations for evaluation metrics.
        
        Returns:
            Dictionary with metric explanations
        """
        return {
            'R² Score': {
                'description': 'Coefficient of determination - proportion of variance explained by the model',
                'range': '0 to 1 (higher is better)',
                'interpretation': '1.0 = perfect prediction, 0.0 = no better than mean prediction'
            },
            'MAE': {
                'description': 'Mean Absolute Error - average absolute difference between predictions and actual values',
                'range': '0 to ∞ (lower is better)',
                'interpretation': 'Average prediction error in the same units as the target variable'
            },
            'RMSE': {
                'description': 'Root Mean Squared Error - square root of average squared differences',
                'range': '0 to ∞ (lower is better)',
                'interpretation': 'Penalizes large errors more than MAE, in same units as target'
            },
            'Overfitting': {
                'description': 'Difference between training and testing R² scores',
                'range': '-∞ to ∞ (closer to 0 is better)',
                'interpretation': 'Large positive values indicate overfitting'
            }
        }
    
    @staticmethod
    def get_model_recommendations(metrics_df: pd.DataFrame) -> Dict[str, str]:
        """
        Provide model recommendations based on performance metrics.
        
        Args:
            metrics_df: DataFrame with model evaluation metrics
            
        Returns:
            Dictionary with recommendations
        """
        if metrics_df.empty:
            return {}
        
        # Find best model by test R²
        best_model = metrics_df.loc[metrics_df['Test R²'].idxmax(), 'Model']
        best_r2 = metrics_df.loc[metrics_df['Test R²'].idxmax(), 'Test R²']
        
        # Find model with least overfitting
        least_overfit = metrics_df.loc[metrics_df['Overfitting'].idxmin(), 'Model']
        overfit_score = metrics_df.loc[metrics_df['Overfitting'].idxmin(), 'Overfitting']
        
        # Find fastest model (assuming Linear Regression is fastest)
        simplest_model = 'Linear Regression' if 'Linear Regression' in metrics_df['Model'].values else metrics_df.iloc[0]['Model']
        
        recommendations = {
            'best_performance': f"{best_model} (R² = {best_r2:.4f})",
            'least_overfitting': f"{least_overfit} (Overfit score = {overfit_score:.4f})",
            'simplest_model': simplest_model,
            'recommendation': ""
        }
        
        # Generate overall recommendation
        if best_r2 > 0.8:
            recommendations['recommendation'] = f"Excellent performance! {best_model} achieves R² > 0.8"
        elif best_r2 > 0.6:
            recommendations['recommendation'] = f"Good performance. {best_model} explains {best_r2*100:.1f}% of variance"
        elif best_r2 > 0.4:
            recommendations['recommendation'] = f"Moderate performance. Consider feature engineering or more data"
        else:
            recommendations['recommendation'] = f"Poor performance. Review data quality and feature selection"
        
        return recommendations
