# 🚀 Quick Deployment Guide: PRAGATI Platform (Zero-Docker)

Deploy and host the **PRAGATI National Infrastructure Monitoring Platform** instantly **without Docker, without databases, and without backend server setup**.

The frontend runs with **Interactive National Infrastructure Data** (20 Government of India projects across States & Ministries, Leaflet GIS maps, EVM calculations, risk escalation, role portals, stateful issue management, and PDF report downloads).

---

## ⚡ Option 1: Hosting on Render (Recommended - Free)

Render gives you free static site hosting with custom domains, automatic SSL, and continuous deployment from GitHub.

### Method A: Via Render Blueprint (Automatic 1-Click Setup)
We have included a [`render.yaml`](file:///d:/pragati/render.yaml) blueprint in the repository:
1. Push your project to **GitHub** or **GitLab**.
2. Go to **[dashboard.render.com](https://dashboard.render.com/)** and log in.
3. Click **"New +"** and select **"Blueprint"**.
4. Connect your **`Pragati_Prototype`** repository.
5. Render reads `render.yaml` and configures the build and rewrite routes automatically!
6. Click **"Apply"** — Your site will be deployed and live on a `*.onrender.com` URL in ~1 minute.

---

### Method B: Via Render Web Dashboard (Manual Setup)
If you prefer creating a **Static Site** directly in the Render dashboard:
1. Go to **[dashboard.render.com](https://dashboard.render.com/)** -> Click **"New +"** -> Select **"Static Site"**.
2. Connect your Git repository.
3. Configure the following settings:
   - **Name**: `pragati-portal` (or any name you prefer)
   - **Branch**: `main` (or `master`)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **"Redirects/Rewrites"** (Scroll down on the settings page):
   - Click **"Add Rule"**
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. Click **"Create Static Site"**.
   > Your application is deployed and live for free!

---

## ⚡ Option 2: 1-Click Hosting on Vercel (Free)

1. Push your repository to **GitHub**.
2. Go to [https://vercel.com/new](https://vercel.com/new) and log in.
3. Import your **`Pragati_Prototype`** repository.
4. Set build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**!

---

## ⚡ Option 3: 1-Click Hosting on Netlify (Free)

### Method A: Drag & Drop (No Git required)
1. Build the production bundle locally:
   ```bash
   cd frontend
   npm run build
   ```
2. Open [https://app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the **`frontend/dist`** folder into the browser window.

### Method B: Via Netlify Git Connect
1. Connect your GitHub repository to Netlify.
2. Set **Base directory**: `frontend`.
3. Set **Build command**: `npm run build`.
4. Set **Publish directory**: `frontend/dist`.
5. Click **Deploy Site**.

---

## 💻 Option 4: Run Locally Without Docker

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

## 👥 Authorized Roles for Portal Evaluation

You can sign in directly with 1-click on the login screen or switch roles anytime using the top navigation bar:

| Role | Name & Title | Authorized Email |
| :--- | :--- | :--- |
| **Super Admin** | Shri Rajesh Verma, IAS (Chief PMO Officer) | `admin@pragati.demo` |
| **Ministry Admin** | Dr. Sunita Deshmukh (Joint Secretary MORTH) | `ministry@pragati.demo` |
| **Project Manager** | Vikramaditya Rao (Chief GM, NHAI) | `manager@pragati.demo` |
| **Field Officer** | Ananya Sharma (Senior Field Engineer) | `field@pragati.demo` |
| **Auditor** | K. S. Narayanan (Principal Auditor, CAG) | `auditor@pragati.demo` |
| **Viewer** | Public Observer / Stakeholder | `viewer@pragati.demo` |

---

## 🔮 Future Roadmap: Connecting Full Spring Boot + Database on Render

When you build the full backend later and want to host it on Render:
1. Create a **Web Service** on Render for `backend/` (`mvn clean package` -> Docker or Java Native).
2. Set the environment variable in your frontend static site on Render:
   ```env
   VITE_API_URL=https://your-pragati-backend.onrender.com/api
   ```
3. The frontend automatically switches to the live backend seamlessly!
