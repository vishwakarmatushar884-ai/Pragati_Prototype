# 🚀 Deployment Guide: PRAGATI Full Platform on Render

Deploy the **entire PRAGATI Platform (Frontend UI + Spring Boot Backend + In-Memory Database + Auto Seeding)** as a unified service on **Render**.

---

## ⚡ Option 1: Deploy Full Website on Render (Recommended)

This compiles both the React Frontend and the Spring Boot Backend into a single executable service hosted on Render.

### Method A: Via Render Blueprint (Automatic 1-Click Setup)
We have configured [`render.yaml`](file:///d:/pragati/render.yaml) and the unified [`Dockerfile`](file:///d:/pragati/Dockerfile) at the root of the project:

1. Push your project to your **GitHub** (or GitLab) repository:
   ```bash
   git add .
   git commit -m "Configure full-stack Render deployment"
   git push origin main
   ```
2. Go to **[dashboard.render.com](https://dashboard.render.com/)** and log in.
3. Click **"New +"** (top right) ➔ Select **"Blueprint"**.
4. Connect your **`Pragati_Prototype`** repository.
5. Render detects `render.yaml` and sets up the unified Web Service automatically.
6. Click **"Apply"** — Your complete website will be live in 2-3 minutes!

---

### Method B: Via Render Web Dashboard (Manual Web Service)
If creating directly from the Render Dashboard:
1. In your **[Render Dashboard](https://dashboard.render.com/)**, click **"New +"** ➔ Select **"Web Service"**.
2. Connect your Git repository (`Pragati_Prototype`).
3. Set the following options:
   - **Name**: `pragati-platform`
   - **Language / Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: `Free`
4. Under **"Environment Variables"**, add:
   - `SPRING_PROFILES_ACTIVE` = `dev`
   - `APP_SEED_ENABLED` = `true`
5. Click **"Create Web Service"**.
   > Render will automatically build the React frontend, package it inside the Spring Boot service, seed all 20 Government of India projects, and launch the platform at `https://pragati-platform.onrender.com`!

---

## 👥 Authorized Roles for Portal Access

Once deployed, you can log in directly using the 1-click role buttons or credentials:

| Role | Name & Title | Authorized Email |
| :--- | :--- | :--- |
| **Super Admin** | Shri Rajesh Verma, IAS (Chief PMO Officer) | `admin@pragati.demo` |
| **Ministry Admin** | Dr. Sunita Deshmukh (Joint Secretary MORTH) | `ministry@pragati.demo` |
| **Project Manager** | Vikramaditya Rao (Chief GM, NHAI) | `manager@pragati.demo` |
| **Field Officer** | Ananya Sharma (Senior Field Engineer) | `field@pragati.demo` |
| **Auditor** | K. S. Narayanan (Principal Auditor, CAG) | `auditor@pragati.demo` |
| **Viewer** | Public Observer / Stakeholder | `viewer@pragati.demo` |

---

## 🔍 Included Features on the Live Site

- **Full Project Portfolio**: 20 authentic mega-projects (Atal Tunnel, Chenab Rail Bridge, Khavda Solar, Rishikesh Tunnel, etc.) with EVM metrics (SPI, CPI, Health Score).
- **National GIS Map**: Interactive Leaflet India map with project markers and risk distribution.
- **REST API & Swagger Docs**: Accessible at `/api/*` and `/swagger-ui.html`.
- **Health Check & Actuator**: Live at `/actuator/health`.
