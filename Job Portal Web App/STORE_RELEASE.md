# HireHub Mobile Store Release & Publishing Handbook

> Complete step-by-step production handbook for publishing **HireHub** (`com.hirehub.jobportal`) to Google Play Store and Apple App Store.

---

## 1. Application Metadata & Identifiers

| Parameter | Value |
|---|---|
| **App Name** | HireHub |
| **Package Name / Bundle ID** | `com.hirehub.jobportal` |
| **Current Version** | `1.0.0` (Build / Version Code: `1`) |
| **Target Platforms** | Android (API 24 to 34+) & iOS (14.0+) |
| **Primary Category** | Business / Productivity / Jobs |
| **Live Production Web URL** | [https://hirehub-job-portal-psi.vercel.app](https://hirehub-job-portal-psi.vercel.app) |
| **Public Privacy Policy** | [https://hirehub-job-portal-psi.vercel.app/privacy](https://hirehub-job-portal-psi.vercel.app/privacy) |
| **Public Terms of Service** | [https://hirehub-job-portal-psi.vercel.app/terms](https://hirehub-job-portal-psi.vercel.app/terms) |
| **Public Account Deletion URL** | [https://hirehub-job-portal-psi.vercel.app/delete-account](https://hirehub-job-portal-psi.vercel.app/delete-account) |
| **Support Email** | `support@hirehub.com` |

---

## 2. Reviewer Demo Accounts (Mandatory for App Reviewers)

Provide these exact pre-configured accounts in the review notes for both Google Play and Apple App Store:

### Job Seeker Review Account
- **Role:** Candidate / Job Seeker
- **Email:** `candidate@hirehub.com`
- **Password:** `Candidate@12345`
- **Notes:** Use to test job search, Bengaluru & global map filtering, Easy Apply, external apply tracking, saved jobs, and profile editing.

### Recruiter Review Account
- **Role:** Verified Corporate Recruiter (Stripe)
- **Email:** `recruiter@stripe.com`
- **Password:** `Recruiter@12345`
- **Notes:** Use to test job posting, apply mode selection (Easy Apply vs External ATS), applicant pipeline management, and candidate status changes.

### Administrator Review Account
- **Role:** Global System Administrator
- **Email:** `admin@hirehub.com`
- **Password:** `[Configured securely via Supabase Auth dashboard / Secure Environment]`
- **Notes:** Full privileges to view company verification moderation queues, reported job flags, and platform analytics.

---

## 3. Google Play Store Publishing Guide

### Step 3.1: Generate Android Upload Keystore (Run Once & Back Up Safely)
Open terminal / PowerShell in the Android folder:

```bash
keytool -genkey -v -keystore hirehub-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias hirehub-key
```

*Keep `hirehub-release-key.jks` and your password in a safe password vault. If you lose this key, you cannot update existing installs on Google Play.*

### Step 3.2: Configure Gradle Release Signing (Optional Auto-Sign)
In `Job Portal Web App/android/app/build.gradle` inside `android { ... }`:
```groovy
signingConfigs {
    release {
        storeFile file("path/to/hirehub-release-key.jks")
        storePassword "YOUR_STORE_PASSWORD"
        keyAlias "hirehub-key"
        keyPassword "YOUR_KEY_PASSWORD"
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### Step 3.3: Build Signed `.aab` (Android App Bundle)
Using Android Studio:
1. Run `npm run android` or open `Job Portal Web App/android` in Android Studio.
2. In the menu, go to **Build** → **Generate Signed Bundle / APK...**
3. Select **Android App Bundle (.aab)**.
4. Select your `hirehub-release-key.jks`, enter credentials, and select **Release**.
5. Output file is located at `android/app/release/app-release.aab`.

Or from command line:
```bash
cd "Job Portal Web App/android"
./gradlew bundleRelease
```

### Step 3.4: Store Listing Assets & Text
Use pre-generated assets found in `Job Portal Web App/public/`:
- **App Icon:** `Job Portal Web App/public/play-store-icon-512.png` (512×512, 32-bit PNG)
- **Feature Graphic:** `Job Portal Web App/public/play-store-feature-1024x500.png` (1024×500 PNG)
- **Short Description (80 chars max):**
  > Discover top tech jobs, apply with Easy Apply or ATS, and track your applications.
- **Full Description:**
  > HireHub is the modern job marketplace connecting ambitious professionals with top tech companies worldwide.
  >
  > Key Features:
  > • Interactive Job Map: Browse jobs by tech hub (Bengaluru, San Francisco, London, Tokyo, Berlin, Singapore) with live geolocation.
  > • Flexible Application Options: Choose between rapid in-app "Easy Apply" with saved resume attachments or direct ATS submission on company sites.
  > • Application Tracker: Real-time status tracker for both in-app and external applications.
  > • Recruiter Suite: Post jobs, select screening questions, review candidates, and schedule interviews.
  > • Privacy First: Zero tracking ads, encrypted transit, and full account deletion controls.

### Step 3.5: Google Play Data Safety Questionnaire Declarations
Answer the Google Play Data Safety form with the following declarations:
1. **Does your app collect or share user data?**
   - **Yes**
2. **Is all user data collected by your app encrypted in transit?**
   - **Yes** (Supabase HTTPS/TLS 1.3)
3. **Do you provide a way for users to request that their data be deleted?**
   - **Yes**
4. **Delete Account Link:**
   - Add: `https://hirehub-job-portal-psi.vercel.app/delete-account`
5. **Data Types Collected:**
   - **Name:** Collected for App Functionality & Account Management. Not shared with third parties.
   - **Email Address:** Collected for App Functionality & Account Management.
   - **Phone Number:** Collected (optional) for Job Application Contact.
   - **User Content (Files / Resumes / Cover Letters):** Collected for App Functionality (submitting applications to employers).
   - **User ID:** Collected for Account Management.

---

## 4. Apple App Store Publishing Guide

### Step 4.1: Open Project in Xcode
1. Run `npm run ios` or open `Job Portal Web App/ios/App/App.xcworkspace` in Xcode on macOS.
2. Under **Target: App** → **Signing & Capabilities**:
   - Check **Automatically manage signing**.
   - Select your registered **Apple Developer Team**.
   - Verify Bundle Identifier is `com.hirehub.jobportal`.

### Step 4.2: Verify Apple Privacy Manifest (`PrivacyInfo.xcprivacy`)
The project includes `Job Portal Web App/ios/App/App/PrivacyInfo.xcprivacy` with all required reason APIs declared:
- `CA92.1` (User Defaults for local app state)
- `C617.1` (File Timestamps for uploaded resumes)
- `35F9.1` (System Boot Time for uptime metrics)
- `E174.1` (Disk Space check before caching resumes)
- Zero tracking declared (`NSPrivacyTracking: false`).

### Step 4.3: App Store Connect Listing
- **App Name:** HireHub - Job Search & Careers
- **Primary Category:** Business
- **Secondary Category:** Productivity
- **Privacy Policy URL:** `https://hirehub-job-portal-psi.vercel.app/privacy`
- **Support URL:** `https://hirehub-job-portal-psi.vercel.app/contact`
- **Account Deletion Explanation:**
  > Users can delete their account immediately inside the app via Settings → Delete Account, or submit a request via our public portal at https://hirehub-job-portal-psi.vercel.app/delete-account. All profile information, uploaded resumes, and application records are purged from the database immediately.

### Step 4.4: Archive and Upload to TestFlight
1. In Xcode, set active scheme destination to **Any iOS Device (arm64)**.
2. Select **Product** → **Archive**.
3. Once archiving finishes, click **Distribute App** → **App Store Connect**.
4. Select **Upload**.
5. Once processing completes in App Store Connect, test via **TestFlight**, then submit for App Review.

---

## 5. Summary Checklist Before Final Submission

- [x] Bundle ID changed to owned ID `com.hirehub.jobportal` in `capacitor.config.ts`, `build.gradle`, and `Info.plist`.
- [x] High-resolution 1024x1024 app icon & 512x512 Play Store icon created in `public/`.
- [x] Google Play feature graphic 1024x500 created in `public/`.
- [x] Apple Privacy Manifest `PrivacyInfo.xcprivacy` configured with required reason APIs.
- [x] Working in-app account deletion (`authService.deleteAccount`) tested.
- [x] Public web account deletion URL live at `/delete-account`.
- [x] Prominent mobile Log Out button added across header, mobile drawer, dashboard, profile, and settings.
- [x] Bengaluru and global job map filtering and coordinate centering synced.
- [x] Automated test suite passing (9/9 Vitest unit tests).
- [x] TypeScript type checking passing (0 errors).
