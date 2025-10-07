import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

# Configure page
st.set_page_config(
    page_title="🏠 House Price Prediction ML Tutorial",
    page_icon="🏠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
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
    .stAlert {
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)

class HousePricePredictionApp:
    def __init__(self):
        self.data = None
        self.features = None
        self.target = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.models = {}
        self.predictions = {}
        self.scaler = StandardScaler()
        
    def load_data(self):
        """Load the California Housing dataset with SSL error handling"""
        try:
            from data_utils import load_california_housing
            self.data, self.feature_descriptions = load_california_housing()
            self.features = [col for col in self.data.columns if col != 'MedHouseVal']
            self.target = 'MedHouseVal'
            return self.data
        except Exception as e:
            st.error(f"Error loading data: {str(e)}")
            st.info("This might be due to SSL certificate issues. The app will use synthetic data instead.")
            # Fallback to synthetic data is handled in data_utils.py
            return None
    
    def display_data_overview(self):
        """Display dataset overview and basic statistics"""
        st.markdown('<h2 class="section-header">📊 Dataset Overview</h2>', unsafe_allow_html=True)
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Samples", len(self.data))
        with col2:
            st.metric("Features", len(self.features))
        with col3:
            st.metric("Missing Values", self.data.isnull().sum().sum())
        
        # Dataset preview
        st.subheader("📋 Dataset Preview")
        st.dataframe(self.data.head(10), use_container_width=True)
        
        # Feature descriptions
        st.subheader("📝 Feature Descriptions")
        desc_df = pd.DataFrame(list(self.feature_descriptions.items()), 
                              columns=['Feature', 'Description'])
        st.dataframe(desc_df, use_container_width=True, hide_index=True)
        
        # Basic statistics
        st.subheader("📈 Statistical Summary")
        st.dataframe(self.data.describe(), use_container_width=True)
        
        # Educational insight
        st.markdown("""
        <div class="insight-box">
        <h4>🎓 Educational Insight: Understanding Your Data</h4>
        <p>Before building any ML model, it's crucial to understand your data. The statistical summary above shows:</p>
        <ul>
            <li><strong>Count:</strong> Number of non-null values in each column</li>
            <li><strong>Mean & Std:</strong> Central tendency and spread of the data</li>
            <li><strong>Min/Max:</strong> Range of values, helpful for identifying outliers</li>
            <li><strong>25%, 50%, 75%:</strong> Quartiles that show data distribution</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)
    
    def exploratory_data_analysis(self):
        """Perform and display EDA"""
        st.markdown('<h2 class="section-header">🔍 Exploratory Data Analysis (EDA)</h2>', unsafe_allow_html=True)
        
        # Correlation heatmap
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("🔥 Feature Correlation Heatmap")
            fig, ax = plt.subplots(figsize=(10, 8))
            correlation_matrix = self.data.corr()
            sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, ax=ax)
            plt.title('Feature Correlation Matrix')
            plt.tight_layout()
            st.pyplot(fig)
            plt.close()
        
        with col2:
            st.subheader("📊 Target Variable Distribution")
            fig, ax = plt.subplots(figsize=(10, 6))
            plt.hist(self.data[self.target], bins=50, alpha=0.7, color='skyblue', edgecolor='black')
            plt.title('Distribution of House Prices')
            plt.xlabel('Median House Value (hundreds of thousands $)')
            plt.ylabel('Frequency')
            plt.grid(True, alpha=0.3)
            st.pyplot(fig)
            plt.close()
        
        # Feature distributions
        st.subheader("📈 Feature Distributions")
        
        # Select features to visualize
        selected_features = st.multiselect(
            "Select features to visualize:",
            self.features,
            default=self.features[:4]
        )
        
        if selected_features:
            n_features = len(selected_features)
            cols = min(2, n_features)
            rows = (n_features + 1) // 2
            
            fig, axes = plt.subplots(rows, cols, figsize=(15, 5*rows))
            if rows == 1:
                axes = [axes] if cols == 1 else axes
            else:
                axes = axes.flatten()
            
            for i, feature in enumerate(selected_features):
                ax = axes[i] if n_features > 1 else axes
                self.data[feature].hist(bins=30, alpha=0.7, ax=ax, color='lightcoral')
                ax.set_title(f'Distribution of {feature}')
                ax.set_xlabel(feature)
                ax.set_ylabel('Frequency')
                ax.grid(True, alpha=0.3)
            
            # Hide empty subplots
            for i in range(n_features, len(axes)):
                axes[i].set_visible(False)
            
            plt.tight_layout()
            st.pyplot(fig)
            plt.close()
        
        # Scatter plots with target
        st.subheader("🎯 Feature vs Target Relationships")
        feature_for_scatter = st.selectbox(
            "Select a feature to plot against house prices:",
            self.features,
            index=0
        )
        
        fig, ax = plt.subplots(figsize=(10, 6))
        plt.scatter(self.data[feature_for_scatter], self.data[self.target], 
                   alpha=0.5, color='darkgreen')
        plt.xlabel(feature_for_scatter)
        plt.ylabel('House Price (hundreds of thousands $)')
        plt.title(f'{feature_for_scatter} vs House Price')
        plt.grid(True, alpha=0.3)
        
        # Add correlation coefficient
        correlation = self.data[feature_for_scatter].corr(self.data[self.target])
        plt.text(0.05, 0.95, f'Correlation: {correlation:.3f}', 
                transform=ax.transAxes, fontsize=12, 
                bbox=dict(boxstyle="round", facecolor='wheat', alpha=0.8))
        
        st.pyplot(fig)
        plt.close()
        
        # Educational insight
        st.markdown("""
        <div class="insight-box">
        <h4>🎓 Educational Insight: EDA Importance</h4>
        <p>Exploratory Data Analysis helps us:</p>
        <ul>
            <li><strong>Understand relationships:</strong> Correlation heatmap shows how features relate to each other and the target</li>
            <li><strong>Identify patterns:</strong> Distribution plots reveal data skewness, outliers, and normality</li>
            <li><strong>Feature selection:</strong> Strong correlations with target variable indicate potentially useful features</li>
            <li><strong>Data quality:</strong> Helps identify missing values, outliers, and data inconsistencies</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)
    
    def data_preprocessing(self):
        """Handle data preprocessing with user options"""
        st.markdown('<h2 class="section-header">🛠️ Data Preprocessing</h2>', unsafe_allow_html=True)
        
        # Preprocessing options
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("⚙️ Preprocessing Options")
            
            # Test size selection
            test_size = st.slider("Test Set Size", 0.1, 0.5, 0.2, 0.05)
            
            # Scaling option
            scale_features = st.checkbox("Scale Features (Standardization)", value=True)
            
            # Random state
            random_state = st.number_input("Random State (for reproducibility)", 
                                         value=42, min_value=0, max_value=1000)
        
        with col2:
            st.subheader("📊 Data Split Information")
            total_samples = len(self.data)
            train_samples = int(total_samples * (1 - test_size))
            test_samples = total_samples - train_samples
            
            st.metric("Training Samples", train_samples)
            st.metric("Testing Samples", test_samples)
            st.metric("Train/Test Ratio", f"{(1-test_size)*100:.1f}% / {test_size*100:.1f}%")
        
        # Perform preprocessing
        if st.button("🚀 Execute Preprocessing", type="primary"):
            with st.spinner("Processing data..."):
                # Prepare features and target
                X = self.data[self.features]
                y = self.data[self.target]
                
                # Split the data
                self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
                    X, y, test_size=test_size, random_state=random_state
                )
                
                # Scale features if selected
                if scale_features:
                    self.X_train = self.scaler.fit_transform(self.X_train)
                    self.X_test = self.scaler.transform(self.X_test)
                    
                    # Convert back to DataFrame for better handling
                    self.X_train = pd.DataFrame(self.X_train, columns=self.features)
                    self.X_test = pd.DataFrame(self.X_test, columns=self.features)
                
                st.success("✅ Data preprocessing completed successfully!")
                
                # Display preprocessing results
                st.subheader("📋 Preprocessing Results")
                
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.write("**Training Set Shape:**")
                    st.write(f"Features: {self.X_train.shape}")
                    st.write(f"Target: {self.y_train.shape}")
                
                with col2:
                    st.write("**Testing Set Shape:**")
                    st.write(f"Features: {self.X_test.shape}")
                    st.write(f"Target: {self.y_test.shape}")
                
                with col3:
                    st.write("**Scaling Applied:**")
                    st.write(f"Standardization: {'✅' if scale_features else '❌'}")
                
                # Show sample of processed data
                st.subheader("👀 Sample of Processed Training Data")
                sample_df = pd.DataFrame(self.X_train.head())
                sample_df['Target'] = self.y_train.head().values
                st.dataframe(sample_df, use_container_width=True)
        
        # Educational insight
        st.markdown("""
        <div class="insight-box">
        <h4>🎓 Educational Insight: Why Preprocessing Matters</h4>
        <p>Data preprocessing is crucial for ML success:</p>
        <ul>
            <li><strong>Train/Test Split:</strong> Separates data to evaluate model performance on unseen data</li>
            <li><strong>Feature Scaling:</strong> Ensures all features contribute equally to the model (especially important for distance-based algorithms)</li>
            <li><strong>Random State:</strong> Makes results reproducible by controlling randomness in data splitting</li>
            <li><strong>Data Quality:</strong> Clean, well-prepared data leads to better model performance</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)
    
    def model_training(self):
        """Train different ML models with hyperparameter options"""
        st.markdown('<h2 class="section-header">🤖 Model Training</h2>', unsafe_allow_html=True)
        
        if self.X_train is None:
            st.warning("⚠️ Please complete data preprocessing first!")
            return
        
        # Model selection and hyperparameters
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.subheader("🎯 Select Models to Train")
            
            # Model selection
            train_lr = st.checkbox("Linear Regression", value=True)
            train_rf = st.checkbox("Random Forest", value=True)
            train_gb = st.checkbox("Gradient Boosting", value=True)
        
        with col2:
            st.subheader("⚙️ Hyperparameter Configuration")
            
            # Random Forest hyperparameters
            if train_rf:
                st.write("**Random Forest Parameters:**")
                rf_n_estimators = st.slider("Number of Trees", 10, 200, 100, 10)
                rf_max_depth = st.slider("Max Depth", 3, 20, 10)
                rf_random_state = 42
            
            # Gradient Boosting hyperparameters
            if train_gb:
                st.write("**Gradient Boosting Parameters:**")
                gb_n_estimators = st.slider("Number of Estimators", 50, 300, 100, 25)
                gb_learning_rate = st.slider("Learning Rate", 0.01, 0.3, 0.1, 0.01)
                gb_max_depth = st.slider("Max Depth (GB)", 3, 10, 6)
        
        # Train models
        if st.button("🚀 Train Selected Models", type="primary"):
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            trained_models = []
            
            # Linear Regression
            if train_lr:
                status_text.text("Training Linear Regression...")
                progress_bar.progress(0.2)
                
                lr_model = LinearRegression()
                lr_model.fit(self.X_train, self.y_train)
                self.models['Linear Regression'] = lr_model
                trained_models.append('Linear Regression')
            
            # Random Forest
            if train_rf:
                status_text.text("Training Random Forest...")
                progress_bar.progress(0.5)
                
                rf_model = RandomForestRegressor(
                    n_estimators=rf_n_estimators,
                    max_depth=rf_max_depth,
                    random_state=rf_random_state
                )
                rf_model.fit(self.X_train, self.y_train)
                self.models['Random Forest'] = rf_model
                trained_models.append('Random Forest')
            
            # Gradient Boosting
            if train_gb:
                status_text.text("Training Gradient Boosting...")
                progress_bar.progress(0.8)
                
                gb_model = GradientBoostingRegressor(
                    n_estimators=gb_n_estimators,
                    learning_rate=gb_learning_rate,
                    max_depth=gb_max_depth,
                    random_state=42
                )
                gb_model.fit(self.X_train, self.y_train)
                self.models['Gradient Boosting'] = gb_model
                trained_models.append('Gradient Boosting')
            
            progress_bar.progress(1.0)
            status_text.text("Training completed!")
            
            st.success(f"✅ Successfully trained {len(trained_models)} models: {', '.join(trained_models)}")
            
            # Display model information
            st.subheader("🔍 Trained Models Overview")
            
            for model_name in trained_models:
                with st.expander(f"{model_name} Details"):
                    model = self.models[model_name]
                    
                    if model_name == 'Linear Regression':
                        st.write("**Model Type:** Linear Regression")
                        st.write("**Key Characteristics:**")
                        st.write("- Simple, interpretable model")
                        st.write("- Assumes linear relationship between features and target")
                        st.write("- Fast training and prediction")
                        st.write("- Good baseline model")
                        
                    elif model_name == 'Random Forest':
                        st.write("**Model Type:** Random Forest Regressor")
                        st.write("**Key Characteristics:**")
                        st.write("- Ensemble of decision trees")
                        st.write("- Handles non-linear relationships well")
                        st.write("- Resistant to overfitting")
                        st.write("- Provides feature importance")
                        st.write(f"- Number of trees: {rf_n_estimators}")
                        st.write(f"- Max depth: {rf_max_depth}")
                        
                    elif model_name == 'Gradient Boosting':
                        st.write("**Model Type:** Gradient Boosting Regressor")
                        st.write("**Key Characteristics:**")
                        st.write("- Sequential ensemble method")
                        st.write("- Often achieves high accuracy")
                        st.write("- Can capture complex patterns")
                        st.write("- Requires careful hyperparameter tuning")
                        st.write(f"- Number of estimators: {gb_n_estimators}")
                        st.write(f"- Learning rate: {gb_learning_rate}")
                        st.write(f"- Max depth: {gb_max_depth}")
        
        # Educational insight
        st.markdown("""
        <div class="insight-box">
        <h4>🎓 Educational Insight: Understanding ML Algorithms</h4>
        <p>Each algorithm has different strengths:</p>
        <ul>
            <li><strong>Linear Regression:</strong> Best for linear relationships, interpretable, fast</li>
            <li><strong>Random Forest:</strong> Handles non-linearity, feature interactions, resistant to overfitting</li>
            <li><strong>Gradient Boosting:</strong> Often highest accuracy, captures complex patterns, requires tuning</li>
        </ul>
        <p>Hyperparameters control model complexity and performance. Experiment with different values!</p>
        </div>
        """, unsafe_allow_html=True)
    
    def model_evaluation(self):
        """Evaluate trained models and display results"""
        st.markdown('<h2 class="section-header">📊 Model Evaluation</h2>', unsafe_allow_html=True)
        
        if not self.models:
            st.warning("⚠️ Please train at least one model first!")
            return
        
        # Generate predictions for all models
        for model_name, model in self.models.items():
            train_pred = model.predict(self.X_train)
            test_pred = model.predict(self.X_test)
            
            self.predictions[model_name] = {
                'train': train_pred,
                'test': test_pred
            }
        
        # Calculate metrics
        st.subheader("📈 Performance Metrics")
        
        metrics_data = []
        for model_name in self.models.keys():
            train_pred = self.predictions[model_name]['train']
            test_pred = self.predictions[model_name]['test']
            
            # Calculate metrics
            train_r2 = r2_score(self.y_train, train_pred)
            test_r2 = r2_score(self.y_test, test_pred)
            train_mae = mean_absolute_error(self.y_train, train_pred)
            test_mae = mean_absolute_error(self.y_test, test_pred)
            train_rmse = np.sqrt(mean_squared_error(self.y_train, train_pred))
            test_rmse = np.sqrt(mean_squared_error(self.y_test, test_pred))
            
            metrics_data.append({
                'Model': model_name,
                'Train R²': f"{train_r2:.4f}",
                'Test R²': f"{test_r2:.4f}",
                'Train MAE': f"{train_mae:.4f}",
                'Test MAE': f"{test_mae:.4f}",
                'Train RMSE': f"{train_rmse:.4f}",
                'Test RMSE': f"{test_rmse:.4f}"
            })
        
        metrics_df = pd.DataFrame(metrics_data)
        st.dataframe(metrics_df, use_container_width=True, hide_index=True)
        
        # Visualizations
        st.subheader("📊 Performance Visualizations")
        
        # Model comparison
        tab1, tab2, tab3 = st.tabs(["📊 Metrics Comparison", "🎯 Predictions vs Actual", "📈 Residual Analysis"])
        
        with tab1:
            # Metrics comparison chart
            col1, col2 = st.columns(2)
            
            with col1:
                # R² Score comparison
                r2_scores = [float(row['Test R²']) for row in metrics_data]
                model_names = [row['Model'] for row in metrics_data]
                
                fig, ax = plt.subplots(figsize=(10, 6))
                bars = plt.bar(model_names, r2_scores, color=['skyblue', 'lightcoral', 'lightgreen'])
                plt.title('R² Score Comparison (Test Set)')
                plt.ylabel('R² Score')
                plt.xticks(rotation=45)
                plt.grid(True, alpha=0.3)
                
                # Add value labels on bars
                for bar, score in zip(bars, r2_scores):
                    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                            f'{score:.3f}', ha='center', va='bottom')
                
                plt.tight_layout()
                st.pyplot(fig)
                plt.close()
            
            with col2:
                # RMSE comparison
                rmse_scores = [float(row['Test RMSE']) for row in metrics_data]
                
                fig, ax = plt.subplots(figsize=(10, 6))
                bars = plt.bar(model_names, rmse_scores, color=['orange', 'purple', 'brown'])
                plt.title('RMSE Comparison (Test Set)')
                plt.ylabel('RMSE')
                plt.xticks(rotation=45)
                plt.grid(True, alpha=0.3)
                
                # Add value labels on bars
                for bar, score in zip(bars, rmse_scores):
                    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                            f'{score:.3f}', ha='center', va='bottom')
                
                plt.tight_layout()
                st.pyplot(fig)
                plt.close()
        
        with tab2:
            # Predictions vs Actual plots
            selected_model = st.selectbox("Select model for detailed analysis:", 
                                        list(self.models.keys()))
            
            if selected_model:
                test_pred = self.predictions[selected_model]['test']
                
                col1, col2 = st.columns(2)
                
                with col1:
                    # Scatter plot: Predictions vs Actual
                    fig, ax = plt.subplots(figsize=(10, 8))
                    plt.scatter(self.y_test, test_pred, alpha=0.6, color='darkblue')
                    
                    # Perfect prediction line
                    min_val = min(min(self.y_test), min(test_pred))
                    max_val = max(max(self.y_test), max(test_pred))
                    plt.plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')
                    
                    plt.xlabel('Actual House Prices')
                    plt.ylabel('Predicted House Prices')
                    plt.title(f'{selected_model}: Predictions vs Actual')
                    plt.legend()
                    plt.grid(True, alpha=0.3)
                    
                    # Add R² score
                    r2 = r2_score(self.y_test, test_pred)
                    plt.text(0.05, 0.95, f'R² = {r2:.3f}', transform=ax.transAxes, 
                            fontsize=12, bbox=dict(boxstyle="round", facecolor='wheat', alpha=0.8))
                    
                    st.pyplot(fig)
                    plt.close()
                
                with col2:
                    # Distribution of predictions vs actual
                    fig, ax = plt.subplots(figsize=(10, 8))
                    
                    plt.hist(self.y_test, bins=30, alpha=0.7, label='Actual', color='skyblue', density=True)
                    plt.hist(test_pred, bins=30, alpha=0.7, label='Predicted', color='lightcoral', density=True)
                    
                    plt.xlabel('House Prices')
                    plt.ylabel('Density')
                    plt.title(f'{selected_model}: Distribution Comparison')
                    plt.legend()
                    plt.grid(True, alpha=0.3)
                    
                    st.pyplot(fig)
                    plt.close()
        
        with tab3:
            # Residual analysis
            if selected_model:
                test_pred = self.predictions[selected_model]['test']
                residuals = self.y_test - test_pred
                
                col1, col2 = st.columns(2)
                
                with col1:
                    # Residual plot
                    fig, ax = plt.subplots(figsize=(10, 8))
                    plt.scatter(test_pred, residuals, alpha=0.6, color='green')
                    plt.axhline(y=0, color='red', linestyle='--', linewidth=2)
                    plt.xlabel('Predicted Values')
                    plt.ylabel('Residuals (Actual - Predicted)')
                    plt.title(f'{selected_model}: Residual Plot')
                    plt.grid(True, alpha=0.3)
                    
                    st.pyplot(fig)
                    plt.close()
                
                with col2:
                    # Residual distribution
                    fig, ax = plt.subplots(figsize=(10, 8))
                    plt.hist(residuals, bins=30, alpha=0.7, color='orange', edgecolor='black')
                    plt.axvline(x=0, color='red', linestyle='--', linewidth=2)
                    plt.xlabel('Residuals')
                    plt.ylabel('Frequency')
                    plt.title(f'{selected_model}: Residual Distribution')
                    plt.grid(True, alpha=0.3)
                    
                    # Add statistics
                    mean_residual = np.mean(residuals)
                    std_residual = np.std(residuals)
                    plt.text(0.05, 0.95, f'Mean: {mean_residual:.3f}\nStd: {std_residual:.3f}', 
                            transform=ax.transAxes, fontsize=12, 
                            bbox=dict(boxstyle="round", facecolor='wheat', alpha=0.8))
                    
                    st.pyplot(fig)
                    plt.close()
        
        # Best model recommendation
        st.subheader("🏆 Model Recommendation")
        
        # Find best model based on test R²
        best_model_idx = np.argmax([float(row['Test R²']) for row in metrics_data])
        best_model = metrics_data[best_model_idx]['Model']
        best_r2 = metrics_data[best_model_idx]['Test R²']
        
        st.success(f"🥇 **Best performing model:** {best_model} (R² = {best_r2})")
        
        # Educational insight
        st.markdown("""
        <div class="insight-box">
        <h4>🎓 Educational Insight: Understanding Model Evaluation</h4>
        <p>Key evaluation concepts:</p>
        <ul>
            <li><strong>R² Score:</strong> Proportion of variance explained (higher is better, max = 1.0)</li>
            <li><strong>MAE:</strong> Average absolute prediction error (lower is better)</li>
            <li><strong>RMSE:</strong> Root mean squared error, penalizes large errors (lower is better)</li>
            <li><strong>Residuals:</strong> Difference between actual and predicted values</li>
            <li><strong>Overfitting:</strong> When train performance >> test performance</li>
        </ul>
        <p>Good models show: high R², low MAE/RMSE, similar train/test performance, and randomly distributed residuals.</p>
        </div>
        """, unsafe_allow_html=True)
    
    def feature_importance_analysis(self):
        """Analyze and display feature importance for tree-based models"""
        st.markdown('<h2 class="section-header">🎯 Feature Importance Analysis</h2>', unsafe_allow_html=True)
        
        # Check if we have tree-based models
        tree_models = {name: model for name, model in self.models.items() 
                      if hasattr(model, 'feature_importances_')}
        
        if not tree_models:
            st.info("ℹ️ Feature importance is only available for tree-based models (Random Forest, Gradient Boosting)")
            return
        
        for model_name, model in tree_models.items():
            st.subheader(f"📊 {model_name} - Feature Importance")
            
            # Get feature importance
            importance = model.feature_importances_
            feature_names = self.features
            
            # Create DataFrame for better visualization
            importance_df = pd.DataFrame({
                'Feature': feature_names,
                'Importance': importance
            }).sort_values('Importance', ascending=False)
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Bar plot
                fig, ax = plt.subplots(figsize=(10, 8))
                bars = plt.barh(importance_df['Feature'][::-1], importance_df['Importance'][::-1])
                plt.xlabel('Feature Importance')
                plt.title(f'{model_name} - Feature Importance')
                plt.grid(True, alpha=0.3)
                
                # Color bars based on importance
                for i, bar in enumerate(bars):
                    bar.set_color(plt.cm.viridis(importance_df['Importance'].iloc[-(i+1)] / importance_df['Importance'].max()))
                
                plt.tight_layout()
                st.pyplot(fig)
                plt.close()
            
            with col2:
                # Data table
                st.dataframe(importance_df, use_container_width=True, hide_index=True)
                
                # Top 3 features
                st.write("**Top 3 Most Important Features:**")
                for i, (_, row) in enumerate(importance_df.head(3).iterrows()):
                    st.write(f"{i+1}. {row['Feature']}: {row['Importance']:.4f}")
        
        # Educational insight
        st.markdown("""
        <div class="insight-box">
        <h4>🎓 Educational Insight: Feature Importance</h4>
        <p>Feature importance helps us understand:</p>
        <ul>
            <li><strong>Which features drive predictions:</strong> Higher importance = more influential</li>
            <li><strong>Model interpretability:</strong> Understand what the model considers important</li>
            <li><strong>Feature selection:</strong> Remove less important features to simplify the model</li>
            <li><strong>Domain validation:</strong> Check if important features make business sense</li>
        </ul>
        <p>Note: Feature importance can vary between models and doesn't always indicate causation!</p>
        </div>
        """, unsafe_allow_html=True)

def main():
    # App title and description
    st.markdown('<h1 class="main-header">🏠 House Price Prediction ML Tutorial</h1>', unsafe_allow_html=True)
    
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <p style="font-size: 1.2rem; color: #666;">
        Learn Machine Learning by building a complete house price prediction system!<br>
        This interactive tutorial covers the entire ML workflow from data exploration to model evaluation.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Initialize the app
    if 'ml_app' not in st.session_state:
        st.session_state.ml_app = HousePricePredictionApp()
    
    app = st.session_state.ml_app
    
    # Sidebar navigation
    st.sidebar.title("🧭 Navigation")
    
    # Load data button
    if st.sidebar.button("📥 Load Dataset", type="primary"):
        with st.spinner("Loading California Housing dataset..."):
            app.load_data()
        st.sidebar.success("✅ Dataset loaded successfully!")
    
    # Check if data is loaded
    if app.data is None:
        st.info("👆 Please load the dataset first using the sidebar button!")
        return
    
    # Navigation options
    page = st.sidebar.selectbox(
        "Choose a section:",
        [
            "📊 Data Overview",
            "🔍 Exploratory Data Analysis", 
            "🛠️ Data Preprocessing",
            "🤖 Model Training",
            "📊 Model Evaluation",
            "🎯 Feature Importance"
        ]
    )
    
    # Display selected page
    if page == "📊 Data Overview":
        app.display_data_overview()
    elif page == "🔍 Exploratory Data Analysis":
        app.exploratory_data_analysis()
    elif page == "🛠️ Data Preprocessing":
        app.data_preprocessing()
    elif page == "🤖 Model Training":
        app.model_training()
    elif page == "📊 Model Evaluation":
        app.model_evaluation()
    elif page == "🎯 Feature Importance":
        app.feature_importance_analysis()
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #666; margin-top: 2rem;">
        <p>🎓 <strong>Educational ML Tutorial</strong> | Built with Streamlit, Scikit-learn & ❤️</p>
        <p>Perfect for learning the fundamentals of machine learning and data science!</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
