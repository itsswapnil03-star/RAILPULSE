# ──────────────────────────────────────────────────────────────────────
# PRODUCTION NOTES — What would change for a real deployment:
# 
# 1. DATA SOURCE: Replace synthetic CSV with real NTES/PAIMANA historical
#    arrival data, ingested nightly via RailSAVARI or similar API.
# 2. RETRAINING: Automated nightly retrain on rolling 90-day window,
#    triggered by Airflow/Prefect pipeline.
# 3. MODEL VERSIONING: Register models in MLflow; promote via staging→prod.
# 4. DRIFT MONITORING: Track prediction error distribution; alert on KS-test
#    shift > threshold. Monitor feature distributions for covariate shift.
# 5. MODEL UPGRADE PATH: GBR → LightGBM for speed; explore Temporal Fusion
#    Transformer for multi-horizon forecasts (12/24/48h ahead).
# 6. FEATURE STORE: Precompute real-time congestion from live train density;
#    integrate weather API (IMD) for actual forecasts, not historical.
# ──────────────────────────────────────────────────────────────────────
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from pathlib import Path

def train():
    df = pd.read_csv('data/historical_runs.csv')
    
    y = df['actual_delay_minutes']
    X = df.drop(columns=['actual_delay_minutes', 'train_number', 'run_date', 'station_code'])
    X['is_monsoon'] = X['is_monsoon'].astype(int)
    X = pd.get_dummies(X, columns=['weather_condition', 'train_type'], dtype=int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(list(X.columns), 'models/feature_columns.joblib')
    
    print("Training median model...")
    model_median = GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
    model_median.fit(X_train, y_train)
    
    print("Training lower bound model...")
    model_lower = GradientBoostingRegressor(loss='quantile', alpha=0.05, n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
    model_lower.fit(X_train, y_train)
    
    print("Training upper bound model...")
    model_upper = GradientBoostingRegressor(loss='quantile', alpha=0.95, n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
    model_upper.fit(X_train, y_train)
    
    y_pred = model_median.predict(X_test)
    print(f"MAE: {mean_absolute_error(y_test, y_pred):.2f}")
    print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.2f}")
    print(f"R²: {r2_score(y_test, y_pred):.2f}")
    
    importances = dict(zip(X.columns, model_median.feature_importances_))
    joblib.dump(importances, 'models/feature_importances.joblib')
    
    joblib.dump(model_median, 'models/delay_model_median.joblib')
    joblib.dump(model_lower, 'models/delay_model_lower.joblib')
    joblib.dump(model_upper, 'models/delay_model_upper.joblib')
    
    print("\nTop 10 features by importance:")
    for feat, imp in sorted(importances.items(), key=lambda item: item[1], reverse=True)[:10]:
        print(f"{feat}: {imp:.4f}")

if __name__ == "__main__":
    train()
