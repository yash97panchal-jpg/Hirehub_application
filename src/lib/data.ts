import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Role = 'job_seeker' | 'recruiter' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  company?: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  featured?: boolean;
  description: string;
  skills: string[];
  postedDaysAgo?: number;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  location: string;
  size: string;
  openRoles: number;
  about: string;
  website: string;
  perks: string[];
  techStack: string[];
  cultureHighlight: string;
  verified: boolean;
};

export type SalaryBenchmark = {
  role: string;
  category: string;
  experience: {
    fresher: string;
    mid: string; // 1-3 yrs
    senior: string; // 3-5 yrs
    lead: string; // 5+ yrs
  };
  demand: 'Very High' | 'High' | 'Growing';
  topSkills: string[];
  remoteFriendly: boolean;
};

export type FAQItem = {
  id: string;
  category: 'Job Seekers' | 'Employers' | 'Verification & Security';
  question: string;
  answer: string;
};

export type CareerArticle = {
  id: string;
  title: string;
  category: 'Interviews' | 'Resumes' | 'Salary Negotiation' | 'Growth';
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  author: string;
  date: string;
};

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key && !url.includes('YOUR_PROJECT') && !key.includes('YOUR_')
    ? createClient(url, key)
    : null;

export const demoJobs: Job[] = [
  {
    id: 'JH-1042',
    title: 'Junior Data Analyst',
    company: 'Northstar Labs',
    location: 'Ahmedabad, Gujarat (Hybrid)',
    type: 'Full-time',
    salary: '₹4.5–7 LPA',
    category: 'Data & Analytics',
    featured: true,
    description: 'Transform business data into executive-ready dashboards. Work directly with analytics mentors on SQL models, cohort retention analysis, and clean KPI reporting.',
    skills: ['SQL', 'Excel', 'Power BI', 'Python'],
    postedDaysAgo: 1,
  },
  {
    id: 'JH-1041',
    title: 'Frontend Developer',
    company: 'PixelForge Studio',
    location: 'Remote · India',
    type: 'Full-time',
    salary: '₹7–12 LPA',
    category: 'Engineering',
    featured: true,
    description: 'Build responsive, fast-loading, design-driven user interfaces. You will work closely with design leadership to turn high-fidelity Figma components into accessible React systems.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    postedDaysAgo: 2,
  },
  {
    id: 'JH-1040',
    title: 'Python Backend Intern',
    company: 'Aster Digital',
    location: 'Ahmedabad, Gujarat',
    type: 'Internship',
    salary: '₹15k–22k / month',
    category: 'Engineering',
    featured: false,
    description: 'Pair with experienced engineers to build REST APIs, asynchronous workers, and database migrations with Django and PostgreSQL.',
    skills: ['Python', 'Django', 'PostgreSQL', 'Git'],
    postedDaysAgo: 3,
  },
  {
    id: 'JH-1039',
    title: 'Business Operations Associate',
    company: 'Mosaic Commerce',
    location: 'Mumbai, Maharashtra',
    type: 'Full-time',
    salary: '₹5–8 LPA',
    category: 'Operations',
    featured: false,
    description: 'Support marketplace logistics, vendor onboarding, weekly reconciliation and growth metric forecasting across commerce verticals.',
    skills: ['Excel', 'Communication', 'Logistics', 'Reporting'],
    postedDaysAgo: 4,
  },
  {
    id: 'JH-1038',
    title: 'UI/UX Design Intern',
    company: 'Form & Function',
    location: 'Remote · India',
    type: 'Internship',
    salary: '₹18k–25k / month',
    category: 'Design',
    featured: true,
    description: 'Participate in customer interview sessions, build interactive prototypes, and document component design specifications for our enterprise SaaS product.',
    skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
    postedDaysAgo: 2,
  },
  {
    id: 'JH-1037',
    title: 'Customer Success Executive',
    company: 'CloudHarbor',
    location: 'Pune, Maharashtra (Hybrid)',
    type: 'Full-time',
    salary: '₹4.5–7 LPA',
    category: 'Customer Success',
    featured: false,
    description: 'Guide B2B customers through platform onboarding, deliver webinars, and channel feature feedback into product roadmaps.',
    skills: ['Communication', 'CRM', 'Problem Solving', 'Account Management'],
    postedDaysAgo: 5,
  },
  {
    id: 'JH-1036',
    title: 'Senior DevOps Engineer',
    company: 'Stackyard Cloud',
    location: 'Bengaluru, Karnataka (Remote)',
    type: 'Full-time',
    salary: '₹18–28 LPA',
    category: 'Engineering',
    featured: true,
    description: 'Lead Kubernetes cluster orchestration, Terraform infrastructure pipelines, zero-downtime releases, and multi-region failover architecture.',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    postedDaysAgo: 1,
  },
  {
    id: 'JH-1035',
    title: 'Growth Marketing Specialist',
    company: 'Brightleaf Growth',
    location: 'Remote · India',
    type: 'Full-time',
    salary: '₹6–10 LPA',
    category: 'Marketing',
    featured: false,
    description: 'Manage paid acquisition channels, track CAC/LTV funnels, and iterate high-converting landing pages for B2B tech clients.',
    skills: ['SEO', 'Google Ads', 'Content Strategy', 'Analytics'],
    postedDaysAgo: 3,
  },
  {
    id: 'JH-1034',
    title: 'Associate Product Manager',
    company: 'Neurobyte AI',
    location: 'Bengaluru, Karnataka',
    type: 'Full-time',
    salary: '₹12–18 LPA',
    category: 'Product',
    featured: true,
    description: 'Own discovery, user stories, and release delivery for our developer AI tools. Collaborate with ML researchers and frontend engineers.',
    skills: ['Product Roadmapping', 'User Stories', 'Analytics', 'Agile'],
    postedDaysAgo: 2,
  },
];

export const demoCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'PixelForge Studio',
    slug: 'pixelforge',
    industry: 'Design & Software Studio',
    location: 'Bengaluru & Remote',
    size: '50–150 employees',
    openRoles: 3,
    about: 'PixelForge is a design-led product engineering collective crafting responsive, accessible web software and scalable design systems for high-growth tech companies.',
    website: 'https://pixelforge.example.com',
    perks: ['100% Remote flexibility', 'Ergonomic equipment allowance', 'Annual learning stipend (₹60k)', 'Health coverage for family'],
    techStack: ['React', 'TypeScript', 'Next.js', 'Figma', 'Node.js'],
    cultureHighlight: 'Craft-first culture: small autonomous sprint pods with zero unnecessary meetings.',
    verified: true,
  },
  {
    id: 'comp-2',
    name: 'Northstar Labs',
    slug: 'northstar-labs',
    industry: 'Data Intelligence & Analytics',
    location: 'Ahmedabad, Gujarat',
    size: '20–50 employees',
    openRoles: 2,
    about: 'Building real-time telemetry dashboards and actionable business intelligence models for cross-border logistics and retail operators.',
    website: 'https://northstarlabs.example.com',
    perks: ['Hybrid schedule (3 days office, 2 remote)', 'Mentorship programs', 'Catered gourmet lunches', 'Wellness allowance'],
    techStack: ['Python', 'PostgreSQL', 'Power BI', 'Snowflake', 'dbt'],
    cultureHighlight: 'Evidence over opinion: data-driven decision making and weekly internal tech talks.',
    verified: true,
  },
  {
    id: 'comp-3',
    name: 'Stackyard Cloud',
    slug: 'stackyard-cloud',
    industry: 'Cloud Infrastructure & DevOps',
    location: 'Bengaluru & Hyderabad',
    size: '100–300 employees',
    openRoles: 4,
    about: 'Stackyard provides enterprise infrastructure automation, observability, and container security for mission-critical web applications.',
    website: 'https://stackyard.example.com',
    perks: ['Comprehensive OPD health cover', 'Home office setup budget', 'Generous parental leave', 'Performance bonus'],
    techStack: ['Kubernetes', 'AWS', 'Terraform', 'Go', 'Prometheus'],
    cultureHighlight: 'High trust, asynchronous engineering: we measure results, not active hours.',
    verified: true,
  },
  {
    id: 'comp-4',
    name: 'Form & Function',
    slug: 'form-and-function',
    industry: 'Product Design & UI Architecture',
    location: 'Remote · India',
    size: '15–30 employees',
    openRoles: 2,
    about: 'A boutique digital product studio helping tech founders turn complex software concepts into delightful, intuitive desktop and mobile experiences.',
    website: 'https://formfunction.example.com',
    perks: ['Global remote work', 'Quarterly team offsites', 'Hardware refresh every 2 years', 'Unlimited book budget'],
    techStack: ['Figma', 'Tailwind CSS', 'React', 'Framer Motion'],
    cultureHighlight: 'Design critique circles with zero ego and continuous peer feedback.',
    verified: true,
  },
  {
    id: 'comp-5',
    name: 'Neurobyte AI',
    slug: 'neurobyte-ai',
    industry: 'Artificial Intelligence & ML',
    location: 'Bengaluru, Karnataka',
    size: '40–90 employees',
    openRoles: 3,
    about: 'Pioneering multimodal AI agents and developer tooling to automate enterprise workflows with verifiable safety guarantees.',
    website: 'https://neurobyte.example.com',
    perks: ['Competitive ESOPs & equity', 'Top-tier medical insurance', 'GPU compute budgets for side experiments', 'Conference grants'],
    techStack: ['Python', 'PyTorch', 'Rust', 'FastAPI', 'Docker'],
    cultureHighlight: 'Research curiosity combined with disciplined production shipping velocity.',
    verified: true,
  },
  {
    id: 'comp-6',
    name: 'Aster Digital',
    slug: 'aster-digital',
    industry: 'Enterprise Web Solutions',
    location: 'Ahmedabad, Gujarat',
    size: '30–75 employees',
    openRoles: 2,
    about: 'Specialized enterprise web engineering partner for fintech and healthcare services, with a strong focus on compliance, uptime and clean code.',
    website: 'https://asterdigital.example.com',
    perks: ['Paid internship-to-hire path', 'Certification sponsorships (AWS/GCP)', 'Flexible morning hours', 'Annual performance trips'],
    techStack: ['Python', 'Django', 'PostgreSQL', 'React', 'Redis'],
    cultureHighlight: 'Deep commitment to early-career mentorship and structured code reviews.',
    verified: true,
  },
];

export const salaryBenchmarks: SalaryBenchmark[] = [
  {
    role: 'Frontend Developer',
    category: 'Engineering',
    experience: {
      fresher: '₹3.6–6 LPA',
      mid: '₹7–13 LPA',
      senior: '₹14–24 LPA',
      lead: '₹25–40 LPA',
    },
    demand: 'Very High',
    topSkills: ['React', 'TypeScript', 'CSS/Tailwind', 'Next.js', 'State Management'],
    remoteFriendly: true,
  },
  {
    role: 'Backend Engineer',
    category: 'Engineering',
    experience: {
      fresher: '₹4–7 LPA',
      mid: '₹8–16 LPA',
      senior: '₹16–30 LPA',
      lead: '₹30–50 LPA',
    },
    demand: 'Very High',
    topSkills: ['Node.js/Python/Go', 'PostgreSQL', 'REST/gRPC', 'Redis', 'AWS'],
    remoteFriendly: true,
  },
  {
    role: 'Data Analyst / BI Specialist',
    category: 'Data & Analytics',
    experience: {
      fresher: '₹3.5–5.5 LPA',
      mid: '₹6–11 LPA',
      senior: '₹12–20 LPA',
      lead: '₹22–35 LPA',
    },
    demand: 'High',
    topSkills: ['SQL', 'Python', 'Power BI / Tableau', 'Excel Modeling', 'Statistics'],
    remoteFriendly: true,
  },
  {
    role: 'Product Designer (UI/UX)',
    category: 'Design',
    experience: {
      fresher: '₹3.5–6 LPA',
      mid: '₹7–14 LPA',
      senior: '₹15–26 LPA',
      lead: '₹28–45 LPA',
    },
    demand: 'High',
    topSkills: ['Figma', 'Prototyping', 'Design Systems', 'User Research', 'Wireframing'],
    remoteFriendly: true,
  },
  {
    role: 'DevOps / Cloud Engineer',
    category: 'Engineering',
    experience: {
      fresher: '₹4.5–7.5 LPA',
      mid: '₹9–18 LPA',
      senior: '₹18–34 LPA',
      lead: '₹35–60 LPA',
    },
    demand: 'Very High',
    topSkills: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS/GCP', 'Terraform'],
    remoteFriendly: true,
  },
  {
    role: 'Product Manager',
    category: 'Product',
    experience: {
      fresher: '₹6–10 LPA',
      mid: '₹11–20 LPA',
      senior: '₹21–36 LPA',
      lead: '₹38–65 LPA',
    },
    demand: 'Growing',
    topSkills: ['Roadmapping', 'User Interviews', 'SQL/Analytics', 'Agile/Scrum', 'GTM'],
    remoteFriendly: false,
  },
];

export const faqList: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Job Seekers',
    question: 'Is applying for jobs on HireHub completely free?',
    answer: 'Yes, 100%. Candidates never pay to browse, apply, save jobs, or communicate with employers on HireHub. We strictly ban any employer requesting fees or training deposits.',
  },
  {
    id: 'faq-2',
    category: 'Job Seekers',
    question: 'How does the ATS Resume Checker evaluate my CV?',
    answer: 'Our ATS checker analyzes keyword alignment against your target role, checks section hierarchy, verifies contact data readability, and provides recommendations to optimize formatting for automated applicant tracking software.',
  },
  {
    id: 'faq-3',
    category: 'Job Seekers',
    question: 'How do I know if my application was viewed or updated?',
    answer: 'Your Job Seeker Dashboard provides a real-time status tracker (Applied, Under Review, Shortlisted, Interview Scheduled, or Closed). You will also receive notification alerts for interview invitations.',
  },
  {
    id: 'faq-4',
    category: 'Employers',
    question: 'How do employers get the Verified badge?',
    answer: 'All employer accounts undergo automated domain verification and manual admin approval. We verify corporate registration, active domain emails, and legitimate hiring practices to protect job seekers.',
  },
  {
    id: 'faq-5',
    category: 'Employers',
    question: 'Can recruiters manage multiple candidates and pipeline stages?',
    answer: 'Yes! The Recruiter Workspace includes direct applicant listings, one-click stage progressions (Review, Shortlist, Interview), and note-taking features.',
  },
  {
    id: 'faq-6',
    category: 'Verification & Security',
    question: 'How is candidate resume data protected?',
    answer: 'Candidate resumes are saved in private, encrypted cloud storage accessible solely by verified recruiters of jobs you explicitly applied to. Resumes are never indexed publicly or sold to third-party ad networks.',
  },
  {
    id: 'faq-7',
    category: 'Verification & Security',
    question: 'Can I permanently delete my HireHub account and personal data?',
    answer: 'Yes. In your Settings & Privacy dashboard, you can request full permanent deletion of your profile, applications, and uploaded files in compliance with modern data privacy frameworks.',
  },
];

export const careerArticles: CareerArticle[] = [
  {
    id: 'art-1',
    title: 'How to Pass Technical Screening Calls in 2026',
    category: 'Interviews',
    readTime: '5 min read',
    summary: 'The technical screening is not a quiz—it is a collaboration simulation. Learn how to structure answers using the STAR method, talk through code decisions, and ask memorable questions.',
    keyTakeaways: [
      'Speak your thought process aloud before typing code.',
      'Clarify constraints and edge cases in the first 2 minutes.',
      'Prepare two crisp questions about system architecture.',
    ],
    author: 'Engineering Career Team',
    date: 'Nov 12, 2026',
  },
  {
    id: 'art-2',
    title: 'Building an ATS-Friendly Resume that Gets Real Callbacks',
    category: 'Resumes',
    readTime: '6 min read',
    summary: 'Fancy multi-column graphics and complex tables often fail ATS parsers. Discover how clean single-column layouts, industry-standard skill tags, and metric-driven bullet points double your callback rate.',
    keyTakeaways: [
      'Use action verbs: "Architected", "Reduced latency by 40%", "Shipped".',
      'Avoid columns, text boxes, and icon graphics in your primary CV.',
      'Match standard job title keywords in your summary headline.',
    ],
    author: 'HireHub Talent Advisors',
    date: 'Nov 8, 2026',
  },
  {
    id: 'art-3',
    title: 'Salary Negotiation: How to Counter-Offer with Confidence',
    category: 'Salary Negotiation',
    readTime: '7 min read',
    summary: 'Negotiating is an expected part of professional hiring. Discover how to benchmark your market worth, handle the initial compensation question gracefully, and frame counter-offers around business value.',
    keyTakeaways: [
      'Never negotiate until an offer is on the table in writing.',
      'Anchor your counter-offer with verified market data, not personal expenses.',
      'Consider performance review milestones and sign-on incentives if base pay is capped.',
    ],
    author: 'Executive Compensation Group',
    date: 'Oct 29, 2026',
  },
  {
    id: 'art-4',
    title: 'From Internship to Full-Time: The First 90 Days Playbook',
    category: 'Growth',
    readTime: '4 min read',
    summary: 'Securing an internship or junior role is step one. Learn how high performers create internal visibility, solicit feedback effectively, and turn temporary roles into permanent offers.',
    keyTakeaways: [
      'Document every delivered ticket and project milestone weekly.',
      'Schedule 15-minute syncs with cross-functional mentors early.',
      'Deliver small tasks with exceptional polish and zero unhandled errors.',
    ],
    author: 'Mentorship Circle',
    date: 'Oct 21, 2026',
  },
];

export function readSession(): User | null {
  try {
    return JSON.parse(localStorage.getItem('hirehub_user') || 'null');
  } catch {
    return null;
  }
}

export function writeSession(user: User | null) {
  if (user) localStorage.setItem('hirehub_user', JSON.stringify(user));
  else localStorage.removeItem('hirehub_user');
}
