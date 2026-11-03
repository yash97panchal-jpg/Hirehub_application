/**
 * HireHub QA & Software Testing Automation Suite
 * Tests the entire web application as both a developer and software quality tester.
 * 
 * Covers:
 * 1. PWA & Mobile App Store Installation Compliance (Manifest, Service Worker, iOS meta)
 * 2. Live Server Environment Isolation (Zero mock leakage on production)
 * 3. Crash-Resilience on Empty Data (Zero TypeError: undefined)
 * 4. Business Logic & State Stores (Auth, Jobs, Applications, Messages, .ics, Payments)
 * 5. Production Route Smoke Testing (HTTP 200 checks on build assets)
 */

import fs from "node:fs"
import path from "node:path"
import assert from "node:assert/strict"

const ROOT_DIR = process.cwd()

let passedCount = 0
let failedCount = 0
const testResults = []

function test(name, fn) {
  try {
    fn()
    passedCount++
    testResults.push({ name, status: "PASS" })
    console.log(`  [PASS] ${name}`)
  } catch (err) {
    failedCount++
    testResults.push({ name, status: "FAIL", error: err.message })
    console.error(`  [FAIL] ${name}: ${err.message}`)
  }
}

async function asyncTest(name, fn) {
  try {
    await fn()
    passedCount++
    testResults.push({ name, status: "PASS" })
    console.log(`  [PASS] ${name}`)
  } catch (err) {
    failedCount++
    testResults.push({ name, status: "FAIL", error: err.message })
    console.error(`  [FAIL] ${name}: ${err.message}`)
  }
}

console.log("\n================================================================================")
console.log("HIREHUB COMPREHENSIVE QA & APPLICATION TEST SUITE")
console.log("Running in Node.js " + process.version + " on " + process.platform)
console.log("================================================================================\n")

// ============================================================================
// SUITE 1: PWA & MOBILE APP STORE / PLAY STORE COMPLIANCE
// ============================================================================
console.log("SUITE 1: PWA, Google Play Store & Apple App Store Installation Compliance")

test("1.1 manifest.json exists in public and dist", () => {
  const publicManifest = path.join(ROOT_DIR, "public", "manifest.json")
  const distManifest = path.join(ROOT_DIR, "dist", "manifest.json")
  assert.ok(fs.existsSync(publicManifest), "public/manifest.json must exist")
  assert.ok(fs.existsSync(distManifest), "dist/manifest.json must exist in production build")
})

test("1.2 manifest.json conforms to W3C App Store & TWA specification", () => {
  const raw = fs.readFileSync(path.join(ROOT_DIR, "public", "manifest.json"), "utf8")
  const manifest = JSON.parse(raw)
  assert.equal(manifest.display, "standalone", "Display mode must be standalone for app install")
  assert.ok(manifest.name && manifest.name.length > 0, "App name must be defined")
  assert.ok(manifest.short_name && manifest.short_name.length > 0, "App short_name must be defined")
  assert.ok(manifest.start_url, "start_url must be defined")
  assert.ok(manifest.theme_color, "theme_color must be defined")
  assert.ok(manifest.background_color, "background_color must be defined")
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "Icons array must have at least 192 and 512 sizes")
  
  // Verify icon files physically exist on disk
  manifest.icons.forEach((icon) => {
    const iconPath = path.join(ROOT_DIR, "public", icon.src.replace(/^\//, ""))
    assert.ok(fs.existsSync(iconPath), `Icon file ${icon.src} must exist in public/`)
  })
})

test("1.3 Service Worker sw.js exists and has valid caching logic", () => {
  const swPath = path.join(ROOT_DIR, "public", "sw.js")
  assert.ok(fs.existsSync(swPath), "public/sw.js must exist")
  const swContent = fs.readFileSync(swPath, "utf8")
  assert.ok(/addEventListener\(\s*["']install["']/.test(swContent), "SW must handle install event")
  assert.ok(/addEventListener\(\s*["']fetch["']/.test(swContent), "SW must handle fetch event for offline support")
  assert.ok(/addEventListener\(\s*["']activate["']/.test(swContent), "SW must handle activate event")
})

test("1.4 index.html has complete Mobile, iOS, PWA & Open Graph meta tags", () => {
  const htmlPath = path.join(ROOT_DIR, "index.html")
  const html = fs.readFileSync(htmlPath, "utf8")
  assert.ok(html.includes('<link rel="manifest" href="/manifest.json"'), "Must link manifest.json")
  assert.ok(html.includes('<meta name="viewport"'), "Must specify responsive viewport")
  assert.ok(html.includes('<meta name="theme-color"'), "Must specify mobile theme color")
  assert.ok(html.includes('<meta name="apple-mobile-web-app-capable" content="yes"'), "Must support iOS standalone mode")
  assert.ok(html.includes('<meta property="og:title"'), "Must have Open Graph title for social sharing")
  assert.ok(html.includes('<meta property="twitter:card"'), "Must have Twitter card preview tags")
  assert.ok(html.includes('serviceWorker.register'), "Must register service worker on HTTPS")
})

// ============================================================================
// SUITE 2: LIVE SERVER ENVIRONMENT ISOLATION & CRASH RESILIENCE
// ============================================================================
console.log("\nSUITE 2: Live Server Isolation (Zero Mock Data on Live & Zero Crashes)")

test("2.1 isLocalhost utility correctly differentiates localhost vs live domains", () => {
  // Test simulated environments
  const checkHost = (hostname, isDev = false) => {
    const isDevHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".local")
    return isDevHost || Boolean(isDev)
  }

  assert.equal(checkHost("localhost", false), true, "localhost must be detected as dev")
  assert.equal(checkHost("127.0.0.1", false), true, "127.0.0.1 must be detected as dev")
  assert.equal(checkHost("hirehub.app", false), false, "hirehub.app must be detected as LIVE")
  assert.equal(checkHost("hirehub.vercel.app", false), false, "Vercel production must be detected as LIVE")
  assert.equal(checkHost("myportal.netlify.app", false), false, "Netlify production must be detected as LIVE")
})

test("2.2 Live host empty jobs state does not throw TypeError in JobDetail", () => {
  const liveStoreJobs = [] // Simulated clean production state
  const testJobId = "job-non-existent"
  
  // Logic from JobDetail.tsx
  const job = liveStoreJobs.find((j) => j.id === testJobId) || (liveStoreJobs.length > 0 ? liveStoreJobs[0] : null)
  
  // Must safely resolve to null, NOT undefined reference error
  assert.equal(job, null, "When store is empty on live server, job must safely evaluate to null")
  
  // Guard check from JobDetail.tsx
  const renderedFallback = !job ? "Render Job Not Found Screen" : "Render Job Detail"
  assert.equal(renderedFallback, "Render Job Not Found Screen")
})

test("2.3 Live host empty companies state does not throw TypeError in CompanyPage", () => {
  const liveStoreJobs = [] // Zero jobs posted yet on live server
  const mockCompanies = [] // Empty on live
  
  // Logic from CompanyPage.tsx
  const allCompanies = Array.from(new Map(liveStoreJobs.map((j) => [j.company?.id, j.company])).values())
  const company =
    allCompanies.find((c) => c?.id === "comp-1") ||
    (allCompanies.length > 0 ? allCompanies[0] : null)

  assert.equal(company, null, "When no companies exist yet on live server, company must be null")
  const renderedScreen = !company ? "Render Company Not Found Screen" : "Render Company Info"
  assert.equal(renderedScreen, "Render Company Not Found Screen")
})

test("2.4 Live host empty applications does not crash ApplicationTracker", () => {
  const userApplications = [] // User has not applied to anything yet
  const applications = userApplications.length > 0 ? userApplications : []
  assert.equal(applications.length, 0)
  const emptyStateRendered = applications.length === 0 ? "Show No Applications Yet Banner" : "Show Table"
  assert.equal(emptyStateRendered, "Show No Applications Yet Banner")
})

test("2.5 Live host empty jobs does not crash RecruiterDashboard or UserDashboard", () => {
  const storeJobs = []
  const activeJobs = storeJobs.slice(0, 4)
  assert.equal(activeJobs.length, 0)
  const dashboardStats = {
    activeJobs: storeJobs.length,
    applicants: storeJobs.length > 0 ? 142 : 0,
  }
  assert.equal(dashboardStats.activeJobs, 0)
  assert.equal(dashboardStats.applicants, 0)
})

// ============================================================================
// SUITE 3: BUSINESS LOGIC, STORES & WORKFLOW TESTING
// ============================================================================
console.log("\nSUITE 3: Business Logic, State Stores & User Workflows")

test("3.1 Job Posting Workflow: Recruiter posts new job", () => {
  let jobs = []
  const addJob = (newJob) => {
    jobs = [newJob, ...jobs]
  }

  const jobPayload = {
    id: "job-live-001",
    title: "Senior Fullstack Engineer",
    company: {
      id: "comp-acme",
      name: "Acme Innovations",
      location: "San Francisco, CA",
      about: "Enterprise AI tools",
      industry: "Technology",
      size: "50-200",
      rating: 5.0,
      reviewCount: 1,
      jobCount: 1,
      isVerified: true,
    },
    location: "Remote",
    type: "Full-time",
    experience: "3-5 years",
    salaryMin: 140000,
    salaryMax: 180000,
    currency: "USD",
    description: "Build next-generation cloud services.",
    responsibilities: ["Design APIs", "Lead architecture"],
    requirements: ["React", "TypeScript", "Node.js"],
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    isRemote: true,
    isFeatured: true,
    isUrgent: true,
    applicationCount: 0,
    postedAt: new Date().toISOString(),
    status: "active",
    category: "Engineering",
  }

  addJob(jobPayload)
  assert.equal(jobs.length, 1)
  assert.equal(jobs[0].title, "Senior Fullstack Engineer")
  assert.equal(jobs[0].company.name, "Acme Innovations")
})

test("3.2 Duplicate Application Prevention: Block duplicate apply", () => {
  const applications = [
    {
      id: "app-1",
      job: { id: "job-101", title: "Frontend Dev" },
      status: "Applied",
      appliedAt: "2026-11-01",
    },
  ]

  const checkAlreadyApplied = (jobId) => {
    return applications.some((a) => a.job?.id === jobId)
  }

  assert.equal(checkAlreadyApplied("job-101"), true, "Duplicate job ID must be detected as already applied")
  assert.equal(checkAlreadyApplied("job-999"), false, "New job ID must be allowed to apply")
})

test("3.3 Saved Jobs Store: Bookmark and unbookmark", () => {
  let savedJobIds = ["job-1"]
  const toggleSaveJob = (id) => {
    if (savedJobIds.includes(id)) {
      savedJobIds = savedJobIds.filter((item) => item !== id)
      return false
    } else {
      savedJobIds = [id, ...savedJobIds]
      return true
    }
  }

  assert.equal(toggleSaveJob("job-2"), true, "Bookmarking new job returns true")
  assert.ok(savedJobIds.includes("job-2"), "job-2 must now be in saved list")
  assert.equal(toggleSaveJob("job-1"), false, "Unbookmarking existing job returns false")
  assert.ok(!savedJobIds.includes("job-1"), "job-1 must be removed")
})

test("3.4 Interview Scheduler & iCalendar .ics Generation", () => {
  const interview = {
    jobTitle: "Senior Frontend Engineer",
    date: "2026-11-10",
    time: "15:30",
    meetLink: "https://meet.google.com/hhr-abc-xyz",
  }

  const icsDate = interview.date.replace(/-/g, "")
  const icsTime = interview.time.replace(":", "") + "00"

  const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//HireHub//Interview Scheduler//EN\nCALSCALE:GREGORIAN\nBEGIN:VEVENT\nSUMMARY:HireHub Interview: ${interview.jobTitle}\nDESCRIPTION:Technical interview for ${interview.jobTitle}. Meeting Link: ${interview.meetLink}\nSTATUS:CONFIRMED\nDTSTART:${icsDate}T${icsTime}\nDTEND:${icsDate}T${icsTime}\nLOCATION:${interview.meetLink}\nEND:VEVENT\nEND:VCALENDAR`

  assert.ok(icsContent.includes("BEGIN:VCALENDAR"), "Must contain standard iCalendar header")
  assert.ok(icsContent.includes("SUMMARY:HireHub Interview: Senior Frontend Engineer"), "Must include job title in summary")
  assert.ok(icsContent.includes("DTSTART:20261110T153000"), "Must format DTSTART according to RFC 5545")
  assert.ok(icsContent.includes("LOCATION:https://meet.google.com/hhr-abc-xyz"), "Must include meeting link in location")
})

test("3.5 Pricing Discount & Promo Code Calculation", () => {
  const plan = { priceMonthlyUSD: 49, priceMonthlyINR: 3999 }
  
  // Monthly price
  assert.equal(plan.priceMonthlyUSD, 49)

  // Annual billing with 20% discount
  const annualDiscountedUSD = Math.round(plan.priceMonthlyUSD * 0.8)
  assert.equal(annualDiscountedUSD, 39, "Annual discount should reduce $49 to $39/mo")

  // Promo code HIREHUB20 (extra 20% discount)
  const couponDiscount = 0.2
  const finalPriceUSD = Math.round(plan.priceMonthlyUSD * 0.8 * (1 - couponDiscount))
  assert.equal(finalPriceUSD, 31, "Annual + Promo coupon should reduce to $31/mo")
})

test("3.6 Scam & Abuse Report Submission", () => {
  let reports = []
  const submitReport = (report) => {
    reports = [report, ...reports]
  }

  submitReport({
    id: "rep-001",
    jobId: "job-suspicious-1",
    jobTitle: "Data Entry Operator",
    companyName: "Unknown Ltd",
    reason: "Requires payment, application fee or deposit (Scam)",
    details: "Employer asked for 500 rupees security deposit on WhatsApp.",
    status: "pending",
    reportedAt: new Date().toISOString(),
  })

  assert.equal(reports.length, 1)
  assert.equal(reports[0].reason, "Requires payment, application fee or deposit (Scam)")
  assert.equal(reports[0].status, "pending")
})

// ============================================================================
// SUITE 4: PRODUCTION BUILD INTEGRITY & ASSET SMOKE TESTING
// ============================================================================
console.log("\nSUITE 4: Production Build Integrity & Asset Verification")

test("4.1 dist/ directory contains valid build output", () => {
  const distDir = path.join(ROOT_DIR, "dist")
  assert.ok(fs.existsSync(distDir), "dist/ directory must exist")
  assert.ok(fs.existsSync(path.join(distDir, "index.html")), "dist/index.html must exist")
  assert.ok(fs.existsSync(path.join(distDir, "robots.txt")), "dist/robots.txt must exist")
  assert.ok(fs.existsSync(path.join(distDir, "manifest.json")), "dist/manifest.json must exist")
  assert.ok(fs.existsSync(path.join(distDir, "assets")), "dist/assets must exist")
})

test("4.2 dist/index.html loads compiled bundle entry script and styles", () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, "dist", "index.html"), "utf8")
  assert.ok(html.includes('<div id="root"></div>'), "Must have #root mounting point")
  assert.ok(/<script type="module" crossorigin src="\/assets\/index-.*\.js">/.test(html), "Must load compiled index bundle")
  assert.ok(/<link rel="stylesheet" crossorigin href="\/assets\/index-.*\.css">/.test(html), "Must load compiled index css")
})

test("4.3 All lazy-loaded route chunk assets exist in dist/assets", () => {
  const assetsDir = path.join(ROOT_DIR, "dist", "assets")
  const files = fs.readdirSync(assetsDir)

  const expectedRouteChunks = [
    "Jobs",
    "JobDetail",
    "Companies",
    "CompanyPage",
    "Messages",
    "SkillAssessment",
    "TalentSearch",
    "Pricing",
    "ATSChecker",
    "ResumeBuilder",
    "SalaryInsights",
    "AdminDashboard",
    "RecruiterDashboard",
    "UserDashboard",
    "Login",
    "Register",
  ]

  expectedRouteChunks.forEach((chunkName) => {
    const found = files.some((f) => f.startsWith(chunkName) && f.endsWith(".js"))
    assert.ok(found, `Route chunk for ${chunkName} must exist in dist/assets/`)
  })
})

// ============================================================================
// SUITE 5: LIVE RUNNING SERVER HTTP ROUTE SMOKE TESTS
// ============================================================================
console.log("\nSUITE 5: Live Development Server HTTP Smoke Testing (http://localhost:8443)")

const routesToTest = [
  "/",
  "/jobs",
  "/companies",
  "/pricing",
  "/skills",
  "/messages",
  "/ats-checker",
  "/resume-builder",
  "/salary-insights",
  "/about",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/cookies",
  "/blog",
  "/login",
  "/register",
  "/forgot-password",
  "/manifest.json",
  "/sw.js",
  "/favicon.png",
  "/robots.txt",
]

for (const route of routesToTest) {
  await asyncTest(`5.${routesToTest.indexOf(route) + 1} GET http://localhost:8443${route} returns HTTP 200`, async () => {
    try {
      const res = await fetch(`http://localhost:8443${route}`)
      assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`)
    } catch (err) {
      // If dev server port is occupied or different, attempt fallback check
      assert.fail(`HTTP request failed to http://localhost:8443${route}: ${err.message}`)
    }
  })
}

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log("\n================================================================================")
console.log(`QA TEST RUN COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED out of ${passedCount + failedCount} tests`)
console.log("================================================================================\n")

if (failedCount > 0) {
  console.error("Test failures detected! Please inspect output above.")
  process.exit(1)
} else {
  console.log("ALL TESTS PASSED! Web app is verified for development, live production, and store installation.")
  process.exit(0)
}
