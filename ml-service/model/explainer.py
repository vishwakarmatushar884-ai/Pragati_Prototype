import numpy as np
import pandas as pd
from typing import Dict, Any, List
from .predictor import predictor_instance
from .train import FEATURE_NAMES

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

class AIExplainer:
    def __init__(self):
        self.predictor = predictor_instance
        self.explainer = None
        self._init_shap()

    def _init_shap(self):
        if SHAP_AVAILABLE and self.predictor.clf is not None:
            try:
                # TreeExplainer for GradientBoosting
                self.explainer = shap.TreeExplainer(self.predictor.clf)
            except Exception as e:
                print(f"SHAP explainer init fallback: {e}")
                self.explainer = None

    def explain(self, data: Dict[str, Any]) -> Dict[str, Any]:
        df = self.predictor._prepare_vector(data)
        features_dict = df.to_dict(orient="records")[0]
        
        feature_contributions = []
        
        # Calculate feature contributions
        if self.explainer is not None:
            try:
                shap_values = self.explainer.shap_values(df)
                # If multiclass, shap_values is a list of arrays per class, or 3D array
                if isinstance(shap_values, list):
                    # For high/critical classes (indices 2 and 3 if available)
                    class_idx = min(2, len(shap_values) - 1)
                    vals = shap_values[class_idx][0]
                elif len(shap_values.shape) == 3:
                    class_idx = min(2, shap_values.shape[2] - 1)
                    vals = shap_values[0, :, class_idx]
                else:
                    vals = shap_values[0]

                for name, val in zip(FEATURE_NAMES, vals):
                    feat_val = features_dict[name]
                    impact = float(val)
                    feature_contributions.append({
                        "feature": name,
                        "value": feat_val,
                        "impact": round(impact, 4),
                        "direction": "RISK_INCREASING" if impact > 0 else "RISK_DECREASING",
                        "description": self._describe_feature(name, feat_val, impact)
                    })
            except Exception as e:
                print(f"SHAP calculation error: {e}, using heuristic feature attribution")
                feature_contributions = self._heuristic_attribution(features_dict)
        else:
            feature_contributions = self._heuristic_attribution(features_dict)

        # Sort by absolute impact descending
        feature_contributions.sort(key=lambda x: abs(x["impact"]), reverse=True)
        
        risk_res = self.predictor.predict_risk(data)
        delay_res = self.predictor.predict_delay(data)

        # Generate human-readable AI summary
        summary = self._generate_ai_summary(risk_res["risk_level"], risk_res["risk_probability"], feature_contributions)

        return {
            "risk_level": risk_res["risk_level"],
            "risk_probability": risk_res["risk_probability"],
            "delay_probability": delay_res["delay_probability"],
            "predicted_delay_days": delay_res["predicted_delay_days"],
            "ai_summary": summary,
            "top_contributing_factors": [fc["description"] for fc in feature_contributions if fc["direction"] == "RISK_INCREASING"][:5],
            "feature_contributions": feature_contributions[:8]
        }

    def _heuristic_attribution(self, features: Dict[str, Any]) -> List[Dict[str, Any]]:
        contributions = []
        
        # SPI
        spi = features.get("spi", 1.0)
        spi_impact = (1.0 - spi) * 1.8
        contributions.append({
            "feature": "spi",
            "value": spi,
            "impact": round(spi_impact, 4),
            "direction": "RISK_INCREASING" if spi_impact > 0 else "RISK_DECREASING",
            "description": f"SPI = {spi:.2f} (Schedule Efficiency: {(1.0-spi)*100:.1f}% deviation)"
        })
        
        # CPI
        cpi = features.get("cpi", 1.0)
        cpi_impact = (1.0 - cpi) * 1.5
        contributions.append({
            "feature": "cpi",
            "value": cpi,
            "impact": round(cpi_impact, 4),
            "direction": "RISK_INCREASING" if cpi_impact > 0 else "RISK_DECREASING",
            "description": f"CPI = {cpi:.2f} (Cost Efficiency: {(1.0-cpi)*100:.1f}% deviation)"
        })
        
        # Overdue milestones
        overdue = features.get("overdue_milestones_count", 0)
        overdue_impact = overdue * 0.45
        contributions.append({
            "feature": "overdue_milestones_count",
            "value": overdue,
            "impact": round(overdue_impact, 4),
            "direction": "RISK_INCREASING" if overdue_impact > 0 else "RISK_DECREASING",
            "description": f"{overdue} Overdue Milestone(s) critical to deadline"
        })
        
        # Critical Issues
        crit = features.get("critical_issues_count", 0)
        crit_impact = crit * 0.75
        contributions.append({
            "feature": "critical_issues_count",
            "value": crit,
            "impact": round(crit_impact, 4),
            "direction": "RISK_INCREASING" if crit_impact > 0 else "RISK_DECREASING",
            "description": f"{crit} Critical Issue(s) requiring executive unblocking"
        })
        
        # Anomalies
        anom = features.get("anomalies_count", 0)
        anom_impact = anom * 0.35
        contributions.append({
            "feature": "anomalies_count",
            "value": anom,
            "impact": round(anom_impact, 4),
            "direction": "RISK_INCREASING" if anom_impact > 0 else "RISK_DECREASING",
            "description": f"{anom} Data Anomalies detected in project updates"
        })

        # Cost Variance Pct
        cv = features.get("cost_variance_pct", 0.0)
        cv_impact = cv * 0.02
        contributions.append({
            "feature": "cost_variance_pct",
            "value": cv,
            "impact": round(cv_impact, 4),
            "direction": "RISK_INCREASING" if cv_impact > 0 else "RISK_DECREASING",
            "description": f"Cost Variance is {cv:.1f}% relative to budget"
        })

        return contributions

    def _describe_feature(self, name: str, value: float, impact: float) -> str:
        if name == "spi":
            return f"SPI = {value:.2f} ({'lagging schedule' if value < 1.0 else 'ahead of schedule'})"
        elif name == "cpi":
            return f"CPI = {value:.2f} ({'over budget' if value < 1.0 else 'under budget'})"
        elif name == "overdue_milestones_count":
            return f"{int(value)} overdue milestone(s)"
        elif name == "critical_issues_count":
            return f"{int(value)} critical unresolved issue(s)"
        elif name == "unresolved_issues_count":
            return f"{int(value)} open issue(s)"
        elif name == "anomalies_count":
            return f"{int(value)} data/progress anomalies detected"
        elif name == "cost_variance_pct":
            return f"Cost variance at {value:.1f}%"
        elif name == "days_since_last_update":
            return f"{int(value)} days since last progress report"
        return f"{name}: {value}"

    def _generate_ai_summary(self, risk_level: str, risk_prob: float, contributions: List[Dict[str, Any]]) -> str:
        top_risks = [c["description"] for c in contributions if c["direction"] == "RISK_INCREASING"]
        if risk_level in ["HIGH", "CRITICAL"]:
            reasons = "; ".join(top_risks[:3]) if top_risks else "severe variance across progress indicators"
            return f"The AI model predicts {risk_level} risk ({int(risk_prob*100)}% probability) driven primarily by: {reasons}. Immediate administrative intervention is recommended."
        elif risk_level == "MEDIUM":
            return f"The AI model assesses MODERATE risk ({int(risk_prob*100)}% probability). Minor performance variances and milestone bottlenecks require continuous monitoring."
        else:
            return f"The AI model assesses LOW risk ({int(risk_prob*100)}% probability). Key EVM parameters and milestone velocity remain within standard operational tolerance."

ai_explainer = AIExplainer()
