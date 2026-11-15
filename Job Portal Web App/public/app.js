const $=s=>document.querySelector(s),LS={g:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},s:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S=[['Frontend Developer','Pixelforge','Full-time','Hybrid','Bengaluru','₹14–22 LPA','React,TypeScript,CSS','Build fast, accessible interfaces for a design-led product team. You will work with designers and backend engineers to ship features weekly.','1–3 yrs'],
['Product Design Intern','Nova Labs','Internship','Remote','Remote','₹25k/mo','Figma,Research,Prototyping','Six months working with senior designers on live product features, from research to polished handoff.','Fresher'],
['Data Analyst','Quantly','Full-time','On-site','Mumbai','₹9–15 LPA','SQL,Python,Tableau','Turn messy business data into decisions that leaders trust. Own dashboards and weekly insight reports.','1–3 yrs'],
['Backend Engineer','Cloudnine Pay','Full-time','Remote','Remote','₹20–34 LPA','Node.js,Postgres,AWS','Design reliable payment APIs used by thousands of merchants, with a strong focus on security and uptime.','3+ yrs'],
['Marketing Intern','Brightleaf','Internship','Hybrid','Pune','₹15k/mo','SEO,Writing,Social Media','Run campaigns, write copy and learn growth marketing hands-on with a small, friendly team.','Fresher'],
['HR Executive','Talentry','Full-time','On-site','Ahmedabad','₹4–7 LPA','Recruiting,Excel,Communication','Own the hiring cycle from sourcing and screening to offer letters and onboarding.','1–3 yrs'],
['Machine Learning Engineer','Neurobyte','Full-time','Remote','Remote','₹24–40 LPA','Python,PyTorch,MLOps','Ship models into production and monitor how they behave over time.','3+ yrs'],
['Software Engineering Intern','Gridwave','Internship','Remote','Remote','₹30k/mo','JavaScript,Git,Testing','Pair with mentors, fix real bugs and ship to production within your first month.','Fresher'],
['Customer Success Associate','Helpdeck','Part-time','Remote','Remote','₹3–5 LPA','Communication,CRM,Empathy','Help customers succeed and feed insights back to the product team.','Fresher'],
['Content Writer','Inkwell Media','Contract','Remote','Remote','₹40k/mo','Writing,Editing,SEO','Long-form articles and case studies for B2B technology brands.','1–3 yrs'],
['DevOps Engineer','Stackyard','Full-time','Hybrid','Hyderabad','₹16–28 LPA','Docker,Kubernetes,CI/CD','Keep releases boring: automate pipelines, infrastructure and monitoring.','3+ yrs'],
['Finance Intern','Ledgerly','Internship','On-site','Ahmedabad','₹12k/mo','Excel,Accounting,Reporting','Support month-end close and build budgeting models for startup clients.','Fresher'],
['UI Designer','Pixelforge','Full-time','Hybrid','Bengaluru','₹10–16 LPA','Figma,Design Systems,CSS','Craft consistent interfaces and maintain the design system used across products.','1–3 yrs'],
['Full Stack Developer','Gridwave','Full-time','Remote','Remote','₹18–30 LPA','React,Node.js,Postgres','Own features end to end, from database to polished interface.','3+ yrs'],
['Business Analyst','Quantly','Full-time','Hybrid','Mumbai','₹8–14 LPA','SQL,Excel,Communication','Bridge business teams and data. Write requirements, track metrics and present findings.','1–3 yrs'],
['Social Media Intern','Brightleaf','Internship','Remote','Remote','₹10k/mo','Social Media,Canva,Writing','Plan and publish content calendars and learn to read analytics.','Fresher'],
['Cloud Support Engineer','Stackyard','Full-time','On-site','Hyderabad','₹6–10 LPA','AWS,Linux,Troubleshooting','Help customers resolve cloud issues and document fixes for the team.','Fresher'],
['Technical Recruiter','Talentry','Full-time','Hybrid','Ahmedabad','₹6–11 LPA','Recruiting,Sourcing,Interviewing','Source engineers, run screening calls and partner with hiring managers.','1–3 yrs'],
['AI Research Intern','Neurobyte','Internship','Remote','Remote','₹35k/mo','Python,Machine Learning,Maths','Work on applied research problems with a senior ML engineer as your mentor.','Fresher'],
['Payments Operations Analyst','Cloudnine Pay','Full-time','On-site','Bengaluru','₹7–12 LPA','Excel,SQL,Risk','Monitor transactions, investigate exceptions and improve reconciliation workflows.','1–3 yrs'],
['Technical Writer','Gridwave','Contract','Remote','Remote','₹50k/mo','Writing,APIs,Markdown','Write clear developer documentation and tutorials for our API products.','1–3 yrs'],
['Accounts Executive','Ledgerly','Full-time','On-site','Ahmedabad','₹3–5 LPA','Tally,Excel,GST','Handle invoicing, reconciliations and statutory filings for client accounts.','Fresher'],
['Product Manager','Nova Labs','Full-time','Hybrid','Bengaluru','₹26–42 LPA','Roadmapping,Analytics,Communication','Lead discovery and delivery for a core product area alongside design and engineering.','3+ yrs'],
['QA Engineer','Pixelforge','Part-time','Remote','Remote','₹30k/mo','Testing,Selenium,Bug Reports','Write test plans, automate regression checks and keep releases clean.','1–3 yrs']];

const defaultCompanies = [
  {id:1,name:'Pixelforge',slug:'pixelforge',rid:null,logo_url:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%231C2541'/%3E%3Cpath d='M30 30h40v40H30z' fill='%23D97706'/%3E%3Ccircle cx='50' cy='50' r='14' fill='%235BC0DE'/%3E%3C/svg%3E",cover_url:null,tagline:'Design-led software studio crafting accessible digital products.',website:'https://pixelforge.example.com',industry:'Design & Software',size:'51–200',hq:'Bengaluru',founded:2019,about:'Pixelforge is a product engineering and interface design studio. We partner with technology teams to design, architect, and ship high-performance web and mobile platforms with a deep commitment to accessibility, type systems, and responsive performance.',benefits:['Comprehensive health insurance','Annual learning stipend','Flexible hybrid hours','Ergonomic home office budget','Wellness allowance'],tech_stack:['React','TypeScript','Tailwind CSS','Node.js','Figma','Next.js'],culture:[{title:'Craft First',desc:'We hold visual typography, accessibility, and zero-defect interaction design to high standards.'},{title:'Clear Over Clever',desc:'We favor simple, maintainable architectures over unnecessary complexity.'},{title:'Shared Ownership',desc:'Designers and engineers collaborate directly with users from day one.'}],locations:[{city:'Bengaluru',type:'Main Studio',address:'Indiranagar 100ft Road'},{city:'Remote',type:'Hybrid Hub',address:'Distributed across India'}],gallery:[{url:'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',caption:'Open sprint floor'},{url:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',caption:'Design system review'}],verified:true,created_at:Date.now()-300*864e5},
  {id:2,name:'Nova Labs',slug:'nova-labs',rid:2,logo_url:null,cover_url:null,tagline:'Experimental product lab building software tools and mentoring early-career talent.',website:'https://novalabs.example.com',industry:'Product Studio',size:'11–50',hq:'Remote',founded:2021,about:'Nova Labs is a distributed experimental software studio. We design micro-SaaS utilities, developer workflow extensions, and open-source packages while operating an active internship and apprenticeship mentorship initiative.',benefits:['100% remote work policy','Dedicated 1-on-1 mentorship','Flexible sprint schedules','Paid conference passes','Hardware allowance'],tech_stack:['TypeScript','React','Python','GraphQL','PostgreSQL','Docker'],culture:[{title:'Learning in Public',desc:'We document discoveries, share architectural postmortems, and mentor openly.'},{title:'Fast Iteration',desc:'Small, finished modules beat sprawling unfinished initiatives.'},{title:'High Trust',desc:'Asynchronous workflows require transparent documentation and mutual respect.'}],locations:[{city:'Remote',type:'Global Headquarters',address:'Distributed Team'}],gallery:[{url:'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',caption:'Weekly asynchronous showcase'}],verified:true,created_at:Date.now()-240*864e5},
  {id:3,name:'Quantly',slug:'quantly',rid:null,logo_url:null,cover_url:null,tagline:'Business intelligence, data pipelines, and decision telemetry for mid-market teams.',website:'https://quantly.example.com',industry:'Analytics',size:'201–500',hq:'Mumbai',founded:2017,about:'Quantly builds data integration engines and metric visualization suites. Our platform consolidates operational databases, behavioral telemetry, and financial feeds into trusted reporting dashboards for enterprise decision-makers.',benefits:['Health & dental coverage','Provident fund match','Performance bonuses','Parental leave program','Catered healthy lunches'],tech_stack:['Python','SQL','Snowflake','Tableau','dbt','AWS'],culture:[{title:'Data Integrity',desc:'Every metric must have clear lineage and reproducible calculations.'},{title:'Actionable Clarity',desc:'Dashboards should guide immediate decisions, not create noise.'}],locations:[{city:'Mumbai',type:'Corporate Office',address:'Bandra Kurla Complex (BKC)'}],gallery:[],verified:true,created_at:Date.now()-400*864e5},
  {id:4,name:'Cloudnine Pay',slug:'cloudnine-pay',rid:null,logo_url:null,cover_url:null,tagline:'Resilient payment infrastructure and checkout rails for online merchants.',website:'https://cloudninepay.example.com',industry:'Fintech',size:'201–500',hq:'Remote',founded:2018,about:'Cloudnine Pay powers real-time merchant settlements, subscription billing engines, and fraud mitigation filters. Our APIs serve thousands of digital merchants across international payment corridors.',benefits:['Competitive equity grants','Remote work stipend','Comprehensive medical insurance','Mental health support','Annual team retreats'],tech_stack:['Go','Node.js','PostgreSQL','Kafka','Kubernetes','Redis'],culture:[{title:'Uncompromising Uptime',desc:'Financial infrastructure must operate with four-nines reliability.'},{title:'Security by Default',desc:'Every commit passes automated vulnerability checks and encryption audits.'}],locations:[{city:'Remote',type:'Primary Headquarters',address:'Global Distributed Operations'}],gallery:[],verified:true,created_at:Date.now()-350*864e5},
  {id:5,name:'Brightleaf',slug:'brightleaf',rid:null,logo_url:null,cover_url:null,tagline:'Growth engineering and performance marketing studio for sustainable consumer brands.',website:'https://brightleaf.example.com',industry:'Marketing Agency',size:'11–50',hq:'Pune',founded:2020,about:'Brightleaf assists eco-conscious direct-to-consumer enterprises in scaling their digital acquisition, search discovery, and retention funnels through quantitative experimentation and compelling narrative design.',benefits:['Flexible work hours','Health insurance','Skill development stipends','Bi-weekly team lunches','Paid community volunteering days'],tech_stack:['Google Analytics 4','Shopify Plus','Figma','Python','HubSpot'],culture:[{title:'Measurable Outcomes',desc:'We hold marketing experiments to verifiable customer unit economics.'},{title:'Ethical Storytelling',desc:'We partner exclusively with sustainable and transparent brands.'}],locations:[{city:'Pune',type:'Creative Hub',address:'Koregaon Park'}],gallery:[],verified:true,created_at:Date.now()-180*864e5},
  {id:6,name:'Talentry',slug:'talentry',rid:null,logo_url:null,cover_url:null,tagline:'Talent operations, recruitment advisory, and technical candidate screening platform.',website:'https://talentry.example.com',industry:'HR Services',size:'51–200',hq:'Ahmedabad',founded:2016,about:'Talentry provides embedded recruitment partnerships and hiring workflows for high-growth engineering, design, and operations organizations seeking vetted candidate matches.',benefits:['Medical insurance with dependents','Incentive bonuses','Skill certifications support','Company transport allowance'],tech_stack:['Greenhouse','Lever','Workday','Excel Advanced','LinkedIn Recruiter'],culture:[{title:'Candidate Dignity',desc:'Every applicant deserves timely feedback, clear timelines, and transparent salary ranges.'},{title:'Partnership Mindset',desc:'We operate as an extension of our client engineering teams.'}],locations:[{city:'Ahmedabad',type:'Operations Centre',address:'SG Highway Tech Corridor'}],gallery:[],verified:true,created_at:Date.now()-500*864e5},
  {id:7,name:'Neurobyte',slug:'neurobyte',rid:null,logo_url:null,cover_url:null,tagline:'Applied machine learning pipelines and real-time computer vision inference.',website:'https://neurobyte.example.com',industry:'AI / ML',size:'51–200',hq:'Remote',founded:2021,about:'Neurobyte develops neural optimization pipelines and computer vision toolkits for automated warehouse sorting and quality assurance inspections.',benefits:['Top-tier equipment budgets','Remote work flexibility','Research publication stipends','Comprehensive health coverage','Equity participation'],tech_stack:['Python','PyTorch','TensorRT','CUDA','Docker','FastAPI'],culture:[{title:'Scientific Rigor',desc:'Hypotheses are tested with controlled baselines and peer-reviewed metrics.'},{title:'Practical Inference',desc:'Models must deliver latency efficiency on commodity edge hardware.'}],locations:[{city:'Remote',type:'R&D Lab',address:'Virtual Distributed Lab'}],gallery:[],verified:true,created_at:Date.now()-210*864e5},
  {id:8,name:'Gridwave',slug:'gridwave',rid:null,logo_url:null,cover_url:null,tagline:'Developer productivity tools, CLI utilities, and automated CI test runners.',website:'https://gridwave.example.com',industry:'Developer Tools',size:'51–200',hq:'Remote',founded:2020,about:'Gridwave architects local development orchestration and fast build distribution networks that shave seconds off developer feedback loops.',benefits:['Remote first','Learning & book budget','Annual company summit','Health insurance','Parental leave'],tech_stack:['Rust','Go','TypeScript','WebAssembly','Linux'],culture:[{title:'Developer Empathy',desc:'We build the developer tools that we want to use ourselves daily.'},{title:'Sub-Second Performance',desc:'Latencies under 100ms create effortless engineering flow.'}],locations:[{city:'Remote',type:'Engineering Hub',address:'Distributed Globally'}],gallery:[],verified:true,created_at:Date.now()-290*864e5},
  {id:9,name:'Helpdeck',slug:'helpdeck',rid:null,logo_url:null,cover_url:null,tagline:'Unified omnichannel support desks and ticket triage workflows for small businesses.',website:'https://helpdeck.example.com',industry:'SaaS',size:'11–50',hq:'Remote',founded:2022,about:'Helpdeck consolidates email, in-app chat, and messaging queries into a fast keyboard-navigable inbox designed for customer success teams.',benefits:['Health insurance','Flexible hours','Home setup allowance','Annual bonus pool','Mental wellness days'],tech_stack:['React','Node.js','PostgreSQL','Tailwind CSS','WebSockets'],culture:[{title:'Customer Empathy',desc:'Great support software prioritizes listening and calm resolution.'},{title:'Simplicity',desc:'No bloated feature matrices; only clean, fast workflows.'}],locations:[{city:'Remote',type:'Global Hub',address:'Distributed Team'}],gallery:[],verified:true,created_at:Date.now()-150*864e5},
  {id:10,name:'Inkwell Media',slug:'inkwell-media',rid:null,logo_url:null,cover_url:null,tagline:'B2B technology journalism, technical whitepapers, and engineering blog production.',website:'https://inkwellmedia.example.com',industry:'Content & Media',size:'11–50',hq:'Remote',founded:2019,about:'Inkwell Media partners with developer tool and infrastructure firms to write deep-dive architectural tutorials, documentation overhauls, and industry benchmark reports.',benefits:['Flexible project scheduling','Writing tools stipend','Co-working space allowance','Health benefits','Quarterly profit sharing'],tech_stack:['Markdown','Notion','Figma','Ahrefs','Ghost'],culture:[{title:'Technical Accuracy',desc:'We write code samples that run and verify technical assertions before publishing.'},{title:'Editorial Clarity',desc:'Complex engineering concepts explained without jargon.'}],locations:[{city:'Remote',type:'Editorial Desk',address:'Distributed Editorial Team'}],gallery:[],verified:true,created_at:Date.now()-380*864e5},
  {id:11,name:'Stackyard',slug:'stackyard',rid:null,logo_url:null,cover_url:null,tagline:'Cloud migration, Kubernetes cluster management, and infrastructure automation consulting.',website:'https://stackyard.example.com',industry:'Cloud Services',size:'51–200',hq:'Hyderabad',founded:2017,about:'Stackyard designs cloud landing zones, automated backup policies, and cost governance guardrails for organizations migrating on-premises workloads to AWS and GCP.',benefits:['Comprehensive group health insurance','Certification reimbursement (AWS/GCP/CKA)','Flexible work locations','Gratuity & provident fund','Annual tech gear upgrades'],tech_stack:['Terraform','Kubernetes','AWS','GCP','Ansible','Prometheus'],culture:[{title:'Boring Infrastructure',desc:'Predictable, automated deployments prevent 3 AM incidents.'},{title:'Infrastructure as Code',desc:'Every configuration is versioned and code-reviewed.'}],locations:[{city:'Hyderabad',type:'Cloud Centre',address:'HITEC City, Madhapur'}],gallery:[],verified:true,created_at:Date.now()-450*864e5},
  {id:12,name:'Ledgerly',slug:'ledgerly',rid:null,logo_url:null,cover_url:null,tagline:'Automated accounting reconciliations, GST compliance, and cashflow modeling for startups.',website:'https://ledgerly.example.com',industry:'Accounting Tech',size:'11–50',hq:'Ahmedabad',founded:2020,about:'Ledgerly integrates banking transactions with accounting ledgers to automate invoice reconciliations, statutory tax filings, and runway forecasting for modern founders.',benefits:['Medical insurance with family cover','Paid professional study leave','Flexible timings','Annual performance incentive','Healthy pantry'],tech_stack:['Python','FastAPI','PostgreSQL','React','Tally API','Docker'],culture:[{title:'Fiduciary Precision',desc:'Financial data requires zero margin for rounding or synchronization errors.'},{title:'Founder Peace of Mind',desc:'We make tax compliance and monthly closing effortless.'}],locations:[{city:'Ahmedabad',type:'Finance Studio',address:'Prahlad Nagar Corporate Road'}],gallery:[],verified:true,created_at:Date.now()-310*864e5}
];

let db=LS.g('hh3',null);
if(!db){
  db={
    users:[
      {id:1,name:'Admin',email:'admin@hirehub.app',pw:'admin123',role:'admin'},
      {id:2,name:'Nova Labs',email:'recruiter@hirehub.app',pw:'recruit123',role:'recruiter'},
      {id:3,name:'Aarav Shah',email:'seeker@hirehub.app',pw:'seeker123',role:'seeker'}
    ],
    companies: defaultCompanies,
    jobs:S.map((j,i)=>{
      const coName = j[1];
      const matchCo = defaultCompanies.find(c=>c.name.toLowerCase()===coName.toLowerCase());
      return {
        id:i+1,
        company_id: matchCo ? matchCo.id : null,
        rid:2,
        title:j[0],
        co:coName,
        type:j[2],
        mode:j[3],
        loc:j[4],
        pay:j[5],
        skills:j[6],
        desc:j[7],
        exp:j[8]||'Fresher',
        st:'approved',
        at:Date.now()-i*864e5
      };
    }),
    apps:[],
    saved:[],
    follows:[],
    notes:[],
    msgs:[],
    seq:100
  };
  save();
}

// Ensure database has companies, follows, and links
if(!db.companies || !db.companies.length){
  db.companies = defaultCompanies;
  if(db.jobs){
    db.jobs.forEach(j=>{
      const matchCo = db.companies.find(c=>c.name.toLowerCase()===(j.co||'').toLowerCase());
      if(matchCo) j.company_id = matchCo.id;
    });
  }
  save();
} else {
  const pf = db.companies.find(c => c.id === 1);
  if(pf && !pf.logo_url) {
    pf.logo_url = defaultCompanies[0].logo_url;
    save();
  }
}
if(!db.follows) { db.follows = []; save(); }
if(!db.notes) { db.notes = []; save(); }
if(!db.msgs) { db.msgs = []; save(); }

function save(){LS.s('hh3',db)}
let uid=LS.g('hhme',null);
const me=()=>db.users.find(u=>u.id===uid&&!u.blocked)||null,nid=()=>++db.seq;

function toast(m){const t=$('#toast');if(!t)return;t.textContent=m;t.className='on';clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',2400)}
const ago=t=>{const d=Math.max(0,Math.floor((Date.now()-t)/864e5));return d?d+'d ago':'Today'},go=h=>{location.hash=h};

/* Company Helpers */
function getCompany(idOrSlugOrName){
  if(!idOrSlugOrName) return null;
  const s = String(idOrSlugOrName).trim().toLowerCase();
  return db.companies.find(c => String(c.id) === s || c.slug.toLowerCase() === s || c.name.toLowerCase() === s) || null;
}

function getMonogram(name){
  if(!name) return 'CO';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if(parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getFollowersCount(companyId){
  return (db.follows || []).filter(f => f.companyId == companyId).length;
}

function isFollowing(companyId){
  const u = me();
  if(!u) return false;
  return (db.follows || []).some(f => f.userId === u.id && f.companyId == companyId);
}

function toggleFollow(companyId, btnEl){
  const u = me();
  if(!u){
    toast('Please log in to follow companies');
    return go('#/login');
  }
  if(u.role !== 'seeker'){
    return toast('Company following is available for job seekers');
  }
  const c = db.companies.find(x => x.id == companyId);
  if(!c) return;
  const idx = (db.follows || []).findIndex(f => f.userId === u.id && f.companyId == companyId);
  const wasFollowing = idx >= 0;
  if(wasFollowing){
    db.follows.splice(idx, 1);
  } else {
    db.follows.push({userId: u.id, companyId: c.id, at: Date.now()});
  }
  save();
  toast(wasFollowing ? `Unfollowed ${c.name}` : `Following ${c.name}! You will receive alerts on new roles.`);
  const newCnt = getFollowersCount(c.id);
  const isNow = !wasFollowing;
  document.querySelectorAll(`.flw-btn[data-cid="${c.id}"]`).forEach(btn => {
    btn.classList.toggle('following', isNow);
    btn.innerHTML = isNow ? `<svg class="i" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="m5 12 5 5 9-10"/></svg> Following` : `+ Follow`;
  });
  document.querySelectorAll(`.flw-cnt[data-cid="${c.id}"]`).forEach(el => {
    el.textContent = `${newCnt} follower${newCnt === 1 ? '' : 's'}`;
  });
  if(location.hash.startsWith('#/dash?t=following')) render();
}

function renderCompanyLogo(c, s = 44, cls = ''){
  const mono = getMonogram(c.name);
  if(c.logo_url){
    return `<div class="co-logo-box ${cls}" style="--s:${s}px"><img src="${E(c.logo_url)}" alt="${E(c.name)} logo" class="co-img" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\'co-mono\\'>${mono}</span>'"></div>`;
  }
  return `<div class="co-logo-box co-mono-box ${cls}" style="--s:${s}px"><span class="co-mono">${mono}</span></div>`;
}

function nav(){
  const u=me();
  $('#nav').innerHTML=`<a class="logo" href="#/"><span class="lg" role="img" aria-label="HireHub logo"><i></i><i></i></span><span>Hire<b>Hub</b></span></a><nav><a class="l" href="#/jobs">Find jobs</a><a class="l" href="#/companies">Companies</a><a class="l" href="#/jobs?type=Internship">Internships</a></nav>${u?`<a class="l" href="#/dash">${E(u.name.split(' ')[0])} · ${u.role}</a><button class="btn s" onclick="out()">Log out</button>`:'<a class="l" href="#/login">Log in</a><a class="btn s" href="#/register">Join free</a>'}`;
}

function out(){uid=null;LS.s('hhme',null);go('#/');toast('Logged out')}
var live=()=>db.jobs.filter(j=>j.st==='approved');

const pill=s=>`<span class="tag ${s==='Hired'||s==='Shortlisted'||s==='Interview'?'i':s==='Rejected'?'r':''}">${s}</span>`;
function wd(id){db.apps=db.apps.filter(a=>a.id!==id);save();toast('Application withdrawn');render()}
function del(id){if(!confirm('Delete this job and its applications?'))return;db.jobs=db.jobs.filter(j=>j.id!==id);db.apps=db.apps.filter(a=>a.jobId!==id);save();toast('Job deleted');render()}
function ap(id,ok){if(ok)db.jobs.find(j=>j.id===id).st='approved';else db.jobs=db.jobs.filter(j=>j.id!==id);save();toast(ok?'Job approved':'Job rejected');render()}
function blk(id){const x=db.users.find(u=>u.id===id);x.blocked=!x.blocked;save();render()}
function setst(id,s){const a=db.apps.find(x=>x.id===id);if(a){a.status=s;save();toast('Status updated');}}

function pub(f){
  const u=me();
  if(!u||u.role!=='recruiter')return;
  const cName = f.co.value.trim();
  let co = db.companies.find(x => x.name.toLowerCase() === cName.toLowerCase());
  const company_id = co ? co.id : null;
  const newJob = {
    id: nid(),
    rid: u.id,
    company_id: company_id,
    title: f.title.value.trim(),
    co: cName,
    type: f.type.value,
    mode: f.mode.value,
    loc: f.loc.value.trim(),
    pay: f.pay.value.trim(),
    skills: f.skills.value.trim(),
    desc: f.desc.value.trim(),
    exp: f.exp ? f.exp.value : 'Fresher',
    st: 'pending',
    at: Date.now()
  };
  db.jobs.unshift(newJob);
  save();
  // Automatically notify seekers who follow this company
  if(company_id && db.follows){
    const followers = db.follows.filter(fl => fl.companyId == company_id);
    followers.forEach(fl => {
      db.notes.unshift({
        id: nid(),
        uid: fl.userId,
        t: `New opening at ${cName}: "${newJob.title}" (${newJob.type})`,
        at: Date.now(),
        read: 0
      });
    });
    save();
  }
  toast('Submitted for admin review');
  go('#/dash');
}

function apply(id, note){
  const u = me();
  if(!u || u.role !== 'seeker') return;
  if(db.apps.some(a => a.jobId === id && a.uid === u.id)) return toast('Already applied');
  db.apps.push({id: nid(), jobId: id, uid: u.id, note: note.trim(), status: 'Applied', at: Date.now()});
  save();
  toast('Application sent!');
  render();
}

function sav(id){
  const u = me();
  if(!u) return;
  const i = db.saved.findIndex(s => s.jobId === id && s.uid === u.id);
  i < 0 ? db.saved.push({jobId: id, uid: u.id}) : db.saved.splice(i, 1);
  save();
  render();
}

function reg(f){
  const e = f.email.value.trim().toLowerCase();
  if(db.users.some(u => u.email === e)) return toast('Email already registered');
  const u = {id: nid(), name: f.name.value.trim(), email: e, pw: f.pw.value, role: f.role.value};
  db.users.push(u);
  save();
  uid = u.id;
  LS.s('hhme', uid);
  toast('Welcome!');
  go('#/dash');
}

function log(f){
  const u = db.users.find(x => x.email === f.email.value.trim().toLowerCase() && x.pw === f.pw.value);
  if(!u) return toast('Wrong email or password');
  if(u.blocked) return toast('Account blocked by admin');
  uid = u.id;
  LS.s('hhme', uid);
  toast('Logged in');
  go('#/dash');
}

function post(){
  const u = me();
  if(!u || u.role !== 'recruiter') return '<div class="card empty">Log in as a recruiter to post jobs.</div>';
  const o = a => a.map(x => `<option>${x}</option>`).join('');
  return `<form class="card f" style="max-width:640px" onsubmit="event.preventDefault();pub(this)"><h2>Post a job or internship</h2><label>Job title</label><input name="title" required maxlength="80"><label>Company</label><input name="co" required maxlength="60" value="${E(u.name)}"><div class="row"><div style="flex:1"><label>Type</label><select name="type">${o(['Full-time','Internship','Part-time','Contract'])}</select></div><div style="flex:1"><label>Mode</label><select name="mode">${o(['Remote','Hybrid','On-site'])}</select></div></div><label>Experience level</label><select name="exp">${o(['Fresher','1–3 yrs','3+ yrs'])}</select><label>Location</label><input name="loc" required maxlength="50"><label>Pay (e.g. ₹10–15 LPA or ₹20k/mo)</label><input name="pay" required maxlength="30"><label>Skills (comma separated)</label><input name="skills" required maxlength="100"><label>Description</label><textarea name="desc" rows="5" required maxlength="1200"></textarea><p class="muted" style="font-size:13px">New listings are reviewed by an admin before going live.</p><button class="btn d">Submit for review</button></form>`;
}

function applicants(id){
  const u = me(), j = db.jobs.find(x => x.id == id);
  if(!u || !j || (j.rid !== u.id && u.role !== 'admin')) return '<div class="card empty">Not allowed.</div>';
  const A = db.apps.filter(a => a.jobId === j.id);
  return `<a href="#/dash">← Dashboard</a><h1>Applicants · ${E(j.title)}</h1>${A.length ? `<div class="card"><table><tr><th>Candidate</th><th>Note</th><th>Applied</th><th>Status</th></tr>${A.map(a => {
    const c = db.users.find(x => x.id === a.uid) || {name: 'Deleted', email: ''};
    return `<tr><td><b>${E(c.name)}</b><br><span class="muted">${E(c.email)}</span>${c.headline || c.skills ? `<br><span class="muted" style="font-size:12px">${E(c.headline || '')} ${E(c.skills || '')}</span>` : ''}</td><td>${E(a.note)}</td><td>${ago(a.at)}</td><td><select onchange="setst(${a.id},this.value)">${['Applied','Shortlisted','Interview','Hired','Rejected'].map(s => `<option ${s === a.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`;
  }).join('')}</table></div>` : '<div class="card empty">No applicants yet.</div>'}`;
}

function admin(){
  const P = db.jobs.filter(j => j.st === 'pending');
  return `<h1>Admin console</h1><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">${[['Users',db.users.length],['Jobs',db.jobs.length],['Pending',P.length],['Applications',db.apps.length]].map(s => `<div class="stat"><span class="n">${s[1]}</span>${s[0]}</div>`).join('')}</div>
<h2 style="margin-top:28px">Awaiting approval</h2>${P.length ? `<div class="card"><table><tr><th>Role</th><th>Company</th><th>Type</th><th></th></tr>${P.map(j => `<tr><td><a href="#/job/${j.id}"><b>${E(j.title)}</b></a></td><td>${E(j.co)}</td><td>${j.type}</td><td class="row"><button class="btn s" onclick="ap(${j.id},1)">Approve</button><button class="btn s x" onclick="ap(${j.id},0)">Reject</button></td></tr>`).join('')}</table></div>` : '<div class="card empty">All caught up 🎉</div>'}
<h2 style="margin-top:28px">Users</h2><div class="card"><table><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr>${db.users.map(x => `<tr><td>${E(x.name)}</td><td>${E(x.email)}</td><td>${x.role}</td><td>${x.role === 'admin' ? '' : `<button class="btn s ${x.blocked ? '' : 'x'}" onclick="blk(${x.id})">${x.blocked ? 'Unblock' : 'Block'}</button>`}</td></tr>`).join('')}</table></div>
<h2 style="margin-top:28px">Live jobs</h2><div class="card"><table><tr><th>Role</th><th>Company</th><th>Type</th><th></th></tr>${live().map(j => `<tr><td>${E(j.title)}</td><td>${E(j.co)}</td><td>${j.type}</td><td><button class="btn s x" onclick="del(${j.id})">Remove</button></td></tr>`).join('')}</table></div>`;
}

function render(){
  nav();
  const h = location.hash.slice(1) || '/', [p, qs] = h.split('?'), q = new URLSearchParams(qs || ''), s = p.split('/');
  let v;
  try {
    v = p === '/' ? home() : p === '/jobs' ? jobs(q) : s[1] === 'job' ? job(s[2]) : p === '/login' ? auth('login', q) : p === '/register' ? auth('register', q) : p === '/dash' ? dash(q) : p === '/post' ? post() : s[1] === 'applicants' ? applicants(s[2]) : (typeof extra === 'function' ? extra(p, q, s) : null) || '<div class="card empty"><h2>Page not found</h2><a href="#/">Go home</a></div>';
  } catch(e) {
    console.error(e);
    v = '<div class="card empty">Something went wrong. <a href="#/">Go home</a></div>';
  }
  $('#app').innerHTML = v;
  if(!render.k) scrollTo(0, 0);
}
window.onhashchange = () => render();
