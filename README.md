# PRAGATI - Integrated Project Monitoring Platform with Explainable AI Risk Insights
*“Use case on web-based integrated project-monitoring platform”*

---

## Executive Summary

**PRAGATI** (Project Review and Governance with Artificial Intelligence & Telemetry Integration) is an enterprise-grade, integrated, AI-driven project monitoring platform engineered for the Government of India, Cabinet Secretariat, NITI Aayog, and central line ministries.

The platform provides centralized oversight for multi-crore national infrastructure projects (Bharatmala, Dedicated Freight Corridors, Metro Rails, AIIMS, High-Speed Rail, Renewable Energy Parks, and Ports), solving the chronic challenges of cost overruns, inter-ministerial bottlenecks, milestone delays, and siloed field reporting.

```
+-----------------------------------------------------------------------------------+
|                           PRAGATI SYSTEM ARCHITECTURE                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |             FRONTEND WEB APPLICATION (React 18, TypeScript, Tailwind)       |  |
|  |  * Executive KPI Dashboard           * 11-Tab Project Deep-Dive             |  |
|  |  * Interactive Leaflet GIS Map       * Two-Level Escalation Command Center  |  |
|  |  * Portfolio Issue Tracker           * AI Risk Simulator & SHAP Factors     |  |
|  |  * Statutory Reports Generator       * Security Audit Trail & Notifications |  |
|  +-----------------------------------------------------------------------------+  |
|                                       | (REST / JWT)                              |
|                                       v                                           |
|  +-----------------------------------------------------------------------------+  |
|  |           BACKEND SERVICE CORE (Spring Boot 3.3.2, Java 21/26)              |  |
|  |  * 12-Step Progress Update Pipeline  * Anomaly Engine (11 Detection Rules)  |  |
|  |  * EVM Calculation Engine (SPI/CPI)  * 2-Level Escalation Scheduler         |  |
|  |  * Health Score Weighted Engine      * Role-Based Access Control (6 Roles)  |  |
|  |  * OpenApi / Swagger 3.0 UI          * Seed Data Service (20 Mega Projects) |  |
|  +-----------------------------------------------------------------------------+  |
|                     |                                     |                       |
|       (HTTP / REST) v                                     v (JPA / Hibernate)     |
|  +--------------------------------------+   +----------------------------------+  |
|  |   AI / ML SERVICE (FastAPI, Python)  |   |    DATABASE ENGINE               |  |
|  |  * XGBoost Risk Classifier           |   |  * PostgreSQL 16 (Production)    |  |
|  |  * Random Forest Delay Regressor     |   |  * H2 Mode (Zero-Setup Dev)      |  |
|  |  * TreeSHAP Feature Explainability   |   |  * Spatial Lat/Long Geo-Indexing |  |
|  +--------------------------------------+   +----------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 🔑 Key Features & Mathematical Engine

### 1. Earned Value Management (EVM) Core
- **Planned Value (PV)**: Sanctioned budget allocated to scheduled work up to report date.
- **Earned Value (EV)**: Value of work actually completed = $\text{Physical Progress \%} \times \text{Project Budget}$.
- **Actual Cost (AC)**: Total cumulative funds spent to date.
- **Schedule Performance Index (SPI)**: $\text{SPI} = \frac{\text{EV}}{\text{PV}}$  
  - $\text{SPI} \ge 1.0$: Ahead of schedule  
  - $0.80 \le \text{SPI} < 0.95$: Schedule warning (Medium Risk)  
  - $\text{SPI} < 0.80$: Critical schedule slippage (Critical Risk)
- **Cost Performance Index (CPI)**: $\text{CPI} = \frac{\text{EV}}{\text{AC}}$  
  - $\text{CPI} \ge 1.0$: Under or on budget  
  - $0.80 \le \text{CPI} < 0.95$: Moderate cost overrun  
  - $\text{CPI} < 0.80$: Severe fiscal overrun (>20% budget deviation)

### 2. Composite Health Score Engine (0–100)
$$\text{Health Score} = w_1 \cdot H_{\text{schedule}} + w_2 \cdot H_{\text{cost}} + w_3 \cdot H_{\text{milestone}} + w_4 \cdot H_{\text{issues}} + w_5 \cdot H_{\text{recency}}$$
Default calibrated weights:
- **Schedule Component ($w_1 = 30\%$)**: Proportional to $\min(\text{SPI} / 1.0, 1.0)$.
- **Cost Component ($w_2 = 25\%$)**: Proportional to $\min(\text{CPI} / 1.0, 1.0)$.
- **Milestone Component ($w_3 = 20\%$)**: Ratio of completed to due statutory milestones.
- **Issues Penalty ($w_4 = 15\%$)**: Penalty deductions for open and critical bottlenecks.
- **Update Regularity ($w_5 = 10\%$)**: Recency factor (penalizes stale data > 14 days).

### 3. Machine Learning Risk & Delay Prediction Engine
- **Model**: Gradient Boosted Decision Trees (XGBoost) calibrated on 3,500 historical public infrastructure project epochs.
- **Delay Regressor**: Random Forest model predicting completion delay in months ($R^2 = 0.82$, F1 Score = $0.88$).
- **TreeSHAP Explainability**: Decomposes prediction into transparent feature attributions (SPI, CPI, unresolved land/clearance hurdles, weather factors).

### 4. 11 Automated Anomaly Detection Rules
1. `COST_OVERRUN_NO_PROGRESS`: Expenditure surged $\ge 10\%$ while physical progress remained flat.
2. `RAPID_SPI_DEGRADATION`: SPI dropped by $\ge 0.15$ in consecutive reporting cycles.
3. `CRITICAL_MILESTONE_OVERDUE`: Statutory gating milestone overdue $\ge 30$ days.
4. `UNRESOLVED_CRITICAL_ISSUE`: Inter-ministerial issue unresolved $\ge 21$ days.
5. `TELEMETRY_STALE`: Zero field progress entry for $\ge 30$ days.
6. `FINANCIAL_PHYSICAL_DISCREPANCY`: Financial spend $\ge 85\%$ but physical progress $< 50\%$.
7. `CONTRACTOR_DISPUTE_STALL`: Physical work halted due to arbitration or dispute.
8. `ENVIRONMENTAL_CLEARANCE_BLOCK`: Forest/wildlife clearance overdue on active corridor.
9. `LAND_ACQUISITION_IMPEDIMENT`: Right-of-way handover delayed $> 60$ days.
10. `FREQUENT_TARGET_REVISION`: Milestone baseline revised $\ge 3$ times without progress.
11. `NEGATIVE_COST_VARIANCE_SPIKE`: Cost variance deficit exceeds 15% of total sanctioned budget.

### 5. Two-Level Scheduled Escalation Ladder
```
[Level 0: Field Officer] --(Unacknowledged > 5 min)--> [Level 1: Ministry Admin] --(Unresolved > 10 min)--> [Level 2: Apex Committee]
```
- **Level 0 (Field Officer)**: Immediate trigger upon anomaly detection.
- **Level 1 (Ministry Admin)**: Triggered automatically if unacknowledged within 5 minutes (or manual escalation).
- **Level 2 (Apex Cabinet Monitoring Committee)**: High-urgency alert escalated to Cabinet Secretary / Prime Minister's Office for inter-ministerial resolution.

---

## 👥 Demo Roles & Quick Credentials

All demo accounts share the password: **`Demo@123`**

| Role | Demo Email | Designation & Scope | Privileges |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | `admin@pragati.demo` | Cabinet Secretariat / PMO Director | Full system control, recalibrate thresholds, view all ministries |
| **MINISTRY_ADMIN** | `ministry@pragati.demo` | Joint Secretary (MoRTH / Railways) | Approve projects, resolve ministry issues, escalate to Apex |
| **PROJECT_MANAGER** | `manager@pragati.demo` | Chief Project Director (NHAI / RVNL) | Create projects, assign milestones, manage budgets |
| **FIELD_OFFICER** | `field@pragati.demo` | Executive Engineer (Site Telemetry) | Submit field progress updates, report site issues |
| **AUDITOR** | `auditor@pragati.demo` | Principal Director of Audit (CAG) | Read-only compliance, audit log inspection, statutory export |
| **VIEWER** | `viewer@pragati.demo` | Public Policy Analyst / Observer | Read-only executive dashboard and GIS map |

> 💡 **Tip:** In the top navigation bar of the application, you can switch between these roles with a **single click** using the quick demo role selector.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** & npm
- **Java 21 or 26** & Maven (or use embedded wrapper)
- **Python 3.10+** (for ML microservice)

### Step 1: Start the Python ML Service
```bash
cd ml-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m model.train
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*ML Service will be live at `http://localhost:8000` (Swagger UI at `/docs`).*

### Step 2: Start the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*Backend will be live at `http://localhost:8080` (OpenAPI Swagger at `http://localhost:8080/swagger-ui.html`).*  
*Dev profile uses in-memory H2 with Postgres compatibility and seeds 20 Indian projects + 6 demo accounts automatically.*

### Step 3: Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend will be live at `http://localhost:5173`.*

---

## 🐳 Docker Multi-Container Deployment

To spin up the complete 4-tier stack (PostgreSQL + ML Service + Spring Boot + React Nginx):
```bash
docker-compose up --build -d
```
Access the application at `http://localhost`.

---

## 📋 16-Step Enterprise Live Demonstration Script

Follow this exact walkthrough to demonstrate all required capabilities for the leadership & stakeholders:

1. **Login & Role Awareness**: Open `http://localhost:5173`. Click the **Field Officer** quick card to log in as `field@pragati.demo`.
2. **Portfolio Overview**: Observe the 20 pre-seeded projects across Railways, Highways, Metro, Energy, Ports, Health, and Airports across 10 Indian states.
3. **Select High-Profile Project**: Navigate to **Projects Hub** and click on `PRJ-RAIL-001` (*Mumbai–Ahmedabad High-Speed Rail Corridor*).
4. **Inspect Baseline EVM**: Notice the current SPI (0.76), CPI (0.82), and Risk Level (`CRITICAL`).
5. **Field Telemetry Update**: Click **Submit Field Update**. Enter Physical Progress `44.5%`, Actual Cost `₹58,400 Cr`, and Remarks `"Undersea tunnel T-2 boring slowed due to basalt strata hardness."`
6. **Instant Recalculation**: Submit the form. Notice SPI, CPI, EV, Cost Variance, and Health Score instantly recalculate without page reload.
7. **Automated Anomaly Detection**: Switch to the **Alerts & Anomalies** tab. Notice the anomaly `RAPID_SPI_DEGRADATION` triggered in real-time.
8. **Automated Alert Generation**: Observe that a new emergency alert `ALERT-2026-X` was generated and assigned to Level 0 (Field Officer).
9. **Role Switch to Ministry**: Click the role switcher in the top navbar and switch to **Ministry Admin** (`ministry@pragati.demo`).
10. **Acknowledge & Escalate**: Navigate to **Alerts & Escalations Command Center**. Click **Acknowledge** on the alert, then click **Escalate Up** to send it to **Level 2 (Apex Committee)** with remarks `"Inter-ministerial geotechnical clearance required from MoES."`
11. **Collaborative Resolution**: Navigate to **Issues Tracker**. Raise an issue: `"Geotechnical approval for undersea tunnel boring"`. Post an official comment in the discussion thread.
12. **AI & TreeSHAP Explainability**: Navigate to **Risk & AI Engine**. Review the XGBoost risk classification and the interactive SHAP waterfall breakdown showing SPI and unresolved issues as the top risk drivers.
13. **What-If Scenario Simulator**: Move the sliders for SPI and CPI in the simulator to see live on-the-fly delay predictions.
14. **GIS India Map**: Navigate to **GIS India Map**. Observe the 20 projects rendered across India with risk-coded markers (Red for Critical, Orange for High, Yellow for Medium, Green for Low). Click a marker to view the popup scorecard.
15. **Statutory Report Generation**: Navigate to **Executive Reports**. Filter by *Railways* and click **Export CSV** and **Print / Save PDF** to generate the official Government of India performance scorecard.
16. **Immutable Audit Verification**: Switch to **Auditor** role (`auditor@pragati.demo`), navigate to **Audit Trail**, and show the judges the tamper-proof ledger of every update, EVM calculation, and escalation event.

---

## 🏆 Enterprise Problem Statement Compliance Matrix

| Requirement | Implementation in PRAGATI | Verified |
| :--- | :--- | :---: |
| Centralized Project Data Hub | 20+ mega-projects across 10 sectors & 10 states with full metadata | ✅ |
| EVM Calculation Engine | SPI, CPI, SV, CV, EV, PV with zero-division safety and custom thresholds | ✅ |
| Project Health Score | 0–100 weighted score across schedule, cost, milestones, issues, and recency | ✅ |
| Python ML Prediction | FastAPI + XGBoost risk classifier & Random Forest delay regressor | ✅ |
| SHAP Explainability | TreeSHAP feature importance & natural language causal explanations | ✅ |
| Automated Anomaly Detection | 11 distinct operational anomaly patterns detected in real-time | ✅ |
| Two-Level Escalation | Automated background timer + manual escalation (Field → Ministry → Apex) | ✅ |
| Issue Tracker Pipeline | Categorized issue tracking, comment threads, cost/delay impacts, resolution | ✅ |
| Interactive GIS Map | Leaflet-based map with risk markers, sector filtering, and popup scorecards | ✅ |
| Multi-Format Reports | Live database query reports, CSV export, and print-ready PDF scorecards | ✅ |
| Role-Based Access Control | 6 distinct roles enforced across UI views, actions, and API endpoints | ✅ |
| Verifiable Audit Trail | Append-only security audit log of all project updates and escalations | ✅ |

---

*Developed for Government of India · Problem Statement PRAGATI-CORE*
