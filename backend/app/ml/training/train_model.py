"""
Train an XGBoost regressor on the synthetic delay dataset and persist
the model + a SHAP TreeExplainer with joblib.

Run from backend/:  python -m app.ml.training.train_model
"""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

from app.ml.training.dataset import FEATURE_COLUMNS, TARGET_COLUMN, generate_synthetic_dataset, save_dataset

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def train(n_rows: int = 10000, seed: int = 42) -> dict:
    df = generate_synthetic_dataset(n_rows=n_rows, seed=seed)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    save_dataset(df, DATA_DIR / "synthetic_dataset.csv")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=seed
    )

    model = XGBRegressor(
        n_estimators=180,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=3,
        objective="reg:squarederror",
        random_state=seed,
        n_jobs=2,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))
    residual_std = float(np.std(y_test - y_pred))

    # SHAP TreeExplainer — used at inference for per-prediction reasons
    import shap

    explainer = shap.TreeExplainer(model)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_DIR / "xgboost_model.joblib")
    joblib.dump(explainer, MODEL_DIR / "shap_explainer.joblib")
    metrics = {
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "r2": round(r2, 3),
        "residual_std": round(residual_std, 3),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "features": FEATURE_COLUMNS,
    }
    (MODEL_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2))
    print("XGBoost delay model trained")
    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    train()
