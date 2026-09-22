# 🚀 Quick Deployment Guide: PRAGATI Standalone Prototype (Zero-Docker)

Deploy and host the **PRAGATI National Infrastructure Monitoring Platform** prototype instantly **without Docker, without databases, and without backend server setup**.

The prototype runs 100% in the browser with **Interactive National Demo Data** (20 Government of India projects across States & Ministries, Leaflet GIS maps, EVM calculations, risk escalation, 6 demo roles, stateful issue management, and PDF report downloads).

---

## ⚡ Option 1: 1-Click Hosting on Vercel (Recommended - Free)

Vercel provides free global hosting with automatic HTTPS and instant updates.

### Method A: Via Vercel Web Dashboard (Easiest)
1. Push your repository to **GitHub** or **GitLab**.
2. Go to [https://vercel.com/new](https://vercel.com/new) and log in.
3. Import your **`Pragati_Prototype`** repository.
4. Set the following build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (or leave as root `/`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**!
   > Your prototype is live at `https://your-project.vercel.app` in under 60 seconds!

### Method B: Via Vercel CLI
```bash
npm install -g vercel
cd frontend
vercel
```

---

## ⚡ Option 2: 1-Click Hosting on Netlify (Free)

### Method A: Drag & Drop (No Git required!)
1. Build the production bundle locally:
   ```bash
   cd frontend
   npm run build
   ```
2. Open [https://app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the **`frontend/dist`** folder into the browser window.
4. Your prototype is instantly live with a free `.netlify.app` domain!

### Method B: Via Netlify Git Connect
1. Connect your GitHub repository to Netlify.
2. Set **Base directory** to `frontend`.
3. Set **Build command** to `npm run build`.
4. Set **Publish directory** to `frontend/dist`.
5. Click **Deploy Site**.

---

## ⚡ Option 3: GitHub Pages (Free)

1. In `frontend/package.json`, add:
   ```json
   "homepage": "https://<your-username>.github.io/<repo-name>"
   ```
2. Build and deploy using `gh-pages`:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   npm run build
   npx gh-pages -d dist
   ```

---

## 💻 Option 4: Run Locally Without Docker

You can run the prototype locally on your computer with a single command:

### Windows:
Double-click **`start-prototype.bat`** (or run in terminal):
```powershell
.\start-prototype.bat
```

### Linux / macOS:
```bash
chmod +x start-prototype.sh
./start-prototype.sh
```

Then open **`http://localhost:5173`** in your browser.

---

## 👥 Demo Accounts for Evaluation

You can log in or switch roles on any page with 1 click:

| Role | Name & Designation | Demo Email | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Shri Rajesh Verma, IAS (Chief PMO Officer) | `admin@pragati.demo` | `Demo@123` |
| **Ministry Admin** | Dr. Sunita Deshmukh (Joint Secretary MORTH) | `ministry@pragati.demo` | `Demo@123` |
| **Project Manager** | Vikramaditya Rao (Chief GM, NHAI) | `manager@pragati.demo` | `Demo@123` |
| **Field Officer** | Ananya Sharma (Senior Field Engineer) | `field@pragati.demo` | `Demo@123` |
| **Auditor** | K. S. Narayanan (Principal Auditor, CAG) | `auditor@pragati.demo` | `Demo@123` |
| **Viewer** | Public Observer / Stakeholder | `viewer@pragati.demo` | `Demo@123` |

---

## 🔄 Interactive Features in Prototype Mode

- **Full Project Portfolio**: 20 authentic mega-projects (Atal Tunnel, Chenab Rail Bridge, Khavda Solar, Rishikesh Tunnel, etc.) with real GPS coordinates, budgets (₹ Cr), and risk tiers.
- **National GIS Map**: Real-time Leaflet map visualization of project clusters and state-by-state risk heatmaps.
- **Stateful Edits**: Updating progress, filing field issues, acknowledging alerts, and modifying thresholds persist in your browser's `localStorage`.
- **1-Click Reset**: Click **"Reset Data"** in the top banner at any time to restore the clean Government of India demo dataset.
- **Executive Reports**: Generate and download printable PDF / CSV summary reports instantly.

---

## 🔮 Roadmap: Transitioning from Prototype to Full Backend

When you are ready to connect a live Spring Boot backend + PostgreSQL database later:

1. **Host Backend**: Deploy `backend/` to Render / Railway / AWS / GCP (e.g. `mvn clean package` -> Java 17 JAR).
2. **Connect Frontend**: Set the environment variable in your Vercel/Netlify dashboard:
   ```env
   VITE_API_URL=https://your-live-backend-domain.com/api
   ```
3. The frontend will automatically detect the live backend and seamlessly switch from mock mode to live API mode!
