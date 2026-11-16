import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  BarChart3,
  Check,
  Compass,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Bell,
  MapPin,
  Clock3,
  Wallet,
  Plus,
  SlidersHorizontal,
  Bookmark,
  CalendarDays,
  Settings,
  UserRound,
  Upload,
  LockKeyhole,
  Star,
  TrendingUp,
  MoreHorizontal,
  BookOpen,
  HelpCircle,
  Phone,
} from 'lucide-react';
import {
  demoJobs,
  readSession,
  writeSession,
  type Job,
  type Role,
  type User,
  supabase,
} from './lib/data';

import { HireHubLogo } from './components/HireHubLogo';
import { CompanyLogo } from './components/CompanyLogo';
import { FloatingDock } from './components/FloatingDock';

// Import our rich new pages
import Companies from './pages/Companies';
import ATSChecker from './pages/ATSChecker';
import SalaryInsights from './pages/SalaryInsights';
import Resources from './pages/Resources';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import DockShowcase from './pages/DockShowcase';

function App() {
  const [user, setUser] = useState<User | null>(readSession());
  const [mobile, setMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobile(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        const { data: p } = await supabase!
          .from('profiles')
          .select('full_name,role,company_name')
          .eq('id', u.id)
          .maybeSingle();
        const next: User = {
          id: u.id,
          name: p?.full_name || u.email?.split('@')[0] || 'Member',
          email: u.email || '',
          role: (p?.role || 'job_seeker') as Role,
          company: p?.company_name,
        };
        setUser(next);
        writeSession(next);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!s) {
        setUser(null);
        writeSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (u: User) => {
    setUser(u);
    writeSession(u);
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    writeSession(null);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <HireHubLogo size={38} />
        </Link>

        <nav className={mobile ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/jobs">Find jobs</NavLink>
          <NavLink to="/companies">Companies</NavLink>
          <NavLink to="/salary">Salaries</NavLink>
          <NavLink to="/ats">ATS Checker</NavLink>
          <NavLink to="/resources">Resources</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/dock">Dock</NavLink>

          {user && (
            <NavLink
              to={
                user.role === 'admin'
                  ? '/admin'
                  : user.role === 'recruiter'
                  ? '/recruiter'
                  : '/dashboard'
              }
            >
              Dashboard
            </NavLink>
          )}

          <div className="mobile-nav-action">
            {user ? (
              <button className="btn btn-outline" onClick={logout}>
                <LogOut size={16} /> Sign out
              </button>
            ) : (
              <Link className="btn btn-dark" to="/login">
                Sign in
              </Link>
            )}
          </div>
        </nav>

        <div className="top-actions">
          <Link to="/post-job" className="post-link">
            Post a job <ArrowUpRight size={15} />
          </Link>
          {user ? (
            <button
              className="avatar"
              title="Account"
              onClick={() =>
                location.pathname.startsWith('/dashboard')
                  ? logout()
                  : window.location.assign('/dashboard')
              }
            >
              {user.name.slice(0, 1).toUpperCase()}
            </button>
          ) : (
            <Link className="btn btn-dark sign-in" to="/login">
              Sign in <ArrowRight size={15} />
            </Link>
          )}
          <button
            className="icon-btn menu-toggle"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle menu"
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail user={user} />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/ats" element={<ATSChecker />} />
          <Route path="/salary" element={<SalaryInsights />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dock" element={<DockShowcase />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="/terms" element={<Legal />} />
          <Route path="/login" element={<Auth onLogin={login} />} />
          <Route path="/register" element={<Auth onLogin={login} register />} />
          <Route
            path="/dashboard"
            element={<Dashboard user={user} onLogin={login} />}
          />
          <Route path="/applications" element={<Applications user={user} />} />
          <Route path="/saved" element={<Saved user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/recruiter" element={<Recruiter user={user} />} />
          <Route path="/post-job" element={<PostJob user={user} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating macOS-Style Navigation Dock */}
      <FloatingDock />
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <HireHubLogo size={36} light={true} />
          </Link>
          <p style={{ marginTop: '10px', maxWidth: '340px', color: '#c0c9d1', fontSize: '13px', lineHeight: '1.6' }}>
            Good work starts with the right opportunity. A transparent, verified hiring marketplace connecting ambitious candidates with modern product studios and tech companies.
          </p>
        </div>

        <div className="footer-links" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '24px', flex: 1, maxWidth: '640px' }}>
          <div>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
              Job Seekers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <Link to="/jobs">Browse Jobs</Link>
              <Link to="/companies">Company Directory</Link>
              <Link to="/salary">Salary Insights</Link>
              <Link to="/ats">ATS Resume Checker</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <Link to="/about">About HireHub</Link>
              <Link to="/resources">Career Playbooks</Link>
              <Link to="/faq">Help & FAQ</Link>
              <Link to="/contact">Contact Support</Link>
              <Link to="/dock">macOS Navigation Dock</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
              Employers & Trust
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <Link to="/post-job">Post a Job</Link>
              <Link to="/register">Recruiter Sign In</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 HireHub Technologies Inc. All rights reserved.</span>
        <span>Built for transparent careers.</span>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-grain" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> A MORE HUMAN WAY TO WORK
          </div>
          <h1>
            Your next chapter
            <br />
            starts <em>here.</em>
          </h1>
          <p className="hero-lede">
            Find meaningful work, meet ambitious teams, and move your career forward with confidence.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-gold" to="/jobs">
              Explore opportunities <ArrowUpRight size={17} />
            </Link>
            <Link className="text-link" to="/register">
              Create your profile <ArrowRight size={15} />
            </Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              <span>AK</span>
              <span>RM</span>
              <span>JD</span>
              <b>+</b>
            </div>
            <div>
              <strong>People finding their next move</strong>
              <small>Join a growing community of professionals</small>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="glass-panel">
            <div className="glass-header">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span>hirehub · verified openings</span>
            </div>
            <div className="card-mock">
              <div className="mock-role">
                <strong>Junior Data Analyst</strong>
                <small>Northstar Labs · Ahmedabad (Hybrid)</small>
              </div>
              <span className="pill pill-gold">Active opening</span>
            </div>
            <div className="card-mock">
              <div className="mock-role">
                <strong>Frontend Developer</strong>
                <small>PixelForge Studio · Remote India</small>
              </div>
              <span className="pill pill-green">Shortlisting</span>
            </div>
          </div>
          <div className="floating-badge float-top">
            <Sparkles size={16} />
            <span>98% Placement Satisfaction</span>
          </div>
          <div className="floating-badge float-bottom">
            <ShieldCheck size={16} />
            <span>Verified Salaries & Zero Fees</span>
          </div>
          <div className="hero-footnote">
            <span>VERIFIED ROLES</span>
            <span>TRANSPARENT CTC</span>
            <span>DIRECT ACCESS</span>
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="section" style={{ paddingTop: '50px', paddingBottom: '30px' }}>
        <div className="section-heading" style={{ marginBottom: '28px' }}>
          <div>
            <div className="eyebrow dark-eyebrow">PLATFORM TOOLS</div>
            <h2>
              Tools designed for <em>modern job seekers.</em>
            </h2>
          </div>
        </div>

        <div className="listing-grid">
          <Link to="/ats" className="workspace-card" style={{ padding: '24px', transition: 'transform 0.2s', display: 'block' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--navy)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', marginBottom: '14px' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: 'var(--navy)' }}>ATS Resume Checker</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 14px', lineHeight: '1.6' }}>
              Scan your resume against automated ATS filters, find missing keywords, and optimize for recruiter screeners.
            </p>
            <span className="text-link" style={{ fontSize: '12px' }}>
              Test your resume <ArrowRight size={13} />
            </span>
          </Link>

          <Link to="/companies" className="workspace-card" style={{ padding: '24px', transition: 'transform 0.2s', display: 'block' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--navy)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', marginBottom: '14px' }}>
              <Building2 size={20} />
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: 'var(--navy)' }}>Verified Companies</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 14px', lineHeight: '1.6' }}>
              Explore hiring teams, engineering cultures, tech stacks, and active open roles with zero hidden recruiters.
            </p>
            <span className="text-link" style={{ fontSize: '12px' }}>
              Browse company directory <ArrowRight size={13} />
            </span>
          </Link>

          <Link to="/salary" className="workspace-card" style={{ padding: '24px', transition: 'transform 0.2s', display: 'block' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--navy)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', marginBottom: '14px' }}>
              <Wallet size={20} />
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: 'var(--navy)' }}>Salary Calculator</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 14px', lineHeight: '1.6' }}>
              Compare real CTC ranges across experience levels, tech specializations, and remote friendly positions.
            </p>
            <span className="text-link" style={{ fontSize: '12px' }}>
              Explore benchmarks <ArrowRight size={13} />
            </span>
          </Link>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="trust-strip">
        <span>TOP HIRING PARTNERS</span>
        <i>·</i>
        <b style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CompanyLogo name="Google" size={18} /> Google
        </b>
        <i>·</i>
        <b style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CompanyLogo name="Microsoft" size={18} /> Microsoft
        </b>
        <i>·</i>
        <b style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CompanyLogo name="Razorpay" size={18} /> Razorpay
        </b>
        <i>·</i>
        <b style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CompanyLogo name="Stripe" size={18} /> Stripe
        </b>
        <i>·</i>
        <b style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CompanyLogo name="Swiggy" size={18} /> Swiggy
        </b>
        <i>·</i>
        <b style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CompanyLogo name="Zomato" size={18} /> Zomato
        </b>
        <i>·</i>
        <b style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <CompanyLogo name="Vercel" size={18} /> Vercel
        </b>
      </div>

      {/* Featured Jobs Section */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark-eyebrow">CURATED OPPORTUNITIES</div>
            <h2>
              Roles that <em>matter.</em>
            </h2>
          </div>
          <Link className="text-link" to="/jobs">
            View all {demoJobs.length} roles <ArrowRight size={15} />
          </Link>
        </div>
        <div className="job-grid">
          {demoJobs.slice(0, 4).map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Dark Band How it Works */}
      <section className="dark-band" id="how">
        <div className="band-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> THE PROCESS
          </div>
          <h2>
            Less searching.
            <br />
            <em>More becoming.</em>
          </h2>
          <p>Everything you need to make your next move, in one considered place.</p>
          <Link className="btn btn-gold" to="/register">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
        <div className="steps">
          <div className="step">
            <span>01</span>
            <div>
              <h3>Build your story</h3>
              <p>Showcase your skills, experience and the work you want to do.</p>
            </div>
            <UserRound />
          </div>
          <div className="step">
            <span>02</span>
            <div>
              <h3>Discover your fit</h3>
              <p>Explore thoughtful opportunities from teams worth knowing.</p>
            </div>
            <Compass />
          </div>
          <div className="step">
            <span>03</span>
            <div>
              <h3>Move with clarity</h3>
              <p>Apply, track progress and stay on top of every conversation.</p>
            </div>
            <BarChart3 />
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section className="section company-section" id="companies">
        <div className="eyebrow dark-eyebrow">FOR TEAMS BUILDING WHAT'S NEXT</div>
        <div className="company-cta">
          <h2>
            Meet people who
            <br />
            <em>move things forward.</em>
          </h2>
          <div>
            <p>
              Bring your next great teammate into the room. Share a role, manage applicants and make better hiring decisions.
            </p>
            <Link className="btn btn-dark" to="/post-job">
              Start hiring <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  const [saved, setSaved] = useState(() => {
    const list: string[] = JSON.parse(
      localStorage.getItem('hirehub_saved') || '[]'
    );
    return list.includes(job.id);
  });

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    const list: string[] = JSON.parse(
      localStorage.getItem('hirehub_saved') || '[]'
    );
    let next: string[];
    if (saved) next = list.filter(i => i !== job.id);
    else next = [...list, job.id];
    localStorage.setItem('hirehub_saved', JSON.stringify(next));
    setSaved(!saved);
  };

  return (
    <article className={compact ? 'job-card compact' : 'job-card'}>
      <div className="job-card-top">
        <CompanyLogo name={job.company} size={44} />
        <button
          className={saved ? 'bookmark-btn saved' : 'bookmark-btn'}
          onClick={toggleSave}
          aria-label="Save job"
        >
          <Bookmark size={15} />
        </button>
      </div>
      <div className="job-meta-row">
        <span>{job.company}</span>
        <i>·</i>
        <span>{job.location}</span>
      </div>
      <h3>
        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
      </h3>
      <p className="job-desc">{job.description}</p>
      <div className="job-card-bottom">
        <div className="chip-row">
          <span className="chip">{job.type}</span>
          <span className="chip pay-chip">{job.salary}</span>
        </div>
        <Link className="apply-link" to={`/jobs/${job.id}`}>
          Details <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

function Jobs() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQ = params.get('keyword') || params.get('company') || '';

  const [q, setQ] = useState(initialQ);
  const [kind, setKind] = useState('All');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const kw = p.get('keyword') || p.get('company') || '';
    if (kw) setQ(kw);
  }, [location.search]);

  const filtered = useMemo(
    () =>
      demoJobs.filter(
        j =>
          (kind === 'All' || j.type === kind) &&
          (category === 'All' || j.category === category) &&
          `${j.title} ${j.company} ${j.location} ${j.skills.join(' ')}`
            .toLowerCase()
            .includes(q.toLowerCase())
      ),
    [q, kind, category]
  );

  return (
    <section className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">THE OPPORTUNITY BOARD</div>
        <h1>
          Curated roles,
          <br />
          <em>transparent teams.</em>
        </h1>
        <p>
          Every role on HireHub is verified with transparent compensation and clear expectations.
        </p>
      </div>

      <div className="search-panel">
        <div className="search-field">
          <Search size={18} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by role, company, skill or city…"
          />
        </div>
        <div className="filter-row">
          <div className="filter-chip-group">
            {['All', 'Full-time', 'Internship'].map(k => (
              <button
                key={k}
                className={kind === k ? 'chip-btn active' : 'chip-btn'}
                onClick={() => setKind(k)}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="filter-chip-group">
            {[
              'All',
              'Engineering',
              'Design',
              'Data & Analytics',
              'Operations',
              'Product',
              'Customer Success',
            ].map(c => (
              <button
                key={c}
                className={category === c ? 'chip-btn active' : 'chip-btn'}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <span className="results-count">
          Showing <b>{filtered.length}</b> opportunities
        </span>
      </div>

      <div className="listing-grid">
        {filtered.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}

function JobDetail({ user }: { user: User | null }) {
  const { id } = useParams();
  const job = demoJobs.find(j => j.id === id) || demoJobs[0];
  const [applied, setApplied] = useState(() => {
    const apps: string[] = JSON.parse(
      localStorage.getItem('hirehub_applied') || '[]'
    );
    return apps.includes(job.id);
  });
  const [note, setNote] = useState('');

  const submitApplication = (e: FormEvent) => {
    e.preventDefault();
    const apps: string[] = JSON.parse(
      localStorage.getItem('hirehub_applied') || '[]'
    );
    localStorage.setItem(
      'hirehub_applied',
      JSON.stringify([...apps, job.id])
    );
    setApplied(true);
  };

  return (
    <article className="page-wrap detail-layout">
      <div className="detail-main">
        <Link className="back-link" to="/jobs">
          ← Back to all opportunities
        </Link>
        <div className="detail-head">
          <CompanyLogo name={job.company} size={58} />
          <div>
            <div className="job-meta-row">
              <span>{job.company}</span>
              <i>·</i>
              <span>{job.location}</span>
            </div>
            <h1>{job.title}</h1>
          </div>
        </div>
        <div className="detail-chips">
          <span className="chip">{job.type}</span>
          <span className="chip pay-chip">{job.salary}</span>
          <span className="chip">{job.category}</span>
        </div>
        <div className="detail-copy">
          <h2>About the opportunity</h2>
          <p>{job.description}</p>
          <h2>Required skills</h2>
          <div className="skill-pills">
            {job.skills.map(s => (
              <span key={s} className="pill pill-gold">
                {s}
              </span>
            ))}
          </div>
          <h2>What you can expect</h2>
          <ul className="benefit-list">
            <li>Direct communication with the hiring manager</li>
            <li>Constructive feedback within seven business days</li>
            <li>No hidden interview assignments</li>
          </ul>
        </div>
      </div>

      <aside className="apply-card">
        <h3>Submit your application</h3>
        <p>Your profile, contact details and resume will be sent directly to the team.</p>
        {applied ? (
          <div className="applied-banner">
            <Check size={20} />
            <div>
              <strong>Application submitted</strong>
              <small>Status: Under review</small>
            </div>
          </div>
        ) : (
          <form onSubmit={submitApplication}>
            <label>
              Short note to the hiring lead (optional)
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
                placeholder="Why is this role the right next step for you?"
              />
            </label>
            <button className="btn btn-dark full" type="submit">
              Apply for this role <ArrowRight size={16} />
            </button>
            <small className="apply-caption">
              No cover letter required. By applying you agree to our respectful communication pledge.
            </small>
          </form>
        )}
        <div className="apply-meta">
          <div>
            <span>Compensation</span>
            <strong>{job.salary}</strong>
          </div>
          <div>
            <span>Employment</span>
            <strong>{job.type}</strong>
          </div>
          <div>
            <span>Location</span>
            <strong>{job.location}</strong>
          </div>
        </div>
      </aside>
    </article>
  );
}

function Auth({
  onLogin,
  register = false,
}: {
  onLogin: (u: User) => void;
  register?: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('job_seeker');
  const [company, setCompany] = useState('');
  const navigate = useNavigate();

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    const fallbackUser: User = {
      id: 'local-' + Date.now(),
      name: name || email.split('@')[0] || 'Member',
      email,
      role,
      company: role === 'recruiter' ? company : undefined,
    };
    onLogin(fallbackUser);
    navigate(
      role === 'admin'
        ? '/admin'
        : role === 'recruiter'
        ? '/recruiter'
        : '/dashboard'
    );
  };

  return (
    <section className="auth-page">
      <div className="auth-art">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> WELCOME TO HIREHUB
        </div>
        <h1>
          A calm place
          <br />
          to <em>find your fit.</em>
        </h1>
        <p>No noisy feeds, no cold reach-outs. Just direct paths to teams doing good work.</p>
        <div className="auth-art-card">
          <ShieldCheck size={20} />
          <div>
            <strong>100% Verified opportunities</strong>
            <small>Direct access to hiring teams</small>
          </div>
        </div>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={handle}>
          <h2>{register ? 'Create your account' : 'Welcome back'}</h2>
          <p className="auth-caption">
            {register
              ? 'Join as a candidate or hiring team.'
              : 'Sign in to manage your applications and roles.'}
          </p>
          <div className="role-switch">
            <button
              type="button"
              className={role === 'job_seeker' ? 'role-btn active' : 'role-btn'}
              onClick={() => setRole('job_seeker')}
            >
              Candidate
            </button>
            <button
              type="button"
              className={role === 'recruiter' ? 'role-btn active' : 'role-btn'}
              onClick={() => setRole('recruiter')}
            >
              Hiring team
            </button>
          </div>
          {register && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Aarav Mehta"
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          {role === 'recruiter' && (
            <label>
              Company name
              <input
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="PixelForge Studio"
              />
            </label>
          )}
          <button className="btn btn-dark full" type="submit">
            {register ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
          </button>
          <div className="auth-switch">
            {register ? (
              <span>
                Already have an account? <Link to="/login">Sign in</Link>
              </span>
            ) : (
              <span>
                New to HireHub? <Link to="/register">Create an account</Link>
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function RequireUser({
  user,
  children,
  role,
}: {
  user: User | null;
  children: ReactNode;
  role?: Role;
}) {
  if (!user) {
    return (
      <div className="empty-state page-wrap">
        <div className="empty-card">
          <LockKeyhole size={28} />
          <h2>Sign in required</h2>
          <p>You need to be signed in to view this workspace.</p>
          <Link className="btn btn-dark" to="/login">
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }
  if (role && user.role !== role && user.role !== 'admin') {
    return (
      <div className="empty-state page-wrap">
        <div className="empty-card">
          <ShieldCheck size={28} />
          <h2>Access restricted</h2>
          <p>This space is reserved for {role} accounts.</p>
          <Link className="btn btn-dark" to="/dashboard">
            Return to candidate dashboard
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function Dashboard({
  user,
}: {
  user: User | null;
  onLogin: (u: User) => void;
}) {
  return (
    <RequireUser user={user}>
      <section className="workspace page-wrap">
        <WorkspaceSide user={user!} />
        <div className="workspace-main">
          <div className="workspace-heading">
            <div>
              <div className="eyebrow dark-eyebrow">YOUR WORKSPACE</div>
              <h1>
                Welcome, <em>{user?.name.split(' ')[0]}</em>
              </h1>
              <p>Keep track of conversations, roles and next steps.</p>
            </div>
            <Link to="/jobs" className="btn btn-dark">
              Find openings <ArrowRight size={16} />
            </Link>
          </div>
          <div className="stat-grid">
            <Stat
              icon={<Briefcase />}
              label="Applications"
              value="03"
              note="1 in review"
            />
            <Stat
              icon={<Bookmark />}
              label="Saved roles"
              value="05"
              note="Across 4 teams"
            />
            <Stat
              icon={<CalendarDays />}
              label="Interviews"
              value="01"
              note="Next: Thursday"
            />
            <Stat
              icon={<Sparkles />}
              label="Profile match"
              value="92%"
              note="Strong candidate"
            />
          </div>
          <div className="workspace-columns">
            <div className="workspace-card">
              <div className="card-heading">
                <div>
                  <h2>Active applications</h2>
                  <p>Recent submissions and their current stage.</p>
                </div>
                <Link to="/applications" className="text-link">
                  View all
                </Link>
              </div>
              <div className="application-row">
                <CompanyLogo name="Northstar Labs" size={38} />
                <div className="application-info">
                  <b>Junior Data Analyst</b>
                  <small>Northstar Labs · Applied 2 days ago</small>
                </div>
                <span className="status review">Under review</span>
              </div>
              <div className="application-row">
                <CompanyLogo name="PixelForge Studio" size={38} />
                <div className="application-info">
                  <b>Frontend Developer</b>
                  <small>PixelForge Studio · Applied 5 days ago</small>
                </div>
                <span className="status shortlist">Shortlisted</span>
              </div>
            </div>
            <div className="workspace-card">
              <div className="card-heading">
                <div>
                  <h2>Upcoming milestone</h2>
                  <p>Interview preparation.</p>
                </div>
                <span className="status interview">Thursday 3:30 PM</span>
              </div>
              <div className="interview-spotlight">
                <strong>Technical discussion with PixelForge</strong>
                <p>30-minute conversation with Engineering Lead.</p>
                <div className="interview-tags">
                  <span>Google Meet</span>
                  <span>Portfolio review</span>
                  <span>Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </RequireUser>
  );
}

function WorkspaceSide({ user }: { user: User }) {
  return (
    <aside className="workspace-side">
      <div className="user-mini">
        <span className="avatar big">{user.name.slice(0, 1).toUpperCase()}</span>
        <div>
          <strong>{user.name}</strong>
          <small>{user.role.replace('_', ' ')}</small>
        </div>
      </div>
      <span className="side-label">Navigation</span>
      <NavLink to="/dashboard">
        <LayoutDashboard size={16} /> Overview
      </NavLink>
      <NavLink to="/applications">
        <FileText size={16} /> Applications
      </NavLink>
      <NavLink to="/saved">
        <Bookmark size={16} /> Saved roles
      </NavLink>
      <NavLink to="/profile">
        <UserRound size={16} /> Profile & Resume
      </NavLink>
      <NavLink to="/ats">
        <Sparkles size={16} /> ATS Scanner
      </NavLink>
      {user.role === 'recruiter' && (
        <>
          <span className="side-label">Recruiter</span>
          <NavLink to="/recruiter">
            <Users size={16} /> Pipeline
          </NavLink>
          <NavLink to="/post-job">
            <Plus size={16} /> Post a role
          </NavLink>
        </>
      )}
      {user.role === 'admin' && (
        <>
          <span className="side-label">Admin</span>
          <NavLink to="/admin">
            <ShieldCheck size={16} /> Moderation
          </NavLink>
        </>
      )}
    </aside>
  );
}

function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function Applications({ user }: { user: User | null }) {
  return (
    <RequireUser user={user}>
      <section className="page-wrap">
        <div className="page-intro compact-intro">
          <div className="eyebrow dark-eyebrow">STATUS OVERVIEW</div>
          <h1>
            Your <em>applications.</em>
          </h1>
          <p>Track every submission, interview date and communication.</p>
        </div>
        <div className="workspace-card">
          <div className="application-row">
            <CompanyLogo name="Northstar Labs" size={38} />
            <div className="application-info">
              <b>Junior Data Analyst</b>
              <small>Northstar Labs · Ahmedabad (Hybrid)</small>
            </div>
            <span className="application-date">Applied Nov 14</span>
            <span className="status review">Under review</span>
          </div>
          <div className="application-row">
            <CompanyLogo name="PixelForge Studio" size={38} />
            <div className="application-info">
              <b>Frontend Developer</b>
              <small>PixelForge Studio · Remote</small>
            </div>
            <span className="application-date">Applied Nov 11</span>
            <span className="status shortlist">Shortlisted</span>
          </div>
          <div className="application-row">
            <CompanyLogo name="Form & Function" size={38} />
            <div className="application-info">
              <b>UI/UX Design Intern</b>
              <small>Form & Function · Remote</small>
            </div>
            <span className="application-date">Applied Nov 08</span>
            <span className="status applied">Submitted</span>
          </div>
        </div>
      </section>
    </RequireUser>
  );
}

function Saved({ user }: { user: User | null }) {
  const ids: string[] = JSON.parse(
    localStorage.getItem('hirehub_saved') || '[]'
  );
  const jobs = demoJobs.filter(j => ids.includes(j.id));
  return (
    <RequireUser user={user}>
      <section className="page-wrap">
        <div className="page-intro compact-intro">
          <div className="eyebrow dark-eyebrow">BOOKMARKED ROLES</div>
          <h1>
            Saved <em>opportunities.</em>
          </h1>
          <p>Keep an eye on positions you want to revisit.</p>
        </div>
        {jobs.length ? (
          <div className="listing-grid">
            {jobs.map(j => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <div className="empty-card workspace-card">
            <Bookmark size={28} />
            <h2>No saved roles yet</h2>
            <p>Browse opportunities and click the bookmark icon to save them here.</p>
            <Link className="btn btn-dark" to="/jobs">
              Browse openings
            </Link>
          </div>
        )}
      </section>
    </RequireUser>
  );
}

function Profile({ user }: { user: User | null }) {
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  return (
    <RequireUser user={user}>
      <section className="page-wrap">
        <div className="page-intro compact-intro">
          <div className="eyebrow dark-eyebrow">CANDIDATE STORY</div>
          <h1>
            Your <em>profile.</em>
          </h1>
          <p>Tell hiring teams what you do best.</p>
        </div>
        <form
          className="workspace-card profile-form"
          onSubmit={e => {
            e.preventDefault();
            alert('Profile saved in preview mode.');
          }}
        >
          <div className="profile-form-head">
            <span className="avatar big">{user!.name.slice(0, 1)}</span>
            <div>
              <h3>{user!.name}</h3>
              <small>{user!.email}</small>
            </div>
            <span className="status applied">Preview profile</span>
          </div>
          <div className="form-grid">
            <label className="span-2">
              Professional headline
              <input placeholder="e.g. Frontend Engineer · React & TypeScript" />
            </label>
            <label>
              Location
              <input placeholder="Ahmedabad, India" />
            </label>
            <label>
              Portfolio or GitHub
              <input placeholder="https://github.com/..." />
            </label>
            <label className="span-2">
              Bio
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="A short introduction about your experience and goals…"
                rows={4}
              />
            </label>
            <label className="span-2">
              Skills
              <input
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="Python, SQL, Excel, Power BI"
              />
            </label>
            <label className="span-2 upload-field">
              <Upload />
              <span>
                <b>Upload your resume</b>
                <small>PDF, DOC or DOCX · max 5 MB</small>
              </span>
              <input type="file" accept=".pdf,.doc,.docx" />
            </label>
          </div>
          <button className="btn btn-dark">
            Save profile <Check size={16} />
          </button>
        </form>
      </section>
    </RequireUser>
  );
}

function Recruiter({ user }: { user: User | null }) {
  return (
    <RequireUser user={user} role="recruiter">
      <section className="workspace page-wrap">
        <WorkspaceSide user={user!} />
        <div className="workspace-main">
          <div className="workspace-heading">
            <div>
              <div className="eyebrow dark-eyebrow">HIRING WORKSPACE</div>
              <h1>Build your next team.</h1>
              <p>Manage roles, applicants and conversations.</p>
            </div>
            <Link to="/post-job" className="btn btn-dark">
              <Plus size={16} /> Post a role
            </Link>
          </div>
          <div className="stat-grid">
            <Stat icon={<Briefcase />} label="Active jobs" value="04" note="2 closing soon" />
            <Stat icon={<Users />} label="Applicants" value="128" note="18 new this week" />
            <Stat icon={<Star />} label="Shortlisted" value="16" note="Across all roles" />
            <Stat icon={<CalendarDays />} label="Interviews" value="07" note="Next: tomorrow" />
          </div>
          <div className="workspace-card">
            <div className="card-heading">
              <div>
                <h2>Recent applicants</h2>
                <p>Move promising candidates forward.</p>
              </div>
              <span className="status review">18 new</span>
            </div>
            {['Aarav Mehta', 'Diya Shah', 'Kabir Patel', 'Mira Desai'].map(
              (n, i) => (
                <div className="application-row" key={n}>
                  <span className="avatar">{n[0]}</span>
                  <div className="application-info">
                    <b>{n}</b>
                    <small>
                      {[
                        'Frontend Developer',
                        'Data Analyst',
                        'Product Designer',
                        'Python Intern',
                      ][i]}{' '}
                      · {['2h', '4h', 'Yesterday', 'Yesterday'][i]} ago
                    </small>
                  </div>
                  <span
                    className={
                      'status ' + (i === 1 ? 'shortlist' : 'applied')
                    }
                  >
                    {i === 1 ? 'Shortlisted' : 'New applicant'}
                  </span>
                  <button className="icon-btn">
                    <MoreHorizontal />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </RequireUser>
  );
}

function PostJob({ user }: { user: User | null }) {
  return (
    <RequireUser user={user} role="recruiter">
      <section className="page-wrap">
        <div className="page-intro compact-intro">
          <div className="eyebrow dark-eyebrow">GROW YOUR TEAM</div>
          <h1>
            Share an <em>opportunity.</em>
          </h1>
          <p>Write a clear role description and meet your next teammate.</p>
        </div>
        <form
          className="workspace-card profile-form"
          onSubmit={e => {
            e.preventDefault();
            alert(
              'Job draft saved in preview. Connect Supabase to publish live roles.'
            );
          }}
        >
          <div className="form-grid">
            <label className="span-2">
              Job title
              <input required placeholder="e.g. Product Designer" />
            </label>
            <label>
              Company
              <input
                required
                defaultValue={user!.company || ''}
                placeholder="Company name"
              />
            </label>
            <label>
              Location
              <input required placeholder="City or Remote" />
            </label>
            <label>
              Employment type
              <select>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </label>
            <label>
              Salary range
              <input placeholder="e.g. ₹5–8 LPA" />
            </label>
            <label className="span-2">
              Job description
              <textarea
                rows={6}
                required
                placeholder="Describe the role, responsibilities and what success looks like…"
              />
            </label>
            <label className="span-2">
              Required skills
              <input placeholder="React, TypeScript, Figma" />
            </label>
          </div>
          <button className="btn btn-dark">
            Save job draft <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </RequireUser>
  );
}

function Admin({ user }: { user: User | null }) {
  return (
    <RequireUser user={user} role="admin">
      <section className="workspace page-wrap">
        <WorkspaceSide user={user!} />
        <div className="workspace-main">
          <div className="workspace-heading">
            <div>
              <div className="eyebrow dark-eyebrow">PLATFORM CONTROL</div>
              <h1>HireHub overview.</h1>
              <p>Monitor platform health and activity.</p>
            </div>
            <span className="status shortlist">
              <ShieldCheck size={14} /> Admin access
            </span>
          </div>
          <div className="stat-grid">
            <Stat
              icon={<Users />}
              label="Registered users"
              value="2,481"
              note="+12% this month"
            />
            <Stat
              icon={<Building2 />}
              label="Companies"
              value="186"
              note="12 awaiting review"
            />
            <Stat
              icon={<Briefcase />}
              label="Live jobs"
              value="642"
              note="38 added this week"
            />
            <Stat
              icon={<BarChart3 />}
              label="Applications"
              value="8.4k"
              note="Across all roles"
            />
          </div>
          <div className="workspace-card">
            <div className="card-heading">
              <div>
                <h2>Platform review queue</h2>
                <p>Items that need administrator attention.</p>
              </div>
            </div>
            {[
              'Northstar Labs · Company verification',
              'Aster Digital · Job report #JH-1031',
              'Mosaic Commerce · Recruiter access',
            ].map((x, i) => (
              <div className="application-row" key={x}>
                <CompanyLogo name={x.split('·')[0].trim()} size={36} />
                <div className="application-info">
                  <b>{x}</b>
                  <small>
                    {i === 0
                      ? 'Submitted 2 hours ago'
                      : i === 1
                      ? 'Reported yesterday'
                      : 'Submitted Nov 14'}
                  </small>
                </div>
                <span className="status review">Needs review</span>
                <button className="btn btn-outline small-btn">Review</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </RequireUser>
  );
}

export default App;
