# HIREHUB PRODUCTION DEPLOYMENT & DEVOPS GUIDE

This guide provides end-to-end instructions for deploying HireHub to Vercel (Frontend & Serverless Edge) and Supabase (PostgreSQL & Storage).

---

## Step 1: Supabase Backend Setup

1. **Create Supabase Project:**
   * Go to [supabase.com](https://supabase.com) and create a new project.
   * Note down your **Project URL** and **Anon Key** from `Project Settings > API`.
2. **Apply Database Migrations:**
   * Open the Supabase **SQL Editor**.
   * Run `supabase/migrations/20261104000000_hirehub_init.sql`.
   * Run `supabase/migrations/20261109000000_security_and_production_hardening.sql`.
   * (Optional) Run `supabase/seed.sql` to populate sample worldwide companies and jobs.
3. **Configure Authentication:**
   * Under `Authentication > URL Configuration`, set:
     * **Site URL:** `https://hirehub.app` (or your production Vercel domain).
     * **Redirect URLs:** `https://hirehub.app/*`, `http://localhost:5173/*`.
   * Under `Authentication > Providers`, enable Email/Password and Google OAuth (with your Google Cloud Client ID).

---

## Step 2: Vercel Frontend Deployment

1. **Connect Repository:**
   * Push your repository to GitHub / GitLab.
   * Import the project into Vercel.
   * **Root Directory:** `./Job Portal Web App` (or `.` if deploying root).
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
2. **Set Environment Variables in Vercel:**
   * `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   * `VITE_SUPABASE_ANON_KEY` = `eyJhbG...`
   * `VITE_APP_URL` = `https://your-custom-domain.com`
3. **Deploy:** Click **Deploy**. Vercel will compile the Vite bundle and configure the SPA route fallbacks via `vercel.json`.

---

## Step 3: Capacitor Android & iOS Native Builds

### Android Build (APK / Android App Bundle):
```powershell
cd "Job Portal Web App"
npm run build
npx cap sync android
npx cap open android
```
* In Android Studio:
  * Select `Build > Generate Signed Bundle / APK`.
  * Select Android App Bundle (.aab) for Google Play Store release.

### iOS Build:
```powershell
cd "Job Portal Web App"
npm run build
npx cap sync ios
npx cap open ios
```
* In Xcode:
  * Select `Product > Archive` for Apple App Store / TestFlight submission.
