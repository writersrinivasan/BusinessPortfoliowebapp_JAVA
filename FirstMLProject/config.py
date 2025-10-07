"""
Configuration settings for the House Price Prediction ML Tutorial
"""

# App Configuration
APP_CONFIG = {
    'title': '🏠 House Price Prediction ML Tutorial',
    'page_icon': '🏠',
    'layout': 'wide',
    'initial_sidebar_state': 'expanded'
}

# Model Configuration
MODEL_CONFIG = {
    'Linear Regression': {
        'class': 'LinearRegression',
        'hyperparameters': {},
        'description': 'Simple linear model assuming linear relationships between features and target'
    },
    'Random Forest': {
        'class': 'RandomForestRegressor',
        'hyperparameters': {
            'n_estimators': {'min': 10, 'max': 200, 'default': 100, 'step': 10},
            'max_depth': {'min': 3, 'max': 20, 'default': 10, 'step': 1},
            'random_state': 42
        },
        'description': 'Ensemble of decision trees that reduces overfitting'
    },
    'Gradient Boosting': {
        'class': 'GradientBoostingRegressor',
        'hyperparameters': {
            'n_estimators': {'min': 50, 'max': 300, 'default': 100, 'step': 25},
            'learning_rate': {'min': 0.01, 'max': 0.3, 'default': 0.1, 'step': 0.01},
            'max_depth': {'min': 3, 'max': 10, 'default': 6, 'step': 1},
            'random_state': 42
        },
        'description': 'Sequential ensemble that often achieves high accuracy'
    }
}

# Data Configuration
DATA_CONFIG = {
    'test_size': {'min': 0.1, 'max': 0.5, 'default': 0.2, 'step': 0.05},
    'random_state': {'min': 0, 'max': 1000, 'default': 42},
    'scaling_options': ['None', 'StandardScaler', 'MinMaxScaler'],
    'max_features_display': 8
}

# Visualization Configuration
VIZ_CONFIG = {
    'color_palette': ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
    'figure_size': {
        'small': (8, 6),
        'medium': (10, 8),
        'large': (12, 10)
    },
    'plot_style': 'whitegrid'
}

# Educational Content
EDUCATIONAL_CONTENT = {
    'data_overview': {
        'title': '📊 Understanding Your Data',
        'content': """
        Before building any ML model, it's crucial to understand your data. Key steps include:
        
        • **Dataset Size**: Check number of samples and features
        • **Data Types**: Understand numerical vs categorical features  
        • **Missing Values**: Identify and plan how to handle them
        • **Statistical Summary**: Review mean, std, min/max values
        • **Target Distribution**: Understand what you're trying to predict
        """
    },
    'eda': {
        'title': '🔍 Exploratory Data Analysis',
        'content': """
        EDA helps us discover patterns and relationships in data:
        
        • **Correlations**: How features relate to each other and target
        • **Distributions**: Shape of data (normal, skewed, outliers)
        • **Relationships**: Linear vs non-linear patterns
        • **Feature Importance**: Which variables might be most predictive
        """
    },
    'preprocessing': {
        'title': '🛠️ Data Preprocessing',
        'content': """
        Proper preprocessing is essential for ML success:
        
        • **Train/Test Split**: Evaluate performance on unseen data
        • **Feature Scaling**: Ensure features contribute equally
        • **Missing Values**: Handle gaps in data appropriately
        • **Encoding**: Convert categorical variables to numbers
        """
    },
    'training': {
        'title': '🤖 Model Training',
        'content': """
        Different algorithms have different strengths:
        
        • **Linear Regression**: Simple, interpretable, good baseline
        • **Random Forest**: Handles non-linearity, robust, feature importance
        • **Gradient Boosting**: High accuracy, complex patterns, needs tuning
        """
    },
    'evaluation': {
        'title': '📊 Model Evaluation',
        'content': """
        Multiple metrics provide different insights:
        
        • **R² Score**: Proportion of variance explained (0-1, higher better)
        • **MAE**: Average prediction error (lower better)
        • **RMSE**: Penalizes large errors more (lower better)
        • **Residuals**: Pattern analysis for model assumptions
        """
    }
}

# Metric Definitions
METRICS_INFO = {
    'r2_score': {
        'name': 'R² Score',
        'description': 'Coefficient of determination',
        'interpretation': 'Proportion of variance in target explained by model',
        'range': '0 to 1',
        'better': 'higher'
    },
    'mae': {
        'name': 'Mean Absolute Error',
        'description': 'Average absolute difference between predicted and actual values',
        'interpretation': 'Average prediction error in original units',
        'range': '0 to ∞',
        'better': 'lower'
    },
    'rmse': {
        'name': 'Root Mean Squared Error', 
        'description': 'Square root of average squared differences',
        'interpretation': 'Prediction error that penalizes large mistakes more',
        'range': '0 to ∞',
        'better': 'lower'
    }
}

# UI Styling
CUSTOM_CSS = """
<style>
    .main-header {
        font-size: 3rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    .section-header {
        font-size: 2rem;
        color: #ff7f0e;
        margin-top: 2rem;
        margin-bottom: 1rem;
        border-bottom: 2px solid #ff7f0e;
        padding-bottom: 0.5rem;
    }
    .metric-container {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 10px;
        margin: 0.5rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .insight-box {
        background-color: #e8f4f8;
        padding: 1rem;
        border-left: 4px solid #1f77b4;
        margin: 1rem 0;
        border-radius: 5px;
    }
    .warning-box {
        background-color: #fff3cd;
        padding: 1rem;
        border-left: 4px solid #ffc107;
        margin: 1rem 0;
        border-radius: 5px;
    }
    .success-box {
        background-color: #d4edda;
        padding: 1rem;
        border-left: 4px solid #28a745;
        margin: 1rem 0;
        border-radius: 5px;
    }
    .stAlert {
        margin-top: 1rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        margin: 0.5rem;
    }
</style>
"""

# Default hyperparameters for quick start
DEFAULT_HYPERPARAMETERS = {
    'Random Forest': {
        'n_estimators': 100,
        'max_depth': 10,
        'random_state': 42
    },
    'Gradient Boosting': {
        'n_estimators': 100,
        'learning_rate': 0.1,
        'max_depth': 6,
        'random_state': 42
    }
}

# Feature importance thresholds
FEATURE_IMPORTANCE_CONFIG = {
    'top_features_display': 10,
    'importance_threshold': 0.01,
    'color_map': 'viridis'
}

# Cross-validation settings
CV_CONFIG = {
    'n_folds': 5,
    'random_state': 42,
    'scoring': ['r2', 'neg_mean_absolute_error', 'neg_root_mean_squared_error']
}
