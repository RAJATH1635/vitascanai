# Deploying VitaScan AI to Vercel

This guide walks you through deploying the **VitaScan AI** Next.js frontend to **Vercel** and connecting it to your FastAPI backend.

---

## 1. Pre-Deployment Verification Complete

The frontend has been verified and tested for production deployment:
- **Build Passed**: `next build` executed with `0 errors`.
- **Static Pages**: All 31 routes generated successfully.
- **Suspense Boundary**: Wrapped `useSearchParams()` on `/doctor/reports` in a `<Suspense>` boundary to prevent Next.js 14 CSR bailout errors on Vercel.
- **CORS Configured**: The backend's CORS policy accepts all `https://*.vercel.app` domains out of the box.

---

## 2. Deploying via Vercel Dashboard (GitHub / GitLab / Bitbucket)

### Step 1: Push your latest changes to GitHub
```bash
git add .
git commit -m "Prepare VitaScan AI for Vercel deployment"
git push origin main
```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
2. Select your `VitaScan_AI` repository.

### Step 3: Configure Project Settings
Because this repository contains both `frontend/` and `backend/`, you **must configure the Root Directory**:
* **Framework Preset**: `Next.js` (auto-detected)
* **Root Directory**: Click **Edit** and choose `frontend`
* **Build Command**: `next build` (default)
* **Output Directory**: `.next` (default)
* **Install Command**: `npm install` (default)

### Step 4: Environment Variables
Under the **Environment Variables** section, add:
* **Key**: `NEXT_PUBLIC_API_URL`
* **Value**: Your live backend URL, for example:
  ```
  https://your-backend.onrender.com/api/v1
  ```
  *(If testing locally with a tunnel, you can use your ngrok / Cloudflare tunnel URL)*

### Step 5: Click "Deploy"
Vercel will install dependencies, run `next build`, and deploy your application to a live URL (e.g. `https://vitascan-ai.vercel.app`).

---

## 3. Alternative: Deploying via Vercel CLI

If you prefer deploying directly from your terminal:

```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Navigate to the frontend directory
cd frontend

# 3. Deploy
vercel
```
Follow the interactive prompts in the terminal. When asked for environment variables, provide `NEXT_PUBLIC_API_URL`.

---

## 4. Backend Deployment (Important Note)

* Next.js runs on Vercel's serverless edge network.
* The **FastAPI backend** (which runs PyTorch, TensorFlow, XGBoost, and Scikit-learn AI models) requires a Python environment with persistent memory (~500MB+ for neural net models).
* Recommended free/affordable hosts for the backend:
  - **Render** (`render.com`): Deploy as Web Service using `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - **Railway** (`railway.app`): One-click Python container deployment
  - **Fly.io** or **AWS EC2** / **DigitalOcean Droplet**
