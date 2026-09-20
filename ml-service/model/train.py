import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURE_NAMES = [
    "spi",
    "cpi",
    "budget_utilization",
    "cost_variance_pct",
    "schedule_variance_days",
    "planned_progress",
    "actual_progress",
    "project_age_days",
    "days_remaining",
    "overdue_milestones_count",
    "unresolved_issues_count",
    "critical_issues_count",
    "anomalies_count",
    "days_since_last_update"
]

def generate_synthetic_data(n_samples=3500, random_state=42):
    np.random.seed(random_state)
    
    # Generate features
    spi = np.random.uniform(0.4, 1.3, n_samples)
    cpi = np.random.uniform(0.4, 1.3, n_samples)
    planned_progress = np.random.uniform(5.0, 100.0, n_samples)
    
    # actual progress is correlated with spi and planned_progress
    actual_progress = np.clip(planned_progress * spi + np.random.normal(0, 3, n_samples), 0, 100)
    
    budget_utilization = np.clip(
        (actual_progress / np.maximum(cpi, 0.1)) + np.random.normal(0, 5, n_samples), 
        0, 150
    )
    cost_variance_pct = (budget_utilization - actual_progress)
    schedule_variance_days = (1.0 - spi) * 120 + np.random.normal(0, 10, n_samples)
    
    project_age_days = np.random.uniform(30, 900, n_samples)
    days_remaining = np.maximum(10, np.random.uniform(20, 600, n_samples) - (1.0 - spi) * 60)
    
    # Problem features correlate with low SPI/CPI
    bad_factor = np.clip((1.0 - spi) * 2 + (1.0 - cpi) * 1.5, 0, 4)
    overdue_milestones_count = np.random.poisson(bad_factor * 1.5, n_samples)
    unresolved_issues_count = np.random.poisson(bad_factor * 2.0, n_samples)
    critical_issues_count = np.random.poisson(bad_factor * 0.8, n_samples)
    anomalies_count = np.random.poisson(bad_factor * 0.7, n_samples)
    days_since_last_update = np.random.exponential(scale=5 + bad_factor * 4, size=n_samples)

    # Risk Score Formulation
    # 0 = LOW, 1 = MEDIUM, 2 = HIGH, 3 = CRITICAL
    composite_risk_score = (
        (1.0 - spi) * 35.0 +
        (1.0 - cpi) * 25.0 +
        (overdue_milestones_count * 5.0) +
        (critical_issues_count * 8.0) +
        (unresolved_issues_count * 2.5) +
        (anomalies_count * 4.0) +
        (np.clip(days_since_last_update - 14, 0, 60) * 0.5) +
        np.random.normal(0, 4, n_samples)
    )
    
    risk_labels = []
    for s in composite_risk_score:
        if s < 5.0:
            risk_labels.append(0)  # LOW
        elif s < 22.0:
            risk_labels.append(1)  # MEDIUM
        elif s < 45.0:
            risk_labels.append(2)  # HIGH
        else:
            risk_labels.append(3)  # CRITICAL

    # Delay days calculation
    base_delay = np.maximum(0, (1.0 - spi) * 180 + overdue_milestones_count * 15 + critical_issues_count * 20 + np.random.normal(0, 8, n_samples))
    predicted_delay_days = np.round(np.clip(base_delay, 0, 365), 1)

    df = pd.DataFrame({
        "spi": spi,
        "cpi": cpi,
        "budget_utilization": budget_utilization,
        "cost_variance_pct": cost_variance_pct,
        "schedule_variance_days": schedule_variance_days,
        "planned_progress": planned_progress,
        "actual_progress": actual_progress,
        "project_age_days": project_age_days,
        "days_remaining": days_remaining,
        "overdue_milestones_count": overdue_milestones_count,
        "unresolved_issues_count": unresolved_issues_count,
        "critical_issues_count": critical_issues_count,
        "anomalies_count": anomalies_count,
        "days_since_last_update": days_since_last_update,
        "risk_label": risk_labels,
        "delay_days": predicted_delay_days
    })
    
    return df

def train_models():
    print("Generating synthetic infrastructure project training data...")
    df = generate_synthetic_data(n_samples=4000)
    
    X = df[FEATURE_NAMES]
    y_risk = df["risk_label"]
    y_delay = df["delay_days"]
    
    X_train, X_test, y_risk_train, y_risk_test, y_delay_train, y_delay_test = train_test_split(
        X, y_risk, y_delay, test_size=0.2, random_state=42
    )
    
    print("Training Risk Classifier (Random Forest + Gradient Boosting)...")
    clf = GradientBoostingClassifier(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
    clf.fit(X_train, y_risk_train)
    
    risk_preds = clf.predict(X_test)
    print("Classification Report:")
    print(classification_report(y_risk_test, risk_preds, target_names=["LOW", "MEDIUM", "HIGH", "CRITICAL"]))
    
    print("Training Delay Regressor...")
    reg = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    reg.fit(X_train, y_delay_train)
    
    delay_preds = reg.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_delay_test, delay_preds))
    print(f"Delay Regressor RMSE: {rmse:.2f} days")
    
    # Save models
    clf_path = os.path.join(MODEL_DIR, "risk_classifier.joblib")
    reg_path = os.path.join(MODEL_DIR, "delay_regressor.joblib")
    meta_path = os.path.join(MODEL_DIR, "feature_names.joblib")
    
    joblib.dump(clf, clf_path)
    joblib.dump(reg, reg_path)
    joblib.dump(FEATURE_NAMES, meta_path)
    
    print(f"Models successfully saved to {MODEL_DIR}")

if __name__ == "__main__":
    train_models()
