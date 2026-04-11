# ☁️ Microsoft Azure Deployment Guide

This guide provides step-by-step instructions for deploying the **Smart Crop Advisory** application (FastAPI backend + React frontend) on Microsoft Azure.

---

## 🏗️ 1. Deploy the Backend (Azure App Service)

We will use **Azure App Service (Linux)** to host the FastAPI Python backend. Since the application uses Machine Learning libraries (TensorFlow, scikit-learn), we recommend choosing a plan with at least 1GB - 2GB of RAM (e.g., Basic B1 or higher).

### Step 1.1: Create the Web App
1. Log in to the [Azure Portal](https://portal.azure.com/).
2. Search for and select **App Services**, then click **Create** -> **Web App**.
3. **Basics Tab**:
   - **Subscription**: Choose your subscription.
   - **Resource Group**: Create a new one (e.g., `smartcrop-rg`).
   - **Name**: `smartcrop-api` (must be globally unique).
   - **Publish**: Code.
   - **Runtime stack**: Python 3.10 or 3.11.
   - **Operating System**: Linux.
   - **Region**: Choose the region closest to your users (e.g., Central India).
   - **Pricing Plan**: Basic B1 (Free F1 *might* run out of memory during TensorFlow startup).
4. Click **Review + create**, then **Create**. Wait for deployment to finish.

### Step 1.2: Configure Deployment
1. Go to your newly created App Service resource (`smartcrop-api`).
2. On the left sidebar, click **Deployment Center**.
3. **Source**: Select **GitHub**.
4. Authenticate and select your organization, repository, and branch.
5. Click **Save**. This will automatically create a GitHub Actions workflow file in your repo.

### Step 1.3: Set Startup Command & Environment Variables
1. From the left sidebar, click **Configuration** (under *Settings*).
2. Go to the **General settings** tab.
3. In the **Startup Command** field, enter:
   ```bash
   cd api && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```
   *(Note: Azure automatically routes port 80 to container port 8000).*
4. Navigate to the **Application settings** tab and add the following variables:
   - `JWT_SECRET` : *(Your generated secure secret)*
   - `SKLEARN_ALLOW_DEPRECATED_SKLEARN_PACKAGE_INSTALL` : `True`
   - `SUPABASE_URL` : *(Your Supabase project URL)*
   - `SUPABASE_ANON_KEY` : *(Your Supabase anon key)*
5. Click **Save** and restart the App Service.

Your backend API will be live at: `https://smartcrop-api.azurewebsites.net`

---

## 🌐 2. Deploy the Frontend (Azure Static Web Apps)

We will use **Azure Static Web Apps**, which is perfectly optimized for modern JavaScript frameworks like React and Vite.

### Step 2.1: Create the Static Web App
1. Go back to the Azure Portal home.
2. Search for **Static Web Apps** and click **Create**.
3. **Basics Tab**:
   - **Subscription**: Select your subscription.
   - **Resource Group**: `smartcrop-rg` (Same as the backend).
   - **Name**: `smartcrop-web`.
   - **Plan type**: Free (sufficient for most frontend scenarios).
   - **Region**: Choose your closest region.
4. **Deployment details**:
   - **Source**: GitHub.
   - Authorize GitHub and select your Repository and Branch.
5. **Build Details**:
   - **Build Presets**: custom
   - **App location**: `apps/web`
   - **Api location**: *(Leave blank)*
   - **Output location**: `dist`
6. Click **Review + create**, then **Create**. 

### Step 2.2: Configure Environment Variables
While the Static Web App is deploying, you need to provide the environment variables so that Vite can inject them during the build process. 
*(Note: Because Static Web Apps build via GitHub Actions, we actually need to add the secrets to GitHub, or define them in Azure before the first run).*

We recommend adding them via the **Azure Portal**:
1. Go to your new **Static Web App** resource (`smartcrop-web`).
2. On the left sidebar, click **Environment variables**.
3. Click **Add** to insert the following environment variables:
   - Name: `VITE_API_URL` | Value: `https://smartcrop-api.azurewebsites.net/api`
   - Name: `VITE_GEMINI_API_KEY` | Value: *(Your Gemini API key)*
   - Name: `VITE_GOOGLE_CLIENT_ID` | Value: *(Your Google Client ID)*
4. Click **Apply** / **Save**.

### Step 2.3: Re-trigger Build (If needed)
If the initial GitHub Action build failed because it was missing `VITE_API_URL` during the `npm run build` process, go to your GitHub Repository -> **Actions** -> click the most recent workflow -> click **Re-run jobs**.

Your frontend will soon be live at a generated URL such as:
`https://lively-bush-0x...azurestaticapps.net`

---

## ✅ Deployment Summary
- **Backend**: Managed via *Azure App Service (Linux)* + GitHub Actions.
- **Frontend**: Managed via *Azure Static Web Apps* + GitHub Actions.
- **Database**: Hosted externally on *Supabase*.

For troubleshooting frontend routing issues on Azure, ensure you add a `staticwebapp.config.json` in the `apps/web` folder to redirect all traffic to `index.html` (for React Router fallback):
```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```
