// HireHub Pages & Company Ecosystem Module
const enc = encodeURIComponent;
const ph = (t, s) => `<div class="ph" style="margin-bottom:24px"><h1>${t}</h1><p class="muted" style="font-size:18px;max-width:680px">${s}</p></div>`;

/* -------------------------------------------------------------
 * 1. Career Blog & Articles
 * ------------------------------------------------------------- */
const BL = [
  {id:1,t:'How to write a resume recruiters actually read',tag:'Resume',m:5,b:['Recruiters scan a resume in seconds, so lead with a clear one-line headline and three quantitative results that directly match the role you target.','Replace passive task lists with outcomes: "Reduced report generation time from 4 hours to 30 minutes" beats "Responsible for weekly stakeholder reports".','Keep formatting clean: stick to one page for under ten years of experience, use standard section titles, and export as a PDF.']},
  {id:2,t:'Your first internship: how to stand out without experience',tag:'Internships',m:4,b:['Demonstrate completed projects rather than theoretical knowledge. Two small, deployed projects beat five half-finished repositories.','Write a tailored, specific note with your application: name the team, explain the skill you bring, and highlight one specific domain you want to learn.','Seek mentorship early: ask for a weekly feedback session. Interns who proactively ask for critique frequently receive return full-time offers.']},
  {id:3,t:'Beating ATS filters: keywords without keyword stuffing',tag:'ATS',m:4,b:['Applicant tracking systems scan your resume against the job description. Mirror the exact technical terminology where it genuinely reflects your experience.','Use clean semantic layouts. Avoid nested tables, graphics, and multi-column floating boxes for essential contact and work history details.','Test your resume with our ATS checker tool to discover which required keywords are missing before submitting.']},
  {id:4,t:'Interview prep in one weekend: a structured sprint',tag:'Interviews',m:6,b:['Prepare five versatile impact stories using the Situation, Task, Action, Result (STAR) framework. Most behavioral questions can be answered with one of these stories.','Research the company thoroughly: explore their product roadmap, customer base, and recent tech releases. Prepare two insightful questions for the interviewer.','Conduct at least one mock interview out loud. Speaking your answers aloud immediately exposes filler phrases and narrative gaps.']},
  {id:5,t:'Negotiating your first salary offer with confidence',tag:'Salary',m:5,b:['Understand market percentiles before discussing compensation. Use our Salary Insights tool as an objective baseline.','Negotiate the total package: base compensation, performance bonuses, joining bonus, remote equipment budget, and professional development stipends.','Maintain professional, calm specificity. A reasonable, data-backed counteroffer rarely puts an existing offer at risk.']},
  {id:6,t:'Hiring well as a growing engineering team',tag:'For recruiters',m:5,b:['Write transparent job posts that clearly state the salary compensation band, typical daily engineering challenges, and structured interview phases.','Provide prompt status updates to every candidate. Your employer brand and talent reputation depend heavily on candidate respect.','Maintain a disciplined candidate pipeline board so applicants always know exactly where they stand in the hiring cycle.']}
];

const bcard = a => `
  <a class="card job" href="#/blog/${a.id}" aria-label="${E(a.t)}">
    <div class="row sp" style="margin-bottom:8px">
      <span class="tag i">${E(a.tag)}</span>
      <span class="muted n" style="font-size:13px">${a.m} min read</span>
    </div>
    <h3 style="font-size:19px;line-height:1.35;margin:4px 0 10px;color:var(--h-ink)">${E(a.t)}</h3>
    <p class="muted" style="font-size:14px;margin:0 0 14px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${E(a.b[0])}</p>
    <div style="margin-top:auto;display:inline-flex;align-items:center;gap:6px;color:var(--sec);font-weight:600;font-size:14px">Read guide →</div>
  </a>
`;

function blog(id){
  if(id){
    const a = BL.find(x => x.id == id);
    if(!a) return '<div class="card empty"><h2>Article not found</h2><a class="btn" href="#/blog">← Back to all articles</a></div>';
    return `
      <div class="row" style="margin-bottom:20px"><a class="btn o s" href="#/blog">← All guides</a></div>
      <article class="card" style="max-width:760px;margin:0 auto;padding:32px 28px">
        <div class="row sp" style="margin-bottom:14px">
          <span class="tag i" style="font-size:13px;padding:4px 12px">${E(a.tag)}</span>
          <span class="muted n" style="font-size:14px">${a.m} min read</span>
        </div>
        <h1 style="font-size:32px;line-height:1.25;margin:0 0 20px">${E(a.t)}</h1>
        <div style="border-top:1px solid var(--line);margin:16px 0 24px"></div>
        ${a.b.map(p => `<p style="font-size:17px;line-height:1.75;margin:0 0 18px;color:var(--ink)">${E(p)}</p>`).join('')}
        <div class="card" style="margin-top:36px;background:var(--s2);border-color:var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
          <div><b style="font-size:17px;color:var(--h-ink);display:block">Ready to apply these insights?</b><span class="muted">Search verified jobs matching your skills.</span></div>
          <a class="btn" href="#/jobs">Browse open jobs →</a>
        </div>
      </article>
    `;
  }
  return `
    ${ph('Career blog & guides', 'Practical advice for job seekers, interns, and hiring teams.')}
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">${BL.map(bcard).join('')}</div>
  `;
}

/* -------------------------------------------------------------
 * 2. Company Ecosystem: Directory, Search & Filter
 * ------------------------------------------------------------- */
function companies(q){
  const t = (q.get('q') || '').toLowerCase().trim();
  const ind = q.get('ind') || '';
  const sz = q.get('size') || '';
  const md = q.get('mode') || '';
  const loc = q.get('loc') || '';
  const sort = q.get('sort') || 'roles';
  const view = LS.g('hh_coview', 'grid');
  const cmpList = LS.g('hh_co_cmp', []);

  // Filter companies
  let list = (db.companies || []).filter(c => {
    if(t && !c.name.toLowerCase().includes(t) && !c.tagline.toLowerCase().includes(t) && !c.industry.toLowerCase().includes(t)) return false;
    if(ind && c.industry !== ind) return false;
    if(sz && c.size !== sz) return false;
    if(loc && !c.hq.toLowerCase().includes(loc.toLowerCase())) return false;
    if(md){
      const hasJobWithMode = db.jobs.some(j => j.company_id === c.id && j.mode === md && j.st === 'approved');
      if(!hasJobWithMode && md === 'Remote' && !c.hq.toLowerCase().includes('remote')) return false;
    }
    return true;
  });

  // Sort companies
  if(sort === 'roles'){
    list.sort((a,b) => {
      const aRoles = db.jobs.filter(j => j.company_id === a.id && j.st === 'approved').length;
      const bRoles = db.jobs.filter(j => j.company_id === b.id && j.st === 'approved').length;
      return bRoles - aRoles || a.name.localeCompare(b.name);
    });
  } else if(sort === 'az'){
    list.sort((a,b) => a.name.localeCompare(b.name));
  } else if(sort === 'newest'){
    list.sort((a,b) => (b.founded || 0) - (a.founded || 0));
  }

  const allIndustries = [...new Set((db.companies || []).map(c => c.industry))].filter(Boolean);
  const allSizes = ['11–50', '51–200', '201–500'];
  const allLocations = [...new Set((db.companies || []).map(c => c.hq))].filter(Boolean);

  window.setCoParam = function(k, v){
    const p = new URLSearchParams(location.hash.split('?')[1] || '');
    if(v) p.set(k, v); else p.delete(k);
    go('#/companies?' + p.toString());
    render();
  };

  const setView = v => {
    LS.s('hh_coview', v);
    render();
  };

  const renderCard = c => {
    const openRoles = db.jobs.filter(j => j.company_id === c.id && j.st === 'approved').length;
    const isFlw = isFollowing(c.id);
    const flwCnt = getFollowersCount(c.id);
    const isCmp = cmpList.includes(c.id);
    const isHiringFast = openRoles >= 2;

    if(view === 'list'){
      return `
        <div class="card co-list-row" style="display:flex;align-items:center;gap:18px;padding:16px 20px;margin-bottom:12px;flex-wrap:wrap">
          <a href="#/company/${enc(c.slug || c.name)}" onmouseenter="coHoverPreview(event, ${c.id})" onmouseleave="coHoverLeave()" style="text-decoration:none;display:flex;align-items:center;gap:14px;flex:1;min-width:240px">
            ${renderCompanyLogo(c, 48)}
            <div>
              <div class="row" style="gap:8px;margin-bottom:2px">
                <b style="font-size:17px;color:var(--h-ink)">${E(c.name)}</b>
                ${c.verified ? `<span class="badge-tick" title="Verified employer" aria-label="Verified employer">✓</span>` : ''}
                ${isHiringFast ? `<span class="tag a" style="font-size:11px;padding:1px 7px">Hiring fast</span>` : ''}
              </div>
              <div class="muted" style="font-size:13px">${E(c.industry)} · ${E(c.hq)} · ${E(c.size)}</div>
            </div>
          </a>
          <div class="row" style="gap:14px;margin-left:auto">
            <a class="tag i" href="#/company/${enc(c.slug || c.name)}" style="font-size:13px;padding:6px 12px;text-decoration:none">${openRoles} open role${openRoles === 1 ? '' : 's'}</a>
            <button class="btn s o flw-btn ${isFlw ? 'following' : ''}" data-cid="${c.id}" onclick="toggleFollow(${c.id}, this)" aria-label="Follow ${E(c.name)}">${isFlw ? 'Following' : '+ Follow'}</button>
            <button class="btn s o" onclick="coModal(${c.id})" aria-label="Quick snapshot ${E(c.name)}">Preview</button>
            <button class="btn s o" onclick="coCompareToggle(${c.id})" aria-label="Compare ${E(c.name)}">${isCmp ? 'Compared ✓' : 'Compare'}</button>
          </div>
        </div>
      `;
    }

    // Grid Card View
    return `
      <div class="card co-card" style="display:flex;flex-direction:column;padding:22px;position:relative">
        <div class="row sp" style="align-items:flex-start;margin-bottom:14px">
          <a href="#/company/${enc(c.slug || c.name)}" onmouseenter="coHoverPreview(event, ${c.id})" onmouseleave="coHoverLeave()" style="text-decoration:none;display:flex;align-items:center;gap:14px">
            ${renderCompanyLogo(c, 52)}
            <div>
              <div class="row" style="gap:6px">
                <h3 style="margin:0;font-size:18px;color:var(--h-ink)">${E(c.name)}</h3>
                ${c.verified ? `<span class="badge-tick" title="Verified employer" aria-label="Verified employer">✓</span>` : ''}
              </div>
              <div class="muted" style="font-size:13px">${E(c.industry)} · ${E(c.hq)}</div>
            </div>
          </a>
          <button class="btn s o flw-btn ${isFlw ? 'following' : ''}" data-cid="${c.id}" onclick="toggleFollow(${c.id}, this)" aria-label="Follow ${E(c.name)}" style="margin-left:auto">${isFlw ? 'Following' : '+ Follow'}</button>
        </div>
        <p class="muted" style="font-size:14px;line-height:1.5;margin:0 0 16px;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${E(c.tagline || c.about)}</p>
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:18px">
          <span class="tag">${E(c.size)}</span>
          <span class="tag">Est. ${c.founded || '—'}</span>
          ${isHiringFast ? `<span class="tag a">Hiring fast</span>` : ''}
          <span class="tag i" style="margin-left:auto"><b class="n">${openRoles}</b> open role${openRoles === 1 ? '' : 's'}</span>
        </div>
        <div class="row sp" style="border-top:1px solid var(--line);padding-top:14px;margin-top:auto">
          <button class="btn s o" onclick="coModal(${c.id})" aria-label="Quick snapshot of ${E(c.name)}" style="gap:6px">Snapshot</button>
          <button class="btn s o" onclick="coCompareToggle(${c.id})" aria-label="Compare ${E(c.name)}" style="font-size:12px">${isCmp ? 'Compared ✓' : 'Compare'}</button>
          <a class="btn s" href="#/company/${enc(c.slug || c.name)}" style="margin-left:auto">View Profile →</a>
        </div>
      </div>
    `;
  };

  return `
    <div class="row sp" style="margin-bottom:20px;flex-wrap:wrap;gap:14px">
      <div>
        <h1 style="margin:0 0 4px">Companies Hiring Now</h1>
        <p class="muted" style="margin:0;font-size:16px">Explore verified employers, culture, benefits, and open roles.</p>
      </div>
      <div class="row" style="gap:10px">
        ${cmpList.length ? `<a class="btn s a" href="#/compare-companies">Compare (${cmpList.length})</a>` : ''}
        <div class="seg" style="display:inline-flex;background:var(--s2);border-radius:10px;padding:3px;border:1px solid var(--line)">
          <button class="btn s ${view==='grid'?'':'o'}" style="border:0;padding:6px 12px" onclick="LS.s('hh_coview','grid');render()" aria-label="Grid view">Grid</button>
          <button class="btn s ${view==='list'?'':'o'}" style="border:0;padding:6px 12px" onclick="LS.s('hh_coview','list');render()" aria-label="List view">List</button>
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="card" style="margin-bottom:24px;padding:16px 20px">
      <form class="row" style="gap:12px;flex-wrap:wrap" onsubmit="event.preventDefault();const f=this;setCoParam('q',f.q.value.trim());">
        <div style="flex:2;min-width:220px;position:relative">
          <input name="q" value="${E(t)}" placeholder="Search company by name, keyword or tagline..." aria-label="Search companies" style="padding-left:14px">
        </div>
        <div style="flex:1;min-width:160px">
          <select name="ind" onchange="setCoParam('ind',this.value)" aria-label="Filter by industry">
            <option value="">All Industries</option>
            ${allIndustries.map(i => `<option value="${E(i)}" ${ind===i?'selected':''}>${E(i)}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1;min-width:140px">
          <select name="size" onchange="setCoParam('size',this.value)" aria-label="Filter by company size">
            <option value="">All Sizes</option>
            ${allSizes.map(s => `<option value="${s}" ${sz===s?'selected':''}>${s} people</option>`).join('')}
          </select>
        </div>
        <div style="flex:1;min-width:140px">
          <select name="mode" onchange="setCoParam('mode',this.value)" aria-label="Filter by work mode">
            <option value="">All Modes</option>
            ${['Remote','Hybrid','On-site'].map(m => `<option value="${m}" ${md===m?'selected':''}>${m}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1;min-width:140px">
          <select name="sort" onchange="setCoParam('sort',this.value)" aria-label="Sort companies">
            <option value="roles" ${sort==='roles'?'selected':''}>Most Open Roles</option>
            <option value="az" ${sort==='az'?'selected':''}>Name A–Z</option>
            <option value="newest" ${sort==='newest'?'selected':''}>Newest Founded</option>
          </select>
        </div>
        <button class="btn" style="min-width:90px">Search</button>
      </form>
      ${(t || ind || sz || md || loc) ? `
        <div class="row" style="margin-top:12px;gap:8px">
          <span class="muted" style="font-size:13px">Active filters:</span>
          ${t ? `<span class="tag">"${E(t)}"</span>` : ''}
          ${ind ? `<span class="tag">${E(ind)}</span>` : ''}
          ${sz ? `<span class="tag">${E(sz)}</span>` : ''}
          ${md ? `<span class="tag">${E(md)}</span>` : ''}
          <a class="btn o s" href="#/companies" style="margin-left:auto;font-size:12px;padding:3px 9px">Clear all</a>
        </div>
      ` : ''}
    </div>

    <!-- Results Section -->
    <div class="row sp" style="margin-bottom:14px">
      <b><span class="n">${list.length}</span> compan${list.length === 1 ? 'y' : 'ies'} found</b>
      ${cmpList.length ? `<span class="muted" style="font-size:13px">${cmpList.length} selected for compare</span>` : ''}
    </div>

    ${list.length ? `
      <div class="${view==='grid'?'grid':'co-list'}" style="${view==='grid'?'grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:20px':''}">
        ${list.map(renderCard).join('')}
      </div>
    ` : `
      <div class="card empty" style="padding:48px 20px;text-align:center">
        <h3>No matching companies found</h3>
        <p class="muted">Try adjusting your keyword or clearing industry/size filters.</p>
        <a class="btn o" href="#/companies">Reset all filters</a>
      </div>
    `}

    <!-- Quick Hover / Preview Modal Placeholder -->
    <div id="coModal" class="co-modal-overlay" onclick="if(event.target===this)closeCoModal()" style="display:none">
      <div class="co-modal-box" id="coModalContent"></div>
    </div>

    <!-- Sticky Compare Drawer (if companies selected) -->
    ${cmpList.length ? `
      <div class="co-compare-bar" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--s1);border:1px solid var(--sec);padding:10px 20px;border-radius:14px;box-shadow:0 12px 36px rgba(0,0,0,0.6);z-index:90;display:flex;align-items:center;gap:16px">
        <span style="font-weight:600;color:var(--h-ink)">Comparing ${cmpList.length}/3 companies</span>
        <a class="btn s" href="#/compare-companies">View Comparison</a>
        <button class="btn s o" onclick="LS.s('hh_co_cmp',[]);render()">Clear</button>
      </div>
    ` : ''}
  `;
}

/* -------------------------------------------------------------
 * 3. Rich Company Profile Page (#/company/:slug)
 * ------------------------------------------------------------- */
let currentCoTab = 'overview';
function switchCompanyTab(tabName){
  currentCoTab = tabName;
  document.querySelectorAll('.co-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
  document.querySelectorAll('.co-tab-pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabName));
}

function company(slugOrId){
  const c = getCompany(slugOrId);
  if(!c) return '<div class="card empty"><h2>Company not found</h2><p class="muted">The requested company profile is not available.</p><a class="btn" href="#/companies">Browse companies</a></div>';

  const u = me();
  const isOwnerOrAdmin = u && (u.role === 'admin' || (c.rid && c.rid === u.id));
  const isFlw = isFollowing(c.id);
  const flwCnt = getFollowersCount(c.id);
  const companyJobs = db.jobs.filter(j => j.company_id === c.id && j.st === 'approved');

  const benefitsList = c.benefits || [
    'Comprehensive health insurance',
    'Flexible remote/hybrid work policy',
    'Annual learning and book stipend',
    'Ergonomic home office allowance',
    'Paid parental leave'
  ];

  const culturePillars = c.culture || [
    {title: 'Craft and Precision', desc: 'We take deep pride in clean typography, responsive execution, and robust architecture.'},
    {title: 'High Autonomy', desc: 'We trust team members to lead initiatives, make architectural calls, and ship with speed.'},
    {title: 'Transparent Communication', desc: 'Honest, timely feedback and clear documentation over backchannel politics.'}
  ];

  const locationsList = c.locations || [
    {city: c.hq, type: 'Primary Office', address: `${c.hq} City Center`}
  ];

  const galleryList = c.gallery || [
    {url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', caption: 'Open studio workspace'},
    {url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', caption: 'Collaborative team sprint'}
  ];

  const activeTab = currentCoTab || 'overview';

  return `
    <!-- Breadcrumb -->
    <div class="row" style="font-size:14px;margin-bottom:16px;gap:8px">
      <a href="#/companies" class="muted" style="text-decoration:none">Companies</a>
      <span class="muted">/</span>
      <span style="color:var(--h-ink);font-weight:600">${E(c.name)}</span>
      ${isOwnerOrAdmin ? `<a class="btn s o" href="#/dash?t=company" style="margin-left:auto">Edit Company Profile</a>` : ''}
    </div>

    <!-- Company Header Card -->
    <div class="card co-header" style="padding:0;overflow:hidden;margin-bottom:24px;border-color:var(--line)">
      <!-- Cover Banner -->
      <div class="co-banner" style="height:160px;background:linear-gradient(135deg,rgba(91,192,222,0.18),rgba(217,119,6,0.18)),var(--s2);position:relative">
        ${c.cover_url ? `<img src="${E(c.cover_url)}" alt="Cover" style="width:100%;height:100%;object-fit:cover">` : ''}
      </div>

      <!-- Main Header Body -->
      <div class="co-header-inner" style="position:relative">
        <div class="row sp" style="align-items:flex-end;margin-top:-44px;margin-bottom:18px;flex-wrap:wrap;gap:16px">
          <!-- Uncropped Logo Container -->
          <div class="co-logo-lg" style="width:88px;height:88px;border-radius:18px;background:var(--s1);border:3px solid var(--s1);box-shadow:var(--sh);display:grid;place-items:center;overflow:hidden;flex:none">
            ${c.logo_url ? `<img src="${E(c.logo_url)}" alt="${E(c.name)} logo" class="co-img" style="max-width:100%;max-height:100%;object-fit:contain">` : `<span class="co-mono-lg" style="font:800 32px 'Bricolage Grotesque';color:var(--h-ink)">${E(getMonogram(c.name))}</span>`}
          </div>
          <!-- Action Buttons -->
          <div class="row" style="gap:10px;margin-left:auto;flex-wrap:wrap">
            <button class="btn o flw-btn ${isFlw ? 'following' : ''}" data-cid="${c.id}" onclick="toggleFollow(${c.id}, this)" aria-label="Follow ${E(c.name)}">
              ${isFlw ? '<svg class="i" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="m5 12 5 5 9-10"/></svg> Following' : '+ Follow'}
            </button>
            <button class="btn o" onclick="coCompareToggle(${c.id})">Compare</button>
            <button class="btn o" onclick="navigator.clipboard&&navigator.clipboard.writeText(location.href);toast('Company link copied!')" aria-label="Share company">Share</button>
          </div>
        </div>

        <div>
          <div class="row" style="gap:10px;margin-bottom:6px">
            <h1 style="margin:0;font-size:30px">${E(c.name)}</h1>
            ${c.verified ? `<span class="badge-tick" title="Admin Verified Employer" style="background:rgba(52,211,153,0.18);color:var(--ok);border:1px solid var(--ok);padding:2px 8px;border-radius:20px;font-size:12px;font-weight:700">✓ Verified</span>` : ''}
          </div>
          <p style="font-size:17px;color:var(--ink);margin:0 0 14px;max-width:760px">${E(c.tagline)}</p>
          <div class="row" style="gap:10px;flex-wrap:wrap">
            <span class="tag i">${E(c.industry)}</span>
            <span class="tag">${E(c.hq)}</span>
            <span class="tag">${E(c.size)} employees</span>
            <span class="tag">Founded ${c.founded || '—'}</span>
            <span class="tag" style="color:var(--sec)"><span class="flw-cnt" data-cid="${c.id}">${flwCnt} follower${flwCnt === 1 ? '' : 's'}</span></span>
            ${c.website ? `<a class="tag" href="${E(c.website)}" target="_blank" rel="noopener noreferrer" style="color:var(--sec);text-decoration:none">${E(c.website.replace(/^https?:\/\//,''))} ↗</a>` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Navigation Tabs -->
    <div class="co-tabs" style="display:flex;gap:8px;border-bottom:1px solid var(--line);margin-bottom:24px;overflow-x:auto">
      <button class="co-tab-btn ${activeTab==='overview'?'active':''}" data-tab="overview" onclick="switchCompanyTab('overview')">Overview</button>
      <button class="co-tab-btn ${activeTab==='roles'?'active':''}" data-tab="roles" onclick="switchCompanyTab('roles')">Open Roles (${companyJobs.length})</button>
      <button class="co-tab-btn ${activeTab==='culture'?'active':''}" data-tab="culture" onclick="switchCompanyTab('culture')">Culture & Values</button>
      <button class="co-tab-btn ${activeTab==='locations'?'active':''}" data-tab="locations" onclick="switchCompanyTab('locations')">Locations (${locationsList.length})</button>
    </div>

    <!-- TAB 1: OVERVIEW -->
    <div id="tab-overview" class="co-tab-pane ${activeTab==='overview'?'active':''}">
      <div class="g2 co-profile-grid" style="gap:24px;align-items:start">
        <div>
          <!-- About -->
          <div class="card" style="margin-bottom:20px">
            <h2 style="font-size:22px">About ${E(c.name)}</h2>
            <p style="font-size:16px;line-height:1.7;color:var(--ink);margin:0 0 16px">${E(c.about)}</p>
          </div>

          <!-- Workplace Perks & Benefits -->
          <div class="card" style="margin-bottom:20px">
            <h2 style="font-size:22px;margin-bottom:16px">Perks & Benefits</h2>
            <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
              ${benefitsList.map(b => `
                <div class="card" style="padding:14px;background:var(--s2);border-color:var(--line);display:flex;align-items:center;gap:10px">
                  <span style="color:var(--sec);font-size:18px">✦</span>
                  <span style="font-size:14px;font-weight:600;color:var(--ink)">${E(b)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Photo Gallery -->
          ${galleryList.length ? `
            <div class="card">
              <h2 style="font-size:22px;margin-bottom:16px">Workplace & Team</h2>
              <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px">
                ${galleryList.map(img => `
                  <div class="card" style="padding:0;overflow:hidden;cursor:pointer;position:relative" onclick="openLightbox('${E(img.url)}','${E(img.caption)}')">
                    <img src="${E(img.url)}" alt="${E(img.caption)}" style="width:100%;height:160px;object-fit:cover;display:block">
                    <div style="padding:8px 12px;font-size:13px;color:var(--muted)">${E(img.caption)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Sidebar Snapshot -->
        <div>
          <div class="card" style="position:sticky;top:80px">
            <h3 style="margin-top:0">Company Snapshot</h3>
            <div style="border-top:1px solid var(--line);margin:14px 0"></div>
            <dl class="ov" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0">
              <div><dt class="muted" style="font-size:12px">HEADQUARTERS</dt><dd style="font-weight:600;margin:4px 0 0">${E(c.hq)}</dd></div>
              <div><dt class="muted" style="font-size:12px">INDUSTRY</dt><dd style="font-weight:600;margin:4px 0 0">${E(c.industry)}</dd></div>
              <div><dt class="muted" style="font-size:12px">SIZE</dt><dd style="font-weight:600;margin:4px 0 0">${E(c.size)}</dd></div>
              <div><dt class="muted" style="font-size:12px">FOUNDED</dt><dd style="font-weight:600;margin:4px 0 0">${c.founded || '—'}</dd></div>
            </dl>
            ${(c.tech_stack && c.tech_stack.length) ? `
              <h4 style="margin:20px 0 10px;font-size:14px">Tech Stack</h4>
              <div class="row" style="gap:6px;flex-wrap:wrap">
                ${c.tech_stack.map(t => `<span class="tag i">${E(t)}</span>`).join('')}
              </div>
            ` : ''}
            <div style="border-top:1px solid var(--line);margin:20px 0 16px"></div>
            <div style="text-align:center">
              <span class="muted" style="font-size:13px;display:block;margin-bottom:8px">Interested in working here?</span>
              <button class="btn" style="width:100%" onclick="switchCompanyTab('roles')">View ${companyJobs.length} Open Roles</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: OPEN ROLES -->
    <div id="tab-roles" class="co-tab-pane ${activeTab==='roles'?'active':''}">
      <div class="card" style="margin-bottom:20px;padding:16px 20px">
        <div class="row sp">
          <h2 style="font-size:22px;margin:0">Open Roles at ${E(c.name)}</h2>
          <span class="tag i">${companyJobs.length} active listing${companyJobs.length === 1 ? '' : 's'}</span>
        </div>
      </div>
      ${companyJobs.length ? `
        <div class="grid" style="grid-template-columns:1fr;gap:14px">
          ${companyJobs.map(card).join('')}
        </div>
      ` : `
        <div class="card empty" style="padding:40px 20px;text-align:center">
          <h3>No open roles right now</h3>
          <p class="muted">Follow ${E(c.name)} to receive an alert when a new role is posted.</p>
          <button class="btn flw-btn ${isFlw ? 'following' : ''}" data-cid="${c.id}" onclick="toggleFollow(${c.id}, this)">${isFlw ? 'Following' : '+ Follow for updates'}</button>
        </div>
      `}
    </div>

    <!-- TAB 3: CULTURE & VALUES -->
    <div id="tab-culture" class="co-tab-pane ${activeTab==='culture'?'active':''}">
      <div class="card" style="margin-bottom:20px">
        <h2 style="font-size:22px;margin-bottom:8px">Our Culture & Value Pillars</h2>
        <p class="muted" style="margin:0">The principles guiding how we make decisions, build products, and grow together.</p>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px">
        ${culturePillars.map((p, idx) => `
          <div class="card" style="padding:24px">
            <div class="row" style="gap:12px;margin-bottom:12px">
              <span class="n" style="width:34px;height:34px;border-radius:10px;background:var(--s2);border:1px solid var(--line);display:grid;place-items:center;color:var(--sec);font-size:16px">0${idx + 1}</span>
              <h3 style="margin:0;font-size:18px;color:var(--h-ink)">${E(p.title)}</h3>
            </div>
            <p style="font-size:15px;line-height:1.6;color:var(--ink);margin:0">${E(p.desc)}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- TAB 4: LOCATIONS -->
    <div id="tab-locations" class="co-tab-pane ${activeTab==='locations'?'active':''}">
      <div class="card" style="margin-bottom:20px">
        <h2 style="font-size:22px;margin-bottom:8px">Office & Remote Locations</h2>
        <p class="muted" style="margin:0">Where our team collaborates and works.</p>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px">
        ${locationsList.map(loc => `
          <div class="card" style="padding:22px">
            <span class="tag i" style="margin-bottom:12px">${E(loc.type)}</span>
            <h3 style="margin:0 0 6px">${E(loc.city)}</h3>
            <p class="muted" style="margin:0 0 16px">${E(loc.address)}</p>
            <div class="card" style="padding:16px;background:var(--s2);text-align:center;color:var(--muted);font-size:13px">
              📍 Location active
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Company Hiring Pulse -->
    <div class="card" style="margin-top:28px">
      <div class="row sp" style="margin-bottom:14px">
        <div>
          <h3 style="margin:0;font-size:19px">Company Hiring Pulse</h3>
          <p class="muted" style="margin:0;font-size:13.5px">Real-time candidate telemetry and hiring momentum.</p>
        </div>
        <span class="tag i" style="font-size:12px">Live activity</span>
      </div>
      <div class="g4">
        <div class="stat"><span class="n">${companyJobs.length}</span>Open Roles</div>
        <div class="stat"><span class="n">${companyJobs.filter(j => (Date.now() - j.at) / 864e5 <= 7).length}</span>New This Week</div>
        <div class="stat"><span class="n">${flwCnt}</span>Seekers Following</div>
        <div class="stat"><span class="n">24h</span>Avg Review Time</div>
      </div>
    </div>

    <!-- Similar Companies Row -->
    ${(() => {
      const similar = (db.companies || []).filter(x => x.id !== c.id && (x.industry === c.industry || x.size === c.size)).slice(0, 3);
      if(!similar.length) return '';
      return `
        <div style="margin-top:36px">
          <div class="row sp" style="margin-bottom:16px">
            <div>
              <h2 style="font-size:22px;margin:0">Similar Verified Companies</h2>
              <p class="muted" style="margin:0;font-size:14px">Other employers in ${E(c.industry)} and related spaces.</p>
            </div>
            <a class="btn s o" href="#/companies?ind=${enc(c.industry)}">Browse all →</a>
          </div>
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
            ${similar.map(sc => {
              const scRoles = db.jobs.filter(j => j.company_id === sc.id && j.st === 'approved').length;
              return `
                <a class="card jrow" href="#/company/${enc(sc.slug || sc.name)}" style="margin:0">
                  ${renderCompanyLogo(sc, 48)}
                  <div class="jb">
                    <div class="row" style="gap:6px">
                      <b style="font-size:16px;color:var(--h-ink)">${E(sc.name)}</b>
                      ${sc.verified ? '<span class="badge-tick">✓</span>' : ''}
                    </div>
                    <div class="sub">${E(sc.industry)} · ${E(sc.hq)}</div>
                  </div>
                  <span class="tag i">${scRoles} open</span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;
    })()}

    <!-- Lightbox Modal -->
    <div id="coLightbox" class="co-modal-overlay" onclick="if(event.target===this)closeLightbox()" style="display:none">
      <div class="co-lightbox-box">
        <button class="btn s o" onclick="closeLightbox()" style="position:absolute;top:12px;right:12px">✕ Close</button>
        <img id="lbImg" src="" alt="Enlarged" style="max-width:100%;max-height:80vh;border-radius:12px;display:block;margin:auto">
        <p id="lbCap" style="text-align:center;margin-top:12px;color:var(--ink)"></p>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------
 * 4. Company Hover/Snapshot Preview Modal
 * ------------------------------------------------------------- */
function coModal(id){
  const c = getCompany(id);
  if(!c) return;
  const modal = $('#coModal');
  const box = $('#coModalContent');
  if(!modal || !box) return;
  const openRoles = db.jobs.filter(j => j.company_id === c.id && j.st === 'approved').length;
  const isFlw = isFollowing(c.id);
  const flwCnt = getFollowersCount(c.id);

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
      <div class="row" style="gap:14px">
        ${renderCompanyLogo(c, 56)}
        <div>
          <div class="row" style="gap:6px">
            <h3 style="margin:0;font-size:20px">${E(c.name)}</h3>
            ${c.verified ? '<span class="badge-tick">✓</span>' : ''}
          </div>
          <span class="muted" style="font-size:13px">${E(c.industry)} · ${E(c.hq)}</span>
        </div>
      </div>
      <button class="btn s o" onclick="closeCoModal()">Close ✕</button>
    </div>
    <p style="font-size:15px;line-height:1.5;color:var(--ink);margin:0 0 16px">${E(c.tagline || c.about)}</p>
    <div class="row" style="gap:8px;margin-bottom:18px;flex-wrap:wrap">
      <span class="tag">${E(c.size)}</span>
      <span class="tag">Est. ${c.founded || '—'}</span>
      <span class="tag i">${openRoles} open role${openRoles === 1 ? '' : 's'}</span>
      <span class="tag"><span class="flw-cnt" data-cid="${c.id}">${flwCnt} follower${flwCnt === 1 ? '' : 's'}</span></span>
    </div>
    <div class="row sp" style="border-top:1px solid var(--line);padding-top:16px">
      <button class="btn o flw-btn ${isFlw ? 'following' : ''}" data-cid="${c.id}" onclick="toggleFollow(${c.id}, this)">
        ${isFlw ? 'Following' : '+ Follow'}
      </button>
      <a class="btn" href="#/company/${enc(c.slug || c.name)}" onclick="closeCoModal()">Full Company Profile →</a>
    </div>
  `;
  modal.style.display = 'flex';
}

function closeCoModal(){
  const modal = $('#coModal');
  if(modal) modal.style.display = 'none';
}

function openLightbox(url, caption){
  const lb = $('#coLightbox');
  const img = $('#lbImg');
  const cap = $('#lbCap');
  if(!lb || !img) return;
  img.src = url;
  if(cap) cap.textContent = caption || '';
  lb.style.display = 'flex';
}

function closeLightbox(){
  const lb = $('#coLightbox');
  if(lb) lb.style.display = 'none';
}

/* -------------------------------------------------------------
 * 5. Company Comparison Tool (#/compare-companies)
 * ------------------------------------------------------------- */
function coCompareToggle(id){
  let list = LS.g('hh_co_cmp', []);
  if(list.includes(id)){
    list = list.filter(x => x !== id);
    toast('Removed from comparison');
  } else {
    if(list.length >= 3){
      return toast('You can compare a maximum of 3 companies at a time');
    }
    list.push(id);
    toast('Added to comparison (' + list.length + '/3)');
  }
  LS.s('hh_co_cmp', list);
  render();
}

function compareCompanies(){
  const cmpList = LS.g('hh_co_cmp', []);
  const companiesList = cmpList.map(id => getCompany(id)).filter(Boolean);
  const remaining = (db.companies || []).filter(c => !cmpList.includes(c.id));

  return `
    <div class="row sp" style="margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div>
        <h1 style="margin:0 0 4px">Compare Companies</h1>
        <p class="muted" style="margin:0">Side-by-side comparison of company size, perks, remote policy, and tech stack.</p>
      </div>
      <div class="row" style="gap:10px">
        <a class="btn o s" href="#/companies">← Back to Directory</a>
        ${cmpList.length ? `<button class="btn s o" onclick="LS.s('hh_co_cmp',[]);render()">Clear all</button>` : ''}
      </div>
    </div>

    <!-- Company Selector Dropdown -->
    <div class="card" style="margin-bottom:24px;padding:16px 20px">
      <div class="row" style="gap:14px;align-items:center;flex-wrap:wrap">
        <b>Add company to compare:</b>
        <select style="max-width:320px" onchange="if(this.value){coCompareToggle(+this.value);this.value='';}" aria-label="Add company to comparison">
          <option value="">— Choose a company —</option>
          ${remaining.map(c => `<option value="${c.id}">${E(c.name)} (${E(c.industry)})</option>`).join('')}
        </select>
        <span class="muted" style="font-size:13px">Compare up to 3 companies side-by-side.</span>
      </div>
    </div>

    ${companiesList.length ? `
      <div class="card" style="padding:0;overflow-x:auto">
        <table class="co-compare-table" style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="width:20%;background:var(--s2);padding:18px">Attribute</th>
              ${companiesList.map(c => `
                <th style="width:${80/companiesList.length}%;padding:18px;text-align:left;vertical-align:top">
                  <div class="row sp" style="margin-bottom:10px">
                    <div class="row" style="gap:10px">
                      ${renderCompanyLogo(c, 40)}
                      <div>
                        <b style="font-size:17px;color:var(--h-ink)">${E(c.name)}</b>
                        ${c.verified ? '<span class="badge-tick">✓</span>' : ''}
                      </div>
                    </div>
                    <button class="btn s o x" onclick="coCompareToggle(${c.id})" title="Remove" aria-label="Remove ${E(c.name)}">✕</button>
                  </div>
                  <a class="btn s" href="#/company/${enc(c.slug || c.name)}" style="width:100%">Profile →</a>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Tagline</b></td>
              ${companiesList.map(c => `<td><span class="muted">${E(c.tagline)}</span></td>`).join('')}
            </tr>
            <tr>
              <td><b>Industry</b></td>
              ${companiesList.map(c => `<td><span class="tag i">${E(c.industry)}</span></td>`).join('')}
            </tr>
            <tr>
              <td><b>Headquarters</b></td>
              ${companiesList.map(c => `<td><b>${E(c.hq)}</b></td>`).join('')}
            </tr>
            <tr>
              <td><b>Company Size</b></td>
              ${companiesList.map(c => `<td>${E(c.size)} employees</td>`).join('')}
            </tr>
            <tr>
              <td><b>Founded</b></td>
              ${companiesList.map(c => `<td>${c.founded || '—'}</td>`).join('')}
            </tr>
            <tr>
              <td><b>Open Roles</b></td>
              ${companiesList.map(c => {
                const count = db.jobs.filter(j => j.company_id === c.id && j.st === 'approved').length;
                return `<td><span class="n" style="font-size:18px;color:var(--sec);font-weight:700">${count}</span> open role${count === 1 ? '' : 's'}</td>`;
              }).join('')}
            </tr>
            <tr>
              <td><b>Key Perks & Benefits</b></td>
              ${companiesList.map(c => `
                <td>
                  <ul style="padding-left:18px;margin:0;font-size:13.5px">
                    ${(c.benefits || []).slice(0, 4).map(b => `<li>${E(b)}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><b>Tech Stack</b></td>
              ${companiesList.map(c => `
                <td>
                  <div class="row" style="gap:4px;flex-wrap:wrap">
                    ${(c.tech_stack || []).map(t => `<span class="tag">${E(t)}</span>`).join('')}
                  </div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><b>Follow</b></td>
              ${companiesList.map(c => {
                const isFlw = isFollowing(c.id);
                return `
                  <td>
                    <button class="btn s o flw-btn ${isFlw ? 'following' : ''}" data-cid="${c.id}" onclick="toggleFollow(${c.id}, this)">
                      ${isFlw ? 'Following ✓' : '+ Follow'}
                    </button>
                  </td>
                `;
              }).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    ` : `
      <div class="card empty" style="padding:48px 20px;text-align:center">
        <h3>No companies selected for comparison</h3>
        <p class="muted">Add companies from the dropdown above or click "Compare" in the Company Directory.</p>
        <a class="btn" href="#/companies">Explore Company Directory</a>
      </div>
    `}
  `;
}

/* -------------------------------------------------------------
 * 6. Recruiter Company Management (#/dash?t=company)
 * ------------------------------------------------------------- */
function recruiterCompanyView(u){
  let c = (db.companies || []).find(x => x.rid === u.id);
  if(!c && u.role === 'recruiter' && u.name === 'Nova Labs'){
    c = getCompany('nova-labs');
  }
  if(!c){
    c = {
      id: nid(),
      name: u.name || 'My Company',
      slug: (u.name || 'my-company').toLowerCase().replace(/\s+/g,'-'),
      rid: u.id,
      logo_url: null,
      cover_url: null,
      tagline: 'Leading team shipping quality solutions.',
      website: 'https://example.com',
      industry: 'Design & Software',
      size: '11–50',
      hq: 'Remote',
      founded: 2022,
      about: 'Describe what your team builds, values, and why talent should join.',
      benefits: ['Health insurance', 'Flexible hours', 'Learning stipend'],
      tech_stack: ['React', 'TypeScript', 'Node.js'],
      culture: [{title: 'Autonomy', desc: 'We trust engineers to lead and execute.'}],
      locations: [{city: 'Remote', type: 'Headquarters', address: 'Distributed'}],
      gallery: [],
      verified: false,
      created_at: Date.now()
    };
    db.companies.push(c);
    save();
  }

  const checks = [
    {label: 'Company logo', done: !!c.logo_url},
    {label: 'Tagline', done: !!c.tagline},
    {label: 'About narrative', done: !!(c.about && c.about.length > 50)},
    {label: 'Perks & benefits', done: !!(c.benefits && c.benefits.length)},
    {label: 'Tech stack', done: !!(c.tech_stack && c.tech_stack.length)}
  ];
  const compPct = Math.round(checks.filter(x => x.done).length / checks.length * 100);
  const pendingTips = checks.filter(x => !x.done);
  const profileViews = 180 + (c.id * 73) % 420;

  return `
    <div class="row sp ph">
      <div>
        <h1>My Company Profile</h1>
        <p>Manage your employer branding, uncropped logo, benefits, and culture pillars.</p>
      </div>
      <a class="btn o s" href="#/company/${enc(c.slug || c.name)}" target="_blank">View Live Profile ↗</a>
    </div>

    <div class="g2" style="grid-template-columns:3fr 2fr;gap:24px;align-items:start">
      <!-- Edit Form -->
      <form id="coEditForm" class="card" onsubmit="event.preventDefault();saveCompanyProfile(this, ${c.id})">
        <h3 style="margin-top:0">Company Profile Information</h3>

        <label>Company Name</label>
        <input name="name" required maxlength="100" value="${E(c.name)}" oninput="updateCoPreview()">

        <label>Tagline (One clear sentence)</label>
        <input name="tagline" required maxlength="200" value="${E(c.tagline)}" oninput="updateCoPreview()">

        <div class="row" style="gap:14px">
          <div style="flex:1">
            <label>Industry</label>
            <input name="industry" required maxlength="60" value="${E(c.industry)}" oninput="updateCoPreview()">
          </div>
          <div style="flex:1">
            <label>Company Size</label>
            <select name="size" onchange="updateCoPreview()">
              ${['1–10','11–50','51–200','201–500','500+'].map(s => `<option value="${s}" ${c.size===s?'selected':''}>${s} employees</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="row" style="gap:14px">
          <div style="flex:1">
            <label>Headquarters (City or Remote)</label>
            <input name="hq" required maxlength="80" value="${E(c.hq)}" oninput="updateCoPreview()">
          </div>
          <div style="flex:1">
            <label>Founded Year</label>
            <input name="founded" type="number" min="1900" max="2026" value="${c.founded||2020}" oninput="updateCoPreview()">
          </div>
        </div>

        <label>Official Website</label>
        <input name="website" type="url" required maxlength="255" value="${E(c.website)}" oninput="updateCoPreview()">

        <label>About Company</label>
        <textarea name="about" rows="4" required maxlength="1500" oninput="updateCoPreview()">${E(c.about)}</textarea>

        <label>Tech Stack / Tools (Comma-separated)</label>
        <input name="tech_stack" value="${E((c.tech_stack || []).join(', '))}" placeholder="React, TypeScript, AWS, Node.js">

        <label>Perks & Benefits (Comma-separated)</label>
        <input name="benefits" value="${E((c.benefits || []).join(', '))}" placeholder="Health insurance, Remote stipend, Annual bonus">

        <!-- LOGO UPLOAD COMPONENT -->
        <div style="border-top:1px solid var(--line);margin:20px 0 16px;padding-top:16px">
          <h4 style="margin:0 0 6px">Company Logo Upload</h4>
          <p class="muted" style="font-size:13px;margin:0 0 12px">Upload high-resolution logo. Formats: PNG, JPG, SVG, WebP. Max 2MB. Logo is displayed uncropped preserving its natural aspect ratio.</p>
          <div id="logoDropzone" class="co-dropzone" onclick="$('#coLogoFileInput').click()" style="border:2px dashed var(--line);padding:20px;border-radius:12px;text-align:center;cursor:pointer;background:var(--s2);transition:.2s">
            <div id="dropText">Click or Drag & Drop company logo here</div>
            <input type="file" id="coLogoFileInput" accept=".png,.jpg,.jpeg,.svg,.webp" style="display:none" onchange="handleLogoUpload(this, ${c.id})">
          </div>
          <div id="logoUploadError" style="color:var(--bad);font-size:13px;margin-top:6px;display:none"></div>
          <div class="row" style="margin-top:10px;gap:10px">
            <button type="button" class="btn s o" onclick="resetToMonogram(${c.id})">Remove Logo & Use Monogram</button>
          </div>
        </div>

        <p style="margin-top:20px">
          <button class="btn" style="width:100%">Save Company Profile</button>
        </p>
      </form>

      <!-- Live Preview & Completeness Column -->
      <div style="position:sticky;top:80px;display:flex;flex-direction:column;gap:18px">
        <!-- Completeness Ring Card -->
        <div class="card" style="background:var(--s1);margin:0">
          <h4 style="margin-top:0">Profile Completeness</h4>
          <div class="row" style="gap:16px;align-items:center;margin-bottom:12px">
            <div class="donut n" style="background:conic-gradient(var(--sec) ${compPct*3.6}deg,var(--s2) 0);width:60px;height:60px;border-radius:50%;display:grid;place-items:center;flex:none">
              <span style="background:var(--s1);width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-size:14px;color:var(--h-ink)">${compPct}%</span>
            </div>
            <div>
              <b style="font-size:15px;color:var(--h-ink)">${compPct === 100 ? 'All Details Complete' : 'Profile in Progress'}</b>
              <div class="muted" style="font-size:12.5px">${checks.filter(x=>x.done).length} of ${checks.length} criteria met</div>
            </div>
          </div>
          ${pendingTips.length ? `
            <div style="border-top:1px solid var(--line);padding-top:8px;font-size:12.5px">
              <span class="muted">Tips to boost applicant trust:</span>
              <ul style="padding-left:16px;margin:4px 0 0;color:var(--ink)">
                ${pendingTips.slice(0, 3).map(t => `<li>Add ${t.label}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div style="border-top:1px solid var(--line);margin-top:10px;padding-top:8px" class="row sp">
            <span class="muted" style="font-size:12.5px">Profile views this month</span>
            <b class="n" style="color:var(--sec);font-size:16px">${profileViews}</b>
          </div>
        </div>

        <!-- Live Directory Card Preview -->
        <div class="card" style="background:var(--s1);margin:0">
          <h4 style="margin-top:0">Live Directory Card Preview</h4>
          <div id="coLivePreviewCard" class="card co-card" style="margin-top:12px">
            <div class="row sp" style="margin-bottom:12px">
              <div class="row" style="gap:12px">
                <div id="prevLogoBox" class="co-logo-box" style="--s:48px">
                  ${c.logo_url ? `<img src="${E(c.logo_url)}" alt="Logo" class="co-img">` : `<span class="co-mono">${E(getMonogram(c.name))}</span>`}
                </div>
                <div>
                  <b id="prevName" style="font-size:17px;color:var(--h-ink)">${E(c.name)}</b>
                  <div id="prevMeta" class="muted" style="font-size:13px">${E(c.industry)} · ${E(c.hq)}</div>
                </div>
              </div>
              <span class="tag i">0 open</span>
            </div>
            <p id="prevTagline" class="muted" style="font-size:13.5px;margin:0 0 14px">${E(c.tagline)}</p>
            <div class="row" style="gap:6px">
              <span id="prevSize" class="tag">${E(c.size)}</span>
              <span class="btn s o" style="margin-left:auto;pointer-events:none">+ Follow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateCoPreview(){
  const f = $('#coEditForm');
  if(!f) return;
  const name = f.name.value.trim() || 'My Company';
  const tagline = f.tagline.value.trim() || 'Company tagline';
  const industry = f.industry.value.trim() || 'Industry';
  const hq = f.hq.value.trim() || 'Location';
  const size = f.size.value;

  const pName = $('#prevName');
  const pTagline = $('#prevTagline');
  const pMeta = $('#prevMeta');
  const pSize = $('#prevSize');
  if(pName) pName.textContent = name;
  if(pTagline) pTagline.textContent = tagline;
  if(pMeta) pMeta.textContent = `${industry} · ${hq}`;
  if(pSize) pSize.textContent = `${size} employees`;
}

function handleLogoUpload(input, companyId){
  const file = input.files && input.files[0];
  const errEl = $('#logoUploadError');
  if(!file) return;

  const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  if(!validTypes.includes(file.type)){
    if(errEl){
      errEl.textContent = 'Invalid file type. Only PNG, JPG, SVG, and WebP are allowed.';
      errEl.style.display = 'block';
    }
    toast('Error: Unsupported image type');
    return;
  }

  // Max 2MB check
  if(file.size > 2 * 1024 * 1024){
    if(errEl){
      errEl.textContent = 'File size exceeds 2MB limit (selected: ' + (file.size/(1024*1024)).toFixed(1) + 'MB).';
      errEl.style.display = 'block';
    }
    toast('Error: File exceeds 2MB');
    return;
  }

  // Malicious SVG validation check
  if(file.type === 'image/svg+xml'){
    const reader = new FileReader();
    reader.onload = e => {
      const text = String(e.target.result).toLowerCase();
      if(text.includes('<script') || text.includes('onload=') || text.includes('onerror=') || text.includes('javascript:')){
        if(errEl){
          errEl.textContent = 'Security alert: Malicious SVG content detected (scripts/event handlers are forbidden).';
          errEl.style.display = 'block';
        }
        toast('Security alert: Malicious SVG blocked');
        return;
      }
      applyLogoData(e.target.result, companyId);
    };
    reader.readAsText(file);
    return;
  }

  // Valid raster image
  const reader = new FileReader();
  reader.onload = e => {
    applyLogoData(e.target.result, companyId);
  };
  reader.readAsDataURL(file);
}

function applyLogoData(dataUrl, companyId){
  const errEl = $('#logoUploadError');
  if(errEl) errEl.style.display = 'none';

  const c = db.companies.find(x => x.id == companyId);
  if(c){
    c.logo_url = dataUrl;
    save();
  }

  const prevBox = $('#prevLogoBox');
  if(prevBox){
    prevBox.innerHTML = `<img src="${E(dataUrl)}" alt="Logo" class="co-img" style="max-width:100%;max-height:100%;object-fit:contain">`;
  }
  const dt = $('#dropText');
  if(dt) dt.textContent = '✓ Logo loaded successfully! Click to change.';
  toast('Logo uploaded! Natural aspect ratio preserved.');
}

function resetToMonogram(companyId){
  const c = db.companies.find(x => x.id == companyId);
  if(c){
    c.logo_url = null;
    save();
  }
  const prevBox = $('#prevLogoBox');
  if(prevBox && c){
    prevBox.innerHTML = `<span class="co-mono">${E(getMonogram(c.name))}</span>`;
  }
  const dt = $('#dropText');
  if(dt) dt.textContent = 'Click or Drag & Drop company logo here';
  toast('Reverted to monogram avatar.');
}

function saveCompanyProfile(f, companyId){
  const u = me();
  const c = db.companies.find(x => x.id == companyId);
  if(!c) return;

  // Permissions check: only owner or admin can edit
  if(u.role !== 'admin' && c.rid !== u.id){
    toast('Permission denied: You can only edit your own company');
    return;
  }

  c.name = f.name.value.trim();
  c.tagline = f.tagline.value.trim();
  c.industry = f.industry.value.trim();
  c.size = f.size.value;
  c.hq = f.hq.value.trim();
  c.founded = parseInt(f.founded.value) || c.founded;
  c.website = f.website.value.trim();
  c.about = f.about.value.trim();
  c.tech_stack = f.tech_stack.value.split(',').map(s => s.trim()).filter(Boolean);
  c.benefits = f.benefits.value.split(',').map(s => s.trim()).filter(Boolean);

  save();
  toast('Company profile updated successfully!');
  render();
}

/* -------------------------------------------------------------
 * 7. Seeker Dashboard Followed Companies Tab (#/dash?t=following)
 * ------------------------------------------------------------- */
function seekerFollowingView(u){
  const follows = (db.follows || []).filter(f => f.userId === u.id);
  const followedCompanies = follows.map(f => getCompany(f.companyId)).filter(Boolean);

  return `
    <div class="ph">
      <h1>Followed Companies</h1>
      <p>Companies you follow. Receive alerts whenever they post new jobs or internships.</p>
    </div>
    ${followedCompanies.length ? `
      <div class="grid" style="grid-template-columns:1fr;gap:14px">
        ${followedCompanies.map(c => {
          const openRoles = db.jobs.filter(j => j.company_id === c.id && j.st === 'approved').length;
          return `
            <div class="card" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:18px 22px">
              <a href="#/company/${enc(c.slug || c.name)}" style="text-decoration:none;display:flex;align-items:center;gap:14px;flex:1;min-width:240px">
                ${renderCompanyLogo(c, 48)}
                <div>
                  <div class="row" style="gap:6px">
                    <b style="font-size:18px;color:var(--h-ink)">${E(c.name)}</b>
                    ${c.verified ? '<span class="badge-tick">✓</span>' : ''}
                  </div>
                  <div class="muted" style="font-size:13.5px">${E(c.industry)} · ${E(c.hq)}</div>
                </div>
              </a>
              <div class="row" style="gap:12px;margin-left:auto">
                <span class="tag i">${openRoles} open role${openRoles === 1 ? '' : 's'}</span>
                <a class="btn s" href="#/company/${enc(c.slug || c.name)}">View Profile</a>
                <button class="btn s o" onclick="toggleFollow(${c.id}, this)">Unfollow</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="card empty" style="padding:48px 20px;text-align:center">
        <h3>You are not following any companies yet</h3>
        <p class="muted">Follow companies in the directory to get instant notifications when new jobs are posted.</p>
        <a class="btn" href="#/companies">Explore Company Directory</a>
      </div>
    `}
  `;
}

/* -------------------------------------------------------------
 * 8. Other Utility Pages
 * ------------------------------------------------------------- */
const SAL=[['Frontend Developer',5,14,32],['Backend Engineer',6,20,45],['Data Analyst',4,9,22],['Machine Learning Engineer',8,24,55],['DevOps Engineer',6,16,38],['Product Designer',4,12,30],['Marketing Executive',3,6,16],['HR Executive',3,5,12],['Customer Success Associate',2,4,10],['Content Writer',2,5,14],['Finance Analyst',4,8,20],['Product Manager',10,25,60]];
function salary(q){
  const t=(q.get('q')||'').toLowerCase(),R=SAL.filter(r=>r[0].toLowerCase().includes(t));
  return ph('Salary insights','Typical yearly pay in lakhs per annum (LPA) by role. Baseline market ranges to help you prepare.')+`
    <form class="search" style="max-width:560px;margin-bottom:24px" onsubmit="event.preventDefault();go('#/salary?q='+enc(this.q.value))">
      <input name="q" value="${E(q.get('q')||'')}" placeholder="Search role...">
      <button class="btn">Search</button>
    </form>
    <div class="card" style="overflow-x:auto"><table><tr><th>Role</th><th>Entry</th><th>Median</th><th>Senior</th><th style="width:30%">Range</th></tr>${R.map(r=>`<tr><td><b>${r[0]}</b></td><td class="n">${r[1]} LPA</td><td class="n">${r[2]} LPA</td><td class="n">${r[3]} LPA</td><td><div class="bar2"><i style="left:${r[1]/.6}%;width:${(r[3]-r[1])/.6}%"></i><u style="left:${r[2]/.6}%"></u></div></td></tr>`).join('')||'<tr><td colspan=5 class="empty">No roles match.</td></tr>'}</table></div>
  `;
}

const RK='hhres',rv=()=>{const u=me()||{};return Object.assign({name:u.name||'',email:u.email||'',phone:u.phone||'',head:u.headline||'',sum:'',skills:u.skills||'',exp:'',edu:''},LS.g(RK,{}))};
const li=t=>t.split('\n').filter(x=>x.trim()).map(x=>`<li>${E(x.trim())}</li>`).join('');
function rp(){const r={};['name','email','phone','head','sum','skills','exp','edu'].forEach(k=>{const el=$('#r_'+k);if(el)r[k]=el.value;});LS.s(RK,r);const box=$('#rp');if(!box)return;box.innerHTML=`<h1>${E(r.name)||'Your Name'}</h1><div class="muted">${E(r.head)}</div><div class="muted">${[r.email,r.phone].filter(Boolean).map(E).join(' · ')}</div>${r.sum?`<h3>Summary</h3><p>${E(r.sum)}</p>`:''}${r.skills?`<h3>Skills</h3><p>${E(r.skills)}</p>`:''}${r.exp?`<h3>Experience</h3><ul>${li(r.exp)}</ul>`:''}${r.edu?`<h3>Education</h3><ul>${li(r.edu)}</ul>`:''}`}
function resume(){const r=rv(),f=(k,l,t='input',p='')=>`<label>${l}</label>${t==='input'?`<input id="r_${k}" value="${E(r[k])}" oninput="rp()" placeholder="${p}">`:`<textarea id="r_${k}" rows="4" oninput="rp()" placeholder="${p}">${E(r[k])}</textarea>`}`;setTimeout(rp,0);return ph('Resume builder','Fill in the form and watch your resume appear. Print it or save it as a PDF.')+`<div class="g2"><div class="card noprint">${f('name','Full name')}${f('head','Headline','input','e.g. Frontend developer')}${f('email','Email')}${f('phone','Phone')}${f('sum','Summary','t','Two lines about you')}${f('skills','Skills (comma separated)')}${f('exp','Experience (one achievement per line)','t')}${f('edu','Education (one per line)','t')}<p><button class="btn" onclick="print()">Print / Save as PDF</button></p></div><div><div class="res" id="rp"></div></div></div>`}

const SW=new Set('the and for with you your are our will have has from that this their they them who what when where which job role work team able also such more than into over about been being were was can may must should would could not but all any each other some very per via etc'.split(' '));
const kws=t=>{const c={};(t.toLowerCase().match(/[a-z][a-z+#.]{2,}/g)||[]).filter(w=>!SW.has(w)).forEach(w=>c[w]=(c[w]||0)+1);return Object.keys(c).sort((a,b)=>c[b]-c[a]).slice(0,20)};
function ats(){const o=live().map(j=>`<option value="${j.id}">${E(j.title)} · ${E(j.co)}</option>`).join('');return ph('ATS resume checker','Paste your resume and see how well keywords match.')+`<div class="g2"><div class="card"><label>Your resume text</label><textarea id="a_r" rows="12" placeholder="Paste resume text here"></textarea></div><div class="card"><label>Pick a HireHub job</label><select id="a_j"><option value="">— or paste description below —</option>${o}</select><label>Job description (optional)</label><textarea id="a_d" rows="7" placeholder="Paste description"></textarea><p><button class="btn" onclick="runATS()">Check my resume</button></p></div></div><div id="atsr"></div>`}
function runATS(){const r=$('#a_r').value,id=$('#a_j').value,d=$('#a_d').value,j=db.jobs.find(x=>x.id==id);let K=j?[...new Set([...j.skills.split(',').map(s=>s.trim().toLowerCase()),...kws(j.title+' '+j.desc)])]:kws(d);if(r.trim().length<30||!K.length)return toast('Add your resume and choose or paste a job');const lo=r.toLowerCase(),hit=K.filter(k=>lo.includes(k)),miss=K.filter(k=>!lo.includes(k)),sc=Math.round(hit.length/K.length*100),tips=[];if(!/\S+@\S+\.\S+/.test(r))tips.push('Add an email address.');if(!/\d/.test(r))tips.push('Add numbers (results, percentages, years) to demonstrate measurable impact.');if(r.split(/\s+/).length<150)tips.push('Your resume looks short. Add more detail on projects and technical outcomes.');if(miss.length)tips.push('Work the missing keywords in naturally, only where true for you.');$('#atsr').innerHTML=`<div class="card" style="margin-top:20px"><div class="row" style="gap:26px"><div class="ring n" style="background:conic-gradient(var(--sec) ${sc*3.6}deg,var(--s2) 0)"><span style="background:var(--s1);border-radius:50%;width:98px;height:98px;display:grid;place-items:center">${sc}%</span></div><div><h2>${sc>=70?'Strong match':sc>=40?'Decent match':'Needs work'}</h2><p class="muted">${hit.length} of ${K.length} keywords found.</p></div></div><h3 style="margin-top:18px">Matched</h3><div class="row">${hit.map(k=>`<span class="tag i">${E(k)}</span>`).join('')||'None yet'}</div><h3 style="margin-top:18px">Missing</h3><div class="row">${miss.map(k=>`<span class="tag r">${E(k)}</span>`).join('')||'Nothing missing'}</div><h3 style="margin-top:18px">Tips</h3><ul>${tips.map(t=>`<li>${t}</li>`).join('')||'<li>Looks great. Apply with confidence.</li>'}</ul></div>`}

function alerts(){const u=me();if(!u)return auth('login',new URLSearchParams());const N=db.notes.filter(n=>n.uid===u.id);setTimeout(()=>{if(N.some(n=>!n.read)){N.forEach(n=>n.read=1);save();nav()}},400);return ph('Alerts','Updates on your applications, followed companies, and listings.')+(N.length?`<div class="card">${N.map(n=>`<div class="row" style="padding:12px 0;border-bottom:1px solid var(--line);justify-content:space-between"><span>${n.read?'':'<span class="tag i">New</span> '}${E(n.t)}</span><span class="muted n" style="font-size:12px">${ago(n.at)}</span></div>`).join('')}</div>`:'<div class="card empty">No alerts yet.</div>')}
function profile(){const u=me();if(!u)return auth('login',new URLSearchParams());const F=[['name','Full name / company'],['phone','Phone'],['location','Location'],['headline','Headline'],['skills','Skills (comma separated)'],['link','Portfolio or LinkedIn link']],pc=Math.round(F.filter(f=>u[f[0]]).length/F.length*100);return ph('Your profile',`${u.role==='recruiter'?'Tell candidates who you are.':'Complete profiles get noticed by recruiters.'} Profile is ${pc}% complete.`)+`<form class="card f" style="max-width:600px;margin:0" onsubmit="event.preventDefault();saveProf(this)">${F.map(f=>`<label>${f[1]}</label><input name="${f[0]}" value="${E(u[f[0]])}" maxlength="120">`).join('')}<p><button class="btn">Save profile</button></p></form>`}
function saveProf(f){const u=me();[...f.elements].forEach(e=>{if(e.name)u[e.name]=e.value.trim()});if(!u.name)return toast('Name is required');save();toast('Profile saved');nav()}

const FQ=[['Is HireHub free for job seekers?','Yes. Searching, applying, saving jobs, following companies, and using the resume tools is 100% free.'],['How do I follow a company?','Click the "+ Follow" button on any company card or profile page. You will receive notifications whenever they post new jobs.'],['How does logo upload work?','Recruiters can upload their company logo via the "My Company" dashboard tab. PNG, JPG, SVG, and WebP are supported up to 2MB.'],['How does the ATS checker work?','It compares keyword density between your resume and a job description to highlight missing terminology.'],['Can I withdraw an application?','Yes, while its status is still Applied, directly from your dashboard.']];
const faq=()=>ph('Help & FAQ','Answers to common questions.')+FQ.map(q=>`<details class="q"><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('');
const about=()=>ph('About HireHub','Connecting talent with verified employers, from first internships to senior engineering roles.')+`<div class="grid">${[['Verified','Every listing is reviewed before going live.'],['Company Ecosystem','Deep culture insights and follow notifications.'],['Career Tools','Free resume builder and ATS checker.']].map(v=>`<div class="card"><div class="ico">✓</div><h3>${v[0]}</h3><p class="muted">${v[1]}</p></div>`).join('')}</div>`;
const contact=()=>ph('Contact us','Questions or feedback? Send us a message.')+`<form class="card f" style="margin:0;max-width:560px" onsubmit="event.preventDefault();sendMsg(this)"><label>Your name</label><input name="n" required maxlength="60"><label>Email</label><input name="e" type="email" required><label>Message</label><textarea name="m" rows="5" required maxlength="800"></textarea><p><button class="btn">Send message</button></p></form>`;
function sendMsg(f){db.msgs.unshift({id:nid(),n:f.n.value,e:f.e.value,m:f.m.value,at:Date.now()});save();f.reset();toast('Message sent. Thank you!')}
const PL=[['Starter','Free','1 active listing,Candidate list,Email alerts'],['Growth','₹2,999/mo','10 active listings,Candidate pipeline,Company branding'],['Scale','Contact us','Unlimited listings,Team seats,Priority support']];
const pricing=()=>ph('Plans for recruiters','Transparent plans for hiring teams.')+`<div class="grid">${PL.map((p,i)=>`<div class="card" ${i==1?'style="border-color:var(--amb)"':''}><h3>${p[0]}</h3><div class="n" style="font-size:32px">${p[1]}</div><ul>${p[2].split(',').map(x=>`<li>${x}</li>`).join('')}</ul><a class="btn" href="#/register?r=recruiter">Get started</a></div>`).join('')}</div>`;
const legal=t=>ph(t==='privacy'?'Privacy policy':'Terms of use','Legal and compliance standards.')+`<div class="card" style="max-width:760px"><p>We treat candidate and recruiter data with high standards of security and privacy.</p></div>`;

/* -------------------------------------------------------------
 * 9. Master Extra Router
 * ------------------------------------------------------------- */
function extra(p, q, s){
  const r = {
    '/companies': () => companies(q),
    '/compare-companies': () => compareCompanies(),
    '/salary': () => salary(q),
    '/resume': resume,
    '/ats': ats,
    '/blog': () => blog(),
    '/alerts': alerts,
    '/profile': profile,
    '/faq': faq,
    '/about': about,
    '/contact': contact,
    '/pricing': pricing,
    '/privacy': () => legal('privacy'),
    '/terms': () => legal('terms')
  };
  if(r[p]) return r[p]();
  if(s[1] === 'company') return company(decodeURIComponent(s[2] || ''));
  if(s[1] === 'blog') return blog(s[2]);
  return null;
}
