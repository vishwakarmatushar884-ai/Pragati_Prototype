import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from .train import FEATURE_NAMES, train_models, MODEL_DIR

LABEL_MAP = {0: "LOW", 1: "MEDIUM", 2: "HIGH", 3: "CRITICAL"}

class RiskPredictor:
    def __init__(self):
        self.clf = None
        self.reg = None
        self.feature_names = FEATURE_NAMES
        self.load_or_train()

    def load_or_train(self):
        clf_path = os.path.join(MODEL_DIR, "risk_classifier.joblib")
        reg_path = os.path.join(MODEL_DIR, "delay_regressor.joblib")
        
        if not os.path.exists(clf_path) or not os.path.exists(reg_path):
            print("Models not found. Initiating training...")
            train_models()
            
        self.clf = joblib.load(clf_path)
        self.reg = joblib.load(reg_path)
        print("ML Models loaded successfully.")

    def _prepare_vector(self, data: Dict[str, Any]) -> pd.DataFrame:
        row = {
            "spi": float(data.get("spi", 1.0)),
            "cpi": float(data.get("cpi", 1.0)),
            "budget_utilization": float(data.get("budget_utilization", 0.0)),
            "cost_variance_pct": float(data.get("cost_variance_pct", 0.0)),
            "schedule_variance_days": float(data.get("schedule_variance_days", 0.0)),
            "planned_progress": float(data.get("planned_progress", 0.0)),
            "actual_progress": float(data.get("actual_progress", 0.0)),
            "project_age_days": float(data.get("project_age_days", 0.0)),
            "days_remaining": float(data.get("days_remaining", 100.0)),
            "overdue_milestones_count": int(data.get("overdue_milestones_count", 0)),
            "unresolved_issues_count": int(data.get("unresolved_issues_count", 0)),
            "critical_issues_count": int(data.get("critical_issues_count", 0)),
            "anomalies_count": int(data.get("anomalies_count", 0)),
            "days_since_last_update": float(data.get("days_since_last_update", 0.0)),
        }
        return pd.DataFrame([row], columns=self.feature_names)

    def predict_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        df = self._prepare_vector(data)
        
        # Probabilities across [LOW, MEDIUM, HIGH, CRITICAL]
        probs = self.clf.predict_proba(df)[0]
        pred_label_idx = int(np.argmax(probs))
        risk_level = LABEL_MAP.get(pred_label_idx, "LOW")
        
        # Risk probability as weighted risk score or probability of HIGH/CRITICAL
        # If class is LOW, risk prob is low. If HIGH or CRITICAL, high.
        risk_probability = float(probs[2] + probs[3] if len(probs) > 3 else probs[-1])
        if risk_level == "MEDIUM":
            risk_probability = max(risk_probability, float(probs[1] * 0.6))
        elif risk_level == "LOW":
            risk_probability = float(1.0 - probs[0])

        top_factors = self.extract_top_factors(data)

        return {
            "risk_level": risk_level,
            "risk_probability": round(float(risk_probability), 4),
            "class_probabilities": {
                "LOW": round(float(probs[0]), 4),
                "MEDIUM": round(float(probs[1]), 4) if len(probs) > 1 else 0.0,
                "HIGH": round(float(probs[2]), 4) if len(probs) > 2 else 0.0,
                "CRITICAL": round(float(probs[3]), 4) if len(probs) > 3 else 0.0,
            },
            "top_risk_factors": top_factors
        }

    def predict_delay(self, data: Dict[str, Any]) -> Dict[str, Any]:
        df = self._prepare_vector(data)
        predicted_days = float(self.reg.predict(df)[0])
        predicted_days = max(0.0, round(predicted_days, 1))
        
        # Delay probability based on SPI and overdue milestones
        spi = float(data.get("spi", 1.0))
        overdue_milestones = int(data.get("overdue_milestones_count", 0))
        
        if spi < 0.85 or overdue_milestones > 0 or predicted_days > 15:
            delay_prob = min(0.98, 0.4 + (1.0 - min(spi, 1.0)) * 0.8 + overdue_milestones * 0.1)
        else:
            delay_prob = max(0.05, (1.0 - spi) * 0.5)
            
        return {
            "predicted_delay_days": predicted_days,
            "delay_probability": round(float(delay_prob), 4),
            "estimated_completion_impact": f"+{predicted_days} days from baseline" if predicted_days > 0 else "On schedule"
        }

    def extract_top_factors(self, data: Dict[str, Any]) -> List[str]:
        factors = []
        spi = float(data.get("spi", 1.0))
        cpi = float(data.get("cpi", 1.0))
        overdue = int(data.get("overdue_milestones_count", 0))
        crit_issues = int(data.get("critical_issues_count", 0))
        unres_issues = int(data.get("unresolved_issues_count", 0))
        anomalies = int(data.get("anomalies_count", 0))
        cost_var = float(data.get("cost_variance_pct", 0.0))
        days_update = float(data.get("days_since_last_update", 0.0))
        
        if spi < 0.80:
            factors.append(f"SPI = {spi:.2f} indicates severe schedule delay ({(1.0-spi)*100:.1f}% behind planned progress)")
        elif spi < 0.95:
            factors.append(f"SPI = {spi:.2f} shows moderate schedule slippage")
            
        if cpi < 0.80:
            factors.append(f"CPI = {cpi:.2f} indicates significant cost overrun (expenditure exceeds earned value)")
        elif cpi < 0.95:
            factors.append(f"CPI = {cpi:.2f} indicates minor cost overrun")
            
        if overdue > 0:
            factors.append(f"{overdue} project milestone{'s are' if overdue > 1 else ' is'} past deadline")
            
        if crit_issues > 0:
            factors.append(f"{crit_issues} unresolved CRITICAL issue{'s' if crit_issues > 1 else ''} pending immediate intervention")
            
        if cost_var > 15.0:
            factors.append(f"Actual cost variance is {cost_var:.1f}% above approved allocation")
            
        if unres_issues >= 3:
            factors.append(f"{unres_issues} unresolved issues impacting workflow momentum")
            
        if anomalies > 0:
            factors.append(f"{anomalies} data or progress anomalies detected in reporting")
            
        if days_update > 21.0:
            factors.append(f"Stale progress updates ({int(days_update)} days since last reporting)")
            
        if not factors:
            factors.append("Project performance indicators (SPI/CPI) and milestones are within acceptable bounds")
            
        return factors[:5]

predictor_instance = RiskPredictor()
