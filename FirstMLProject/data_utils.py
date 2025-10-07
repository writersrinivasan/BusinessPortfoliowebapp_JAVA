"""
Data utilities for the House Price Prediction ML Tutorial
This module provides functions to load and prepare datasets for the ML tutorial.
"""

import pandas as pd
import numpy as np
from sklearn.datasets import fetch_california_housing
from typing import Tuple, Dict, Optional
import ssl
import urllib.request

def load_california_housing() -> Tuple[pd.DataFrame, Dict[str, str]]:
    """
    Load the California Housing dataset from scikit-learn.
    Handles SSL certificate issues on macOS.
    
    Returns:
        Tuple containing:
        - DataFrame with features and target
        - Dictionary with feature descriptions
    """
    try:
        # Try to load normally first
        california_housing = fetch_california_housing(as_frame=True)
        data = california_housing.frame
    except Exception as e:
        if "CERTIFICATE_VERIFY_FAILED" in str(e):
            print("SSL certificate issue detected. Using alternative approach...")
            
            # Create SSL context that doesn't verify certificates
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            # Install the custom SSL context
            https_handler = urllib.request.HTTPSHandler(context=ssl_context)
            opener = urllib.request.build_opener(https_handler)
            urllib.request.install_opener(opener)
            
            try:
                # Try again with the custom SSL context
                california_housing = fetch_california_housing(as_frame=True)
                data = california_housing.frame
            except Exception as e2:
                print(f"Still unable to download dataset: {e2}")
                print("Creating synthetic data instead...")
                # Create synthetic data as fallback
                return create_synthetic_california_housing()
        else:
            print(f"Error loading dataset: {e}")
            print("Creating synthetic data instead...")
            return create_synthetic_california_housing()
    
    feature_descriptions = {
        'MedInc': 'Median income in block group',
        'HouseAge': 'Median house age in block group',
        'AveRooms': 'Average number of rooms per household',
        'AveBedrms': 'Average number of bedrooms per household',
        'Population': 'Block group population',
        'AveOccup': 'Average number of household members',
        'Latitude': 'Block group latitude',
        'Longitude': 'Block group longitude',
        'MedHouseVal': 'Median house value in hundreds of thousands of dollars'
    }
    
    return data, feature_descriptions

def create_synthetic_california_housing() -> Tuple[pd.DataFrame, Dict[str, str]]:
    """
    Create synthetic California housing data when the real dataset can't be downloaded.
    
    Returns:
        Tuple containing:
        - DataFrame with synthetic features and target
        - Dictionary with feature descriptions
    """
    print("🔧 Creating synthetic California housing dataset...")
    
    np.random.seed(42)
    n_samples = 20640  # Same size as original dataset
    
    # Generate features similar to California housing
    data = {
        'MedInc': np.random.gamma(2, 2, n_samples),  # Median income
        'HouseAge': np.random.uniform(1, 52, n_samples),  # House age
        'AveRooms': np.random.normal(6, 1.5, n_samples),  # Average rooms
        'AveBedrms': np.random.normal(1.1, 0.3, n_samples),  # Average bedrooms
        'Population': np.random.lognormal(6, 1, n_samples),  # Population
        'AveOccup': np.random.gamma(2, 1.5, n_samples),  # Average occupancy
        'Latitude': np.random.uniform(32.5, 42, n_samples),  # Latitude
        'Longitude': np.random.uniform(-124.3, -114.3, n_samples),  # Longitude
    }
    
    df = pd.DataFrame(data)
    
    # Ensure positive values and realistic ranges
    df['MedInc'] = np.clip(df['MedInc'], 0.5, 15)
    df['AveRooms'] = np.clip(df['AveRooms'], 1, 20)
    df['AveBedrms'] = np.clip(df['AveBedrms'], 0.1, 5)
    df['Population'] = np.clip(df['Population'], 3, 35000)
    df['AveOccup'] = np.clip(df['AveOccup'], 0.5, 50)
    
    # Generate target variable based on features (with realistic relationships)
    target = (
        df['MedInc'] * 0.4 +  # Income is important
        (52 - df['HouseAge']) * 0.01 +  # Newer houses worth more
        df['AveRooms'] * 0.1 +  # More rooms = higher value
        (37.5 - df['Latitude']) * 0.05 +  # Southern California premium
        (-119 - df['Longitude']) * 0.02 +  # Coastal premium
        np.random.normal(0, 0.5, n_samples)  # Random noise
    )
    
    # Ensure realistic house values (0.15 to 5.0 in hundreds of thousands)
    df['MedHouseVal'] = np.clip(target, 0.15, 5.0)
    
    feature_descriptions = {
        'MedInc': 'Median income in block group (synthetic)',
        'HouseAge': 'Median house age in block group (synthetic)',
        'AveRooms': 'Average number of rooms per household (synthetic)',
        'AveBedrms': 'Average number of bedrooms per household (synthetic)',
        'Population': 'Block group population (synthetic)',
        'AveOccup': 'Average number of household members (synthetic)',
        'Latitude': 'Block group latitude (synthetic)',
        'Longitude': 'Block group longitude (synthetic)',
        'MedHouseVal': 'Median house value in hundreds of thousands of dollars (synthetic)'
    }
    
    print(f"✅ Created synthetic dataset with {len(df)} samples")
    
    return df, feature_descriptions

def create_sample_housing_data(n_samples: int = 1000) -> pd.DataFrame:
    """
    Create a sample housing dataset for demonstration purposes.
    
    Args:
        n_samples: Number of samples to generate
        
    Returns:
        DataFrame with synthetic housing data
    """
    np.random.seed(42)
    
    # Generate synthetic features
    data = {
        'sqft_living': np.random.normal(2000, 800, n_samples),
        'sqft_lot': np.random.normal(7500, 3000, n_samples),
        'bedrooms': np.random.randint(1, 8, n_samples),
        'bathrooms': np.random.uniform(1, 5, n_samples),
        'floors': np.random.choice([1, 1.5, 2, 2.5, 3], n_samples),
        'waterfront': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
        'view': np.random.randint(0, 5, n_samples),
        'condition': np.random.randint(1, 6, n_samples),
        'grade': np.random.randint(3, 14, n_samples),
        'yr_built': np.random.randint(1900, 2020, n_samples),
        'zipcode': np.random.choice(range(98001, 98200), n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Ensure positive values
    df['sqft_living'] = np.abs(df['sqft_living'])
    df['sqft_lot'] = np.abs(df['sqft_lot'])
    df['bathrooms'] = np.round(df['bathrooms'] * 2) / 2  # Round to nearest 0.5
    
    # Create price based on features (with some noise)
    price = (
        df['sqft_living'] * 150 +
        df['sqft_lot'] * 5 +
        df['bedrooms'] * 10000 +
        df['bathrooms'] * 15000 +
        df['floors'] * 8000 +
        df['waterfront'] * 200000 +
        df['view'] * 20000 +
        df['condition'] * 5000 +
        df['grade'] * 25000 +
        (2020 - df['yr_built']) * -100 +
        np.random.normal(0, 50000, n_samples)
    )
    
    df['price'] = np.maximum(price, 50000)  # Minimum price of $50k
    
    return df

def validate_dataset(df: pd.DataFrame, target_column: str) -> Dict[str, any]:
    """
    Validate a dataset for use in the ML tutorial.
    
    Args:
        df: DataFrame to validate
        target_column: Name of the target column
        
    Returns:
        Dictionary with validation results
    """
    validation_results = {
        'is_valid': True,
        'errors': [],
        'warnings': [],
        'info': {}
    }
    
    # Check if target column exists
    if target_column not in df.columns:
        validation_results['is_valid'] = False
        validation_results['errors'].append(f"Target column '{target_column}' not found in dataset")
        return validation_results
    
    # Basic dataset info
    validation_results['info']['n_samples'] = len(df)
    validation_results['info']['n_features'] = len(df.columns) - 1
    validation_results['info']['missing_values'] = df.isnull().sum().sum()
    
    # Check for minimum requirements
    if len(df) < 100:
        validation_results['warnings'].append("Dataset has fewer than 100 samples, results may not be reliable")
    
    if len(df.columns) < 3:
        validation_results['warnings'].append("Dataset has fewer than 3 columns (including target)")
    
    # Check for missing values
    if df.isnull().sum().sum() > 0:
        validation_results['warnings'].append("Dataset contains missing values")
    
    # Check target variable
    if not pd.api.types.is_numeric_dtype(df[target_column]):
        validation_results['is_valid'] = False
        validation_results['errors'].append("Target variable must be numeric for regression")
    
    # Check for constant features
    constant_features = [col for col in df.columns if df[col].nunique() <= 1]
    if constant_features:
        validation_results['warnings'].append(f"Constant features detected: {constant_features}")
    
    return validation_results

def prepare_custom_dataset(df: pd.DataFrame, target_column: str) -> Tuple[pd.DataFrame, list, str]:
    """
    Prepare a custom dataset for use in the ML tutorial.
    
    Args:
        df: Input DataFrame
        target_column: Name of the target column
        
    Returns:
        Tuple containing:
        - Prepared DataFrame
        - List of feature names
        - Target column name
    """
    # Make a copy to avoid modifying original
    data = df.copy()
    
    # Separate features and target
    features = [col for col in data.columns if col != target_column]
    
    # Basic preprocessing
    # Remove constant columns
    constant_cols = [col for col in features if data[col].nunique() <= 1]
    if constant_cols:
        data = data.drop(columns=constant_cols)
        features = [col for col in features if col not in constant_cols]
    
    # Handle categorical variables (simple label encoding for now)
    for col in features:
        if data[col].dtype == 'object':
            data[col] = pd.Categorical(data[col]).codes
    
    return data, features, target_column

# Sample feature descriptions for common housing features
COMMON_FEATURE_DESCRIPTIONS = {
    'sqft_living': 'Square footage of the homes interior living space',
    'sqft_lot': 'Square footage of the land space',
    'bedrooms': 'Number of bedrooms',
    'bathrooms': 'Number of bathrooms',
    'floors': 'Number of floors (levels) in house',
    'waterfront': 'House which has a view to a waterfront',
    'view': 'Has been viewed (0 to 4 scale)',
    'condition': 'How good the condition is (1 to 5 scale)',
    'grade': 'Overall grade given to the housing unit (1 to 13 scale)',
    'yr_built': 'Built Year',
    'zipcode': 'Zip code',
    'price': 'Price of the house',
    'sqft_above': 'Square footage of house apart from basement',
    'sqft_basement': 'Square footage of the basement',
    'yr_renovated': 'Year when house was renovated',
    'lat': 'Latitude coordinate',
    'long': 'Longitude coordinate',
    'sqft_living15': 'Living room area in 2015',
    'sqft_lot15': 'Lot size area in 2015'
}
