# HireHub - AI-Powered Job Portal & ATS Platform

HireHub is a modern, high-performance job discovery, ATS (Applicant Tracking System), recruiter dashboard, and career acceleration platform built with React 19, TypeScript, Vite, and Tailwind CSS.

## 🚀 Key Features

- **Candidate Discovery & Job Matching**: Full-featured job search with interactive GIS/Leaflet map views, multi-facet filtering (remote, full-time, salary, experience, date posted), and instant bookmarking.
- **Role-Based ATS Scanner**: Tailored resume benchmarking against industry skill profiles with keyword matching and actionable suggestions.
- **Interactive Resume Builder**: Real-time PDF preview and generation with customizable templates.
- **Recruiter & Employer Suite**:
  - Job creation, editing, status pipeline management (Applied, Shortlisted, Selected, Rejected).
  - Talent Search: Candidate discovery engine with 1-click "Invite to Apply" workflow.
  - Multi-tier Employer Subscriptions with Razorpay and Stripe checkout flows.
- **Real-Time Communication**: Candidate-recruiter live messaging, encrypted HD video interview rooms, and RFC 5545 `.ics` calendar invitation export.
- **Technical Assessments**: Timed interactive skill quizzes awarding verified profile badges.
- **Mobile First & PWA Ready**: Installable Progressive Web App (PWA) with offline service worker caching, install prompts, and full compatibility for Google Play Store (via TWA) and Apple App Store.
- **Internationalization (i18n)**: Seamless language switcher supporting English, Hindi (हिन्दी), and Gujarati (ગુજરાતી).
- **Compliance & Trust**: GDPR/DPDP compliant cookie consent, job scam reporting, and instant apply celebration confetti.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript 5.7, Tailwind CSS v4, Lucide Icons, Framer Motion
- **State Management**: Zustand
- **Routing**: React Router v7
- **3D & Visuals**: Three.js, React Three Fiber, Recharts
- **Build Tool**: Vite 8

## 📦 Deployment to Vercel

### Option 1: Automatic via Vercel GitHub Integration (Recommended)
1. In Vercel Dashboard, click **Add New... > Project**.
2. Select your repository `Hirehub_application`.
3. In **Project Settings**:
   - **Root Directory**: `Job Portal Web App` (Click *Edit* and select `Job Portal Web App`)
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

### Option 2: Preconfigured Root Deployment
This repository includes a root redirect and script configuration pointing to `Job Portal Web App`.
