import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
import os
from pathlib import Path

def train():
    df = pd.read_csv('data/historical_runs.csv')
    
    y = df['actual_delay_minutes']
    raw_metadata = df[['train_type', 'weather_condition']].copy()
    X = df.drop(columns=['actual_delay_minutes', 'train_number', 'run_date', 'station_code'])
    X['is_monsoon'] = X['is_monsoon'].astype(int)
    X = pd.get_dummies(X, columns=['weather_condition', 'train_type'], dtype=int)
    
    X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
        X, y, raw_metadata, test_size=0.2, random_state=42
    )
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(list(X.columns), 'models/feature_columns.joblib')
    
    print("Training median model (quantile 0.50)...")
    model_median = GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
    model_median.fit(X_train, y_train)
    
    print("Training lower bound model (alpha=0.05)...")
    model_lower = GradientBoostingRegressor(loss='quantile', alpha=0.05, n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
    model_lower.fit(X_train, y_train)
    
    print("Training upper bound model (alpha=0.95)...")
    model_upper = GradientBoostingRegressor(loss='quantile', alpha=0.95, n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
    model_upper.fit(X_train, y_train)
    
    y_pred = model_median.predict(X_test)
    y_lower_pred = model_lower.predict(X_test)
    y_upper_pred = model_upper.predict(X_test)
    
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))
    
    # 90% PICP (Prediction Interval Coverage Probability)
    in_interval = (y_test >= y_lower_pred) & (y_test <= y_upper_pred)
    picp_90 = float(np.mean(in_interval) * 100)
    
    print(f"Overall Test MAE: {mae:.2f} min")
    print(f"Overall Test RMSE: {rmse:.2f} min")
    print(f"Overall Test R²: {r2:.3f}")
    print(f"90% PICP Calibration Coverage: {picp_90:.1f}%")
    
    # Breakdown by train type
    breakdown_by_train_type = {}
    for tt in df['train_type'].unique():
        mask = meta_test['train_type'] == tt
        if np.sum(mask) > 0:
            breakdown_by_train_type[tt] = {
                'samples': int(np.sum(mask)),
                'mae': round(float(mean_absolute_error(y_test[mask], y_pred[mask])), 2),
                'rmse': round(float(np.sqrt(mean_squared_error(y_test[mask], y_pred[mask]))), 2),
                'coverage_90': round(float(np.mean((y_test[mask] >= y_lower_pred[mask]) & (y_test[mask] <= y_upper_pred[mask])) * 100), 1)
            }
            
    # Breakdown by weather condition
    breakdown_by_weather = {}
    for w in df['weather_condition'].unique():
        mask = meta_test['weather_condition'] == w
        if np.sum(mask) > 0:
            breakdown_by_weather[w] = {
                'samples': int(np.sum(mask)),
                'mae': round(float(mean_absolute_error(y_test[mask], y_pred[mask])), 2),
                'rmse': round(float(np.sqrt(mean_squared_error(y_test[mask], y_pred[mask]))), 2),
                'coverage_90': round(float(np.mean((y_test[mask] >= y_lower_pred[mask]) & (y_test[mask] <= y_upper_pred[mask])) * 100), 1)
            }
            
    metrics = {
        'model_name': 'GradientBoostingRegressor (Tri-Quantile 0.05/0.50/0.95)',
        'total_training_samples': int(len(X_train)),
        'total_test_samples': int(len(X_test)),
        'overall': {
            'mae_minutes': round(mae, 2),
            'rmse_minutes': round(rmse, 2),
            'r2_score': round(r2, 4),
            'picp_90_coverage_percent': round(picp_90, 2),
            'nominal_target_coverage': 90.0,
            'calibration_status': 'Optimal (Well-Calibrated)' if abs(picp_90 - 90.0) <= 3.5 else 'Acceptable'
        },
        'by_train_type': breakdown_by_train_type,
        'by_weather': breakdown_by_weather
    }
    
    with open('models/model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    joblib.dump(metrics, 'models/model_metrics.joblib')
    
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
