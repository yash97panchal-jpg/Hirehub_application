# HireHub UI Refresh Notes

## Visual direction
- Midnight Navy: `#0D1B2A`
- Deep Navy surfaces: `#1B263B` and `#25344D`
- Brushed Gold: `#D4AF37` (hover/deeper gold: `#B89726`)
- Warm Ivory: `#F7F3E9`
- Slate support tone: `#778DA9` / `#415A77`

## Included changes
- Updated the static web/PWA theme and added restrained 3D depth to the hero panel, cards, buttons and icon surfaces.
- Added tablet/mobile layout safeguards, touch-friendly controls and reduced-motion handling.
- Updated the React app theme tokens and wired the existing Three.js hero scene into the home hero.
- Refreshed PWA icon references and bumped the service-worker cache version.
- Preserved the existing route/page modules, job seeker/recruiter/admin workflows, Supabase migrations and existing feature code.
- Removed the local `.env.local` file from the deliverable so machine/session credentials are not distributed. Configure environment variables in your own deployment environment.

## Verification status
- Passed JavaScript syntax checks for `app.js`, `pages.js`, `dynamic.js`, `ui.js` and `sw.js` with Node.
- Confirmed CSS brace balance and checked the archive for `.env.local` / `VERCEL_OIDC_TOKEN` references.
- Full Vite build, TypeScript check and automated tests were not run because dependency installation did not complete in this environment. Run `npm ci`, `npm run typecheck`, `npm test` and `npm run build` inside `Job Portal Web App` before deployment.

## Store publishing
This project ZIP is not a signed Android App Bundle or iOS archive. Complete production Supabase setup, app signing, store metadata, privacy/Data safety disclosures, content rating, screenshots and required testing before submission.
