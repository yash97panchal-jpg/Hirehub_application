# HIREHUB ENVIRONMENT SETUP & CONFIGURATION

This document explains every environment variable used across HireHub, distinguishing between production secrets, public client variables, and development fallbacks.

---

## 1. Environment Variables Reference

| Variable Name | Environment | Required | Description | Example / Format |
| :--- | :--- | :---: | :--- | :--- |
| `VITE_SUPABASE_URL` | Production & Staging | **YES** | The HTTPS endpoint of your Supabase Cloud instance. | `https://xyzproject.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Production & Staging | **YES** | The public JWT anon key for Supabase API requests. | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `VITE_EMAIL_API_URL` | Production | Optional | Edge Function or transactional email webhook (e.g. Resend). | `https://xyz.supabase.co/functions/v1/send-email` |
| `VITE_APP_URL` | Production | Optional | Canonical public URL used for SEO, email redirects, and OAuth callbacks. | `https://hirehub.app` |
| `VITE_DEV_ADMIN_EMAIL` | Local Dev Only | No | Local development test email. Ignored in production builds. | `admin@example.com` |
| `VITE_DEV_ADMIN_PASSWORD` | Local Dev Only | No | Local development test password. Ignored in production builds. | `change-me-dev-only` |

---

## 2. Local Development Setup

1. Copy the example configuration to your local environment:
   ```powershell
   Copy-Item ".\Job Portal Web App\.env.example" ".\Job Portal Web App\.env.local"
   ```
2. Populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your project keys.
3. Start the Vite development server:
   ```powershell
   cd "Job Portal Web App"
   npm install
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.
