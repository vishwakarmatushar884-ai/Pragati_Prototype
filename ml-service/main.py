from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uvicorn
from model.predictor import predictor_instance
from model.explainer import ai_explainer

app = FastAPI(
    title="PRAGATI AI/ML Risk & Delay Prediction Engine",
    description="Government of India - PRAGATI AI Service for Infrastructure Project Monitoring",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjectFeaturesDTO(BaseModel):
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    spi: float = Field(default=1.0, description="Schedule Performance Index")
    cpi: float = Field(default=1.0, description="Cost Performance Index")
    budget_utilization: float = Field(default=0.0, description="Budget utilization percentage (0-100+)")
    cost_variance_pct: float = Field(default=0.0, description="Cost Variance percentage")
    schedule_variance_days: float = Field(default=0.0, description="Schedule Variance in days")
    planned_progress: float = Field(default=0.0, description="Planned Physical Progress %")
    actual_progress: float = Field(default=0.0, description="Actual Physical Progress %")
    project_age_days: float = Field(default=30.0, description="Days since project start")
    days_remaining: float = Field(default=100.0, description="Days remaining until target completion")
    overdue_milestones_count: int = Field(default=0, description="Number of overdue milestones")
    unresolved_issues_count: int = Field(default=0, description="Number of open/unresolved issues")
    critical_issues_count: int = Field(default=0, description="Number of critical severity issues")
    anomalies_count: int = Field(default=0, description="Number of detected anomalies")
    days_since_last_update: float = Field(default=0.0, description="Days elapsed since last recorded update")

@app.get("/")
def root():
    return {
        "service": "PRAGATI AI/ML Engine",
        "status": "OPERATIONAL",
        "endpoints": [
            "/ml/predict-risk",
            "/ml/predict-delay",
            "/ml/explain",
            "/ml/health",
            "/docs"
        ]
    }

@app.get("/ml/health")
def health():
    return {
        "status": "UP",
        "models_loaded": predictor_instance.clf is not None and predictor_instance.reg is not None,
        "engine": "XGBoost/GradientBoosting + SHAP + Scikit-Learn",
        "version": "1.0.0"
    }

@app.post("/ml/predict-risk")
def predict_risk(payload: ProjectFeaturesDTO):
    try:
        data = payload.model_dump()
        result = predictor_instance.predict_risk(data)
        return {
            "project_id": payload.project_id,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk prediction error: {str(e)}")

@app.post("/ml/predict-delay")
def predict_delay(payload: ProjectFeaturesDTO):
    try:
        data = payload.model_dump()
        result = predictor_instance.predict_delay(data)
        return {
            "project_id": payload.project_id,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delay prediction error: {str(e)}")

@app.post("/ml/explain")
def explain_prediction(payload: ProjectFeaturesDTO):
    try:
        data = payload.model_dump()
        result = ai_explainer.explain(data)
        return {
            "project_id": payload.project_id,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Explainability error: {str(e)}")

@app.post("/ml/batch-predict")
def batch_predict(payload: List[ProjectFeaturesDTO]):
    try:
        results = []
        for p in payload:
            data = p.model_dump()
            risk_res = predictor_instance.predict_risk(data)
            delay_res = predictor_instance.predict_delay(data)
            results.append({
                "project_id": p.project_id,
                "project_name": p.project_name,
                "risk_level": risk_res["risk_level"],
                "risk_probability": risk_res["risk_probability"],
                "predicted_delay_days": delay_res["predicted_delay_days"],
                "top_risk_factors": risk_res["top_risk_factors"]
            })
        return {"total": len(results), "predictions": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
