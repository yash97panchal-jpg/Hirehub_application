const IC={
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  pin:'<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  bm:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  moon:'<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  check:'<path d="m5 12 5 5 9-10"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M17 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6"/>',
  chat:'<path d="M21 12a8 8 0 0 1-12 7l-5 1.5L5 16a8 8 0 1 1 16-4z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  code:'<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>',
  design:'<path d="M12 3l9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  data:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  mega:'<path d="M3 11v3a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M19 9a4 4 0 0 1 0 6"/>',
  trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  support:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 11 7.6-4M8.2 13l7.6 4"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'
};

const I=(n,s)=>`<svg class="i" viewBox="0 0 24 24" ${s?`style="width:${s}px;height:${s}px"`:''}>${IC[n]||''}</svg>`;
const AVC=['#1B263B','#25344D','#415A77','#17273A','#2D4159','#1F3147'];
const av=(n,s=40)=>{
  n=String(n||'?');
  let h=0;
  for(const c of n)h=(h*31+c.charCodeAt(0))%97;
  return`<span class="av" style="--s:${s}px;background:${AVC[h%AVC.length]}">${E(n[0].toUpperCase())}</span>`;
};

let hoverTimer=null;
window.coHoverPreview=function(e,id){
  clearTimeout(hoverTimer);
  hoverTimer=setTimeout(()=>{
    const c=typeof getCompany==='function'?getCompany(id):null;
    if(!c)return;
    let card=$('#coHoverCard');
    if(!card){
      document.body.insertAdjacentHTML('beforeend','<div id="coHoverCard" style="position:fixed;z-index:9999;background:var(--s1);border:1px solid var(--sec);border-radius:12px;padding:12px 16px;box-shadow:var(--sh);max-width:280px;pointer-events:none;transition:opacity .15s ease;opacity:0"></div>');
      card=$('#coHoverCard');
    }
    const roles=db.jobs.filter(j=>j.company_id===c.id&&j.st==='approved').length;
    card.innerHTML=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">${renderCompanyLogo(c,36)}<div><b style="font-size:15px;color:var(--h-ink)">${E(c.name)}</b><div class="muted" style="font-size:12px">${E(c.industry)}</div></div></div><div class="row sp" style="font-size:12px;margin-top:6px"><span class="tag i" style="font-size:11px">${roles} open role${roles===1?'':'s'}</span><span class="muted">${E(c.hq)}</span></div>`;
    const rect=e.target.getBoundingClientRect();
    card.style.top=`${Math.min(window.innerHeight-100,rect.bottom+8)}px`;
    card.style.left=`${Math.min(window.innerWidth-300,Math.max(10,rect.left))}px`;
    card.style.opacity='1';
  },220);
};
window.coHoverLeave=function(){
  clearTimeout(hoverTimer);
  const card=$('#coHoverCard');
  if(card)card.style.opacity='0';
};

const pn=s=>{
  const m=String(s).match(/[\d.]+/);
  if(!m)return 0;
  let v=+m[0];
  if(/k\s*\/\s*mo/i.test(s))v=v*12/100;
  return v;
};

const matchPct=(u,j)=>{
  if(!u||u.role!=='seeker'||!u.skills)return 0;
  const sk=u.skills.toLowerCase().split(',').map(x=>x.trim()).filter(Boolean),js=j.skills.toLowerCase().split(',').map(x=>x.trim());
  return Math.round(js.filter(s=>sk.some(m=>s.includes(m)||m.includes(s))).length/js.length*100);
};

const out0=out;
out=function(){out0();render()};

function tmode(){
  const d=document.documentElement;
  const cur=d.dataset.mode||'dark';
  const m=cur==='dark'?'light':'dark';
  d.dataset.mode=m;
  LS.s('hhmode',m);
  toast(`Switched to ${m} mode`);
  nav();
}

nav=function(){
  const u=me(),h=location.hash||'#/',on=x=>h.startsWith(x)?'on':'',dk=document.documentElement.dataset.mode!=='light',nc=u?db.notes.filter(n=>n.uid===u.id&&!n.read).length:0;
  $('#nav').innerHTML=`<div class="nb" id="nb"><a class="logo" href="#/"><span class="lg" role="img" aria-label="HireHub logo"><i></i><i></i></span><span>Hire<b>Hub</b></span></a><nav class="nl"><a class="${on('#/jobs')}" href="#/jobs">Find jobs</a><a href="#/jobs?type=Internship">Internships</a><a class="${on('#/compan')}" href="#/companies">Companies</a><a class="${on('#/salary')}" href="#/salary">Salaries</a><details class="dd"><summary>Resources ▾</summary><div><a href="#/resume">${I('file')}Resume builder</a><a href="#/ats">${I('check')}ATS checker</a><a href="#/blog">${I('brief')}Career blog</a><a href="#/faq">${I('chat')}Help &amp; FAQ</a></div></details><a href="#/pricing">For employers</a></nav><div class="nr"><button class="ib hide" onclick="cmd(1)" aria-label="Quick search (Ctrl+K)">${I('search')}</button><button class="ib" onclick="tmode()" aria-label="Toggle dark mode">${I(dk?'sun':'moon')}</button>${u?`<a class="ib" href="#/alerts" aria-label="Alerts">${I('bell')}${nc?`<em>${nc}</em>`:''}</a><details class="dd"><summary style="list-style:none;cursor:pointer" aria-label="Account menu">${av(u.name,36)}</summary><div style="left:auto;right:0"><a href="#/dash">${I('grid')}Dashboard</a><a href="#/profile">${I('user')}Profile</a><a href="#/alerts">${I('bell')}Alerts</a><a href="#/dash" id="lo" onclick="out();return false">${I('arrow')}Log out</a></div></details>`:`<a class="btn o s hide" href="#/login">Log in</a><a class="btn s" href="#/register">Sign up</a>`}<button class="ib menu" onclick="$('#nb').classList.toggle('open')" aria-label="Toggle navigation menu">${I('menu')}</button></div></div>`;
};

card=function(j){
  const u=me(),sv=u&&db.saved.some(s=>s.jobId===j.id&&s.uid===u.id),mt=matchPct(u,j);
  const c = j.company_id ? db.companies.find(x => x.id == j.company_id) : (typeof getCompany==='function'?getCompany(j.co):null);
  const logoHtml = c && typeof renderCompanyLogo==='function' ? renderCompanyLogo(c, 48) : av(j.co, 48);
  return`<a class="jrow card" href="#/job/${j.id}">${logoHtml}<div class="jb"><h3>${E(j.title)}</h3><div class="sub"><span>${E(j.co)}</span><span>·</span><span>${E(j.loc)}</span></div><div class="ch"><span class="tag ${j.type==='Internship'?'a':'i'}">${j.type}</span><span class="tag">${j.mode}</span><span class="tag">${E(j.exp||'Fresher')}</span>${mt?`<span class="tag m">${mt}% match</span>`:''}</div></div><div class="jr"><span class="n">${E(j.pay)}</span>${ago(j.at)}</div><button class="sv ${sv?'on':''}" onclick="svT(event,${j.id})" aria-label="Save job">${I('bm')}</button></a>`;
};

function svT(e,id){
  e.preventDefault();
  e.stopPropagation();
  const u=me();
  if(!u){toast('Log in to save jobs');return go('#/login')}
  if(u.role!=='seeker')return toast('Saving jobs is for job seekers');
  const btn=e.currentTarget;
  if(btn){
    btn.classList.add('pop');
    setTimeout(()=>btn.classList.remove('pop'),400);
  }
  const wasSaved=db.saved.some(s=>s.jobId===id&&s.uid===u.id);
  sav(id);
  toast(wasSaved?'Removed from saved jobs':'Job saved to your bookmarks!');
}

const mini=j=>{
  const c = j.company_id ? db.companies.find(x => x.id == j.company_id) : (typeof getCompany==='function'?getCompany(j.co):null);
  const logoHtml = c && typeof renderCompanyLogo==='function' ? renderCompanyLogo(c, 40) : av(j.co, 40);
  return `<a class="jrow" href="#/job/${j.id}">${logoHtml}<div class="jb"><h3 style="font-size:15px">${E(j.title)}</h3><div class="sub">${E(j.co)} · ${E(j.loc)}</div></div><span class="tag i n">${E(j.pay)}</span></a>`;
};

const CT=[['Technology','developer|engineer|devops|software|backend|frontend|full stack|qa','code'],['Design','design|figma|ux|ui ','design'],['Data & AI','data|analyst|machine|python|sql','data'],['Marketing','marketing|seo|content|writer|social','mega'],['Finance','finance|accounting|excel|tally','trend'],['People & HR','hr |recruit|talent','users'],['Support','customer|support|success','support'],['Operations','cloud|ops|aws|kubernetes|payments','cog']];

const FT={
  new:()=>live().slice().sort((a,b)=>b.at-a.at),
  int:()=>live().filter(j=>j.type==='Internship'),
  rem:()=>live().filter(j=>j.mode==='Remote'),
  fr:()=>live().filter(j=>j.exp==='Fresher')
};

function ftab(k,b){
  document.querySelectorAll('#fc .chip').forEach(c=>c.classList.toggle('on',c===b));
  const el=$('#ft');
  if(el){
    el.style.opacity='0.4';
    el.style.transform='translateY(4px)';
    setTimeout(()=>{
      el.innerHTML=FT[k]().slice(0,6).map(card).join('');
      el.style.opacity='1';
      el.style.transform='none';
    },120);
  }
}

home=function(){
  const L=live().slice().sort((a,b)=>b.at-a.at),C=[...new Set(L.map(j=>j.co))];
  return`<section class="hero"><div class="in hg"><div><span class="eyebrow"><i>New</i>${L.filter(j=>j.type==='Internship').length} internships open this week</span><h1>Find the job that <span>fits your skills.</span></h1><p class="lead">Search verified jobs and internships, check how well your resume matches, and apply in minutes. One place for your whole job search.</p>
<form class="sbox" onsubmit="event.preventDefault();go('#/jobs?q='+enc(this.q.value.trim())+'&loc='+enc(this.l.value.trim()))" role="search"><label>${I('search')}<input name="q" placeholder="Job title, skill or company" aria-label="Job title"></label><label>${I('pin')}<input name="l" placeholder="City or remote" aria-label="Location"></label><button class="btn">Search</button></form>
<div class="chips">Popular: ${['React','Data Analyst','Marketing','Remote'].map(t=>`<a class="chip" href="#/jobs?q=${enc(t)}">${t}</a>`).join('')}</div>
<div class="kp"><div><b class="n">${L.length}</b>open roles</div><div><b class="n">${C.length}</b>hiring companies</div><div><b class="n">${L.filter(j=>j.type==='Internship').length}</b>internships</div></div></div>
<div class="panel"><div class="ph"><span>Latest openings</span><a href="#/jobs" style="color:var(--sec);font-size:14px;text-decoration:none;font-weight:600">View all →</a></div>${L.slice(0,5).map(mini).join('')}</div></div></section>
<section class="in sec rv"><div class="sh"><div><h2>Browse by field</h2><p>Explore roles across the most active categories.</p></div></div><div class="grid g4" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${CT.map(c=>`<a class="card cat" href="#/jobs?q=${enc(c[1].split('|')[0].trim())}"><div class="ico">${I(c[2])}</div><b>${c[0]}</b><span class="muted" style="font-size:14px">${L.filter(j=>new RegExp(c[1],'i').test(j.title+' '+j.skills)).length} open roles</span></a>`).join('')}</div></section>
<section class="in sec rv"><div class="sh"><div><h2>Featured opportunities</h2><p>Hand-picked from the newest listings.</p></div><div class="chips" id="fc" style="margin:0"><button class="chip on" onclick="ftab('new',this)">Latest</button><button class="chip" onclick="ftab('int',this)">Internships</button><button class="chip" onclick="ftab('rem',this)">Remote</button><button class="chip" onclick="ftab('fr',this)">Fresher</button></div></div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(430px,1fr));transition:opacity .15s ease,transform .15s ease" id="ft">${FT.new().slice(0,6).map(card).join('')}</div><p style="text-align:center;margin-top:24px"><a class="btn o" href="#/jobs">Browse all jobs ${I('arrow')}</a></p></section>
<section class="in sec rv"><div class="sh"><div><h2>How HireHub works</h2><p>From search to offer in three simple steps.</p></div></div><div class="g3">${[['user','Create your profile','Sign up as a job seeker or recruiter and add your skills in a minute.'],['search','Search and apply','Filter by type, mode and experience, then apply with a short note.'],['check','Track every step','Follow each application from Applied to Hired and chat with recruiters.']].map((s,i)=>`<div class="card step"><div class="row sp"><div class="ico">${I(s[0])}</div><span class="n">Step ${i+1}</span></div><h3>${s[1]}</h3><p class="muted" style="margin:0">${s[2]}</p></div>`).join('')}</div></section>
<section class="in sec rv"><div class="sh"><div><h2>Free tools for your career</h2><p>Everything you need to get interview-ready.</p></div></div><div class="g3">${[['file','Resume builder','Create a clean, printable resume with a live preview.','#/resume'],['check','ATS checker','See which keywords your resume is missing for a job.','#/ats'],['trend','Salary insights','Check typical pay ranges before you negotiate.','#/salary']].map(t=>`<a class="card cat" href="${t[3]}"><div class="ico">${I(t[0])}</div><h3 style="margin:0">${t[1]}</h3><span class="muted">${t[2]}</span><b style="color:var(--sec)">Try it free →</b></a>`).join('')}</div></section>
<section class="in sec rv"><div class="sh"><div><h2>Top hiring companies</h2><p>Learn about the verified teams behind the openings.</p></div><a class="btn o s" href="#/companies">All companies</a></div>
<div class="co-marquee-wrap"><div class="co-marquee-track">${(db.companies||[]).concat(db.companies||[]).map(c=>{
  const lgo=typeof renderCompanyLogo==='function'?renderCompanyLogo(c,42):av(c.name,42);
  const openCount=live().filter(j=>j.company_id===c.id||j.co===c.name).length;
  return`<a class="co-marquee-tile" href="#/company/${enc(c.slug||c.name)}" aria-label="${E(c.name)}">${lgo}<div><b style="color:var(--h-ink);font-size:15px;display:block">${E(c.name)}</b><span class="muted" style="font-size:12px">${openCount} open role${openCount===1?'':'s'}</span></div></a>`;
}).join('')}</div></div>
<div class="grid" style="margin-top:20px">${C.slice(0,6).map(c=>{const co=typeof getCompany==='function'?getCompany(c):null,lgo=co&&typeof renderCompanyLogo==='function'?renderCompanyLogo(co,48):av(c,48),tagline=co?co.tagline:'Hiring company',cTarget=co?(co.slug||co.name):c;return`<a class="card jrow" href="#/company/${enc(cTarget)}" style="margin:0">${lgo}<div class="jb"><h3>${E(c)}</h3><div class="sub">${E(tagline)}</div></div><span class="tag i">${L.filter(j=>j.co===c).length} open</span></a>`}).join('')}</div></section>
<section class="in sec rv"><div class="band"><div><span class="tag a" style="margin-bottom:14px">For employers</span><h2>Hire people who fit, faster.</h2><ul style="padding:0;margin:18px 0 24px">${['Post jobs and internships in minutes','Every listing is reviewed before going live','Move candidates through a drag-and-drop pipeline','Message candidates directly'].map(x=>`<li>${I('check')}${x}</li>`).join('')}</ul><div class="row"><a class="btn" href="#/register?r=recruiter">Start hiring</a><a class="btn o" href="#/pricing">See plans</a></div></div><div class="g2">${[[L.length,'live listings'],[db.apps.length,'applications'],[C.length,'companies'],[db.users.filter(u=>u.role==='seeker').length,'job seekers']].map(s=>`<div class="card" style="background:rgba(244,214,176,0.06);border-color:var(--line);box-shadow:none"><b class="n" style="font-size:32px;color:var(--h-ink);display:block">${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div></div></section>
<section class="in sec rv"><div class="sh"><div><h2>From the career blog</h2><p>Guides to help you grow.</p></div><a class="btn o s" href="#/blog">All articles</a></div><div class="g3">${BL.slice(0,3).map(bcard).join('')}</div></section>`;
};

function fApply(more){
  const f=$('#ff');if(!f)return;
  const p=new URLSearchParams();
  if(f.q.value.trim())p.set('q',f.q.value.trim());
  if(f.loc.value.trim())p.set('loc',f.loc.value.trim());
  ['type','mode','exp'].forEach(k=>{
    const v=[...f.querySelectorAll(`[name=${k}]:checked`)].map(x=>x.value);
    if(v.length)p.set(k,v.join(','));
  });
  if(f.posted.value!=='0')p.set('posted',f.posted.value);
  if(f.sort.value!=='new')p.set('sort',f.sort.value);
  if(more)p.set('n',more);
  go('#/jobs?'+p);
}

jobs=function(q){
  const g=k=>q.get(k)||'',L=k=>g(k)?g(k).split(','):[],t=g('q'),l=g('loc'),ty=L('type'),md=L('mode'),ex=L('exp'),po=+g('posted')||0,so=g('sort')||'new',n=+g('n')||8;
  const R=live().filter(j=>(!t||(j.title+j.co+j.skills).toLowerCase().includes(t.toLowerCase()))&&(!l||(j.loc+' '+j.mode).toLowerCase().includes(l.toLowerCase()))&&(!ty.length||ty.includes(j.type))&&(!md.length||md.includes(j.mode))&&(!ex.length||ex.includes(j.exp))&&(!po||(Date.now()-j.at)/864e5<=po)).sort(so==='pay'?(a,b)=>pn(b.pay)-pn(a.pay):(a,b)=>b.at-a.at),act=t||l||ty.length||md.length||ex.length||po;
  const cb=(nm,arr,k,sel)=>arr.map(v=>`<label class="c"><input type="checkbox" name="${nm}" value="${v}" ${sel.includes(v)?'checked':''}> ${v}<span class="muted n" style="margin-left:auto;font-size:12px">${live().filter(j=>j[k]===v).length}</span></label>`).join('');
  return`<div class="ph"><h1>Find your next job</h1><p>Search ${live().length} verified jobs and internships.</p></div><form id="ff" class="jobs" onsubmit="event.preventDefault();fApply()" onchange="fApply()"><aside class="card fl"><h4>Keyword</h4><input name="q" value="${E(t)}" placeholder="Title, skill, company" aria-label="Filter by keyword"><h4>Location</h4><input name="loc" value="${E(l)}" placeholder="City or remote" aria-label="Filter by location"><h4>Job type</h4>${cb('type',['Full-time','Internship','Part-time','Contract'],'type',ty)}<h4>Work mode</h4>${cb('mode',['Remote','Hybrid','On-site'],'mode',md)}<h4>Experience</h4>${cb('exp',['Fresher','1–3 yrs','3+ yrs'],'exp',ex)}<h4>Date posted</h4><select name="posted" aria-label="Filter by date posted">${[['0','Any time'],['1','Last 24 hours'],['7','Last 7 days'],['30','Last 30 days']].map(x=>`<option value="${x[0]}" ${+x[0]===po?'selected':''}>${x[1]}</option>`).join('')}</select>${act?'<p style="margin:16px 0 0"><a class="btn o s" href="#/jobs" style="width:100%">Clear all filters</a></p>':''}</aside>
<div class="jl"><div class="row sp" style="margin-bottom:14px"><b><span class="n">${R.length}</span> job${R.length===1?'':'s'} found</b><label style="margin:0;display:flex;align-items:center;gap:8px">Sort by <select name="sort" style="width:auto" aria-label="Sort jobs"><option value="new" ${so==='new'?'selected':''}>Newest</option><option value="pay" ${so==='pay'?'selected':''}>Highest pay</option></select></label></div>${R.length?R.slice(0,n).map(card).join('')+(R.length>n?`<p style="text-align:center"><button type="button" class="btn o" onclick="fApply(${n+8})">Show more jobs</button></p>`:''):'<div class="card empty"><h3>No matching jobs</h3><p>Try removing a filter or searching a different keyword.</p><a class="btn" href="#/jobs">Clear filters</a></div>'}</div></form>`;
};

job=function(id){
  const j=db.jobs.find(x=>x.id==id),u=me();
  if(!j||(j.st!=='approved'&&!(u&&(u.role==='admin'||u.id===j.rid))))return'<div class="card empty">This job is not available.</div>';
  const ap=u&&db.apps.find(a=>a.jobId===j.id&&a.uid===u.id),sv=u&&db.saved.some(s=>s.jobId===j.id&&s.uid===u.id),mt=matchPct(u,j),co=j.company_id?db.companies.find(x=>x.id==j.company_id):(typeof getCompany==='function'?getCompany(j.co):null),lgo=co&&typeof renderCompanyLogo==='function'?renderCompanyLogo(co,64):av(j.co,64),cAbout=co?co.about:(CI[j.co]&&CI[j.co][3]||'Verified employer on HireHub.'),cTarget=co?(co.slug||co.name):j.co,cp=LS.g('hhcmp',[]),sim=live().filter(x=>x.id!==j.id&&(x.type===j.type||x.co===j.co)).slice(0,3);
  const act=!u?`<a class="btn lg" style="width:100%" href="#/login">Log in to apply</a>`:u.role==='seeker'?(ap?`<span class="tag m" style="font-size:14px;padding:8px 14px">${I('check',16)} Applied · ${ap.status}</span>`:`<button class="btn lg" style="width:100%" onclick="$('#af').hidden=false;this.hidden=true">Apply now</button><form id="af" hidden onsubmit="event.preventDefault();apply(${j.id},this.note.value)"><label>Short note to the recruiter</label><textarea name="note" rows="4" maxlength="600" required placeholder="Why are you a good fit?"></textarea><p><button class="btn" style="width:100%">Send application</button></p></form>`):'<p class="muted">Use a job seeker account to apply.</p>';
  return`<div class="row" style="font-size:14px;margin-bottom:16px"><a href="#/jobs" class="muted">Jobs</a><span class="muted">/</span><span>${E(j.title)}</span></div><div class="dt"><div><div class="card"><div class="row" style="gap:18px;align-items:flex-start;flex-wrap:nowrap">${lgo}<div><h1 style="margin:0 0 4px">${E(j.title)}</h1><div class="muted"><a href="#/company/${enc(cTarget)}" style="color:var(--sec);text-decoration:none"><b>${E(j.co)}</b></a> · ${E(j.loc)}</div><div class="row" style="margin-top:12px"><span class="tag ${j.type==='Internship'?'a':'i'}">${j.type}</span><span class="tag">${j.mode}</span><span class="tag">${E(j.exp||'Fresher')}</span>${j.st!=='approved'?'<span class="tag r">Pending review</span>':''}</div></div></div></div>
<div class="card" style="margin-top:18px"><h2 style="font-size:22px">About the role</h2><p>${E(j.desc)}</p><h3 style="margin-top:24px">Skills required</h3><div class="row">${j.skills.split(',').map(s=>`<span class="tag i">${E(s.trim())}</span>`).join('')}</div></div>
<div class="card" style="margin-top:18px"><h3>About ${E(j.co)}</h3><p class="muted" style="margin:0 0 14px">${E(cAbout)}</p><a class="btn o s" href="#/company/${enc(cTarget)}">View company profile</a></div></div>
<aside class="ap"><div class="card"><div class="n" style="font-size:28px;color:var(--h-ink)">${E(j.pay)}</div><div class="muted" style="margin-bottom:16px">${j.type==='Internship'?'Monthly stipend':'Yearly compensation'}</div>${mt?`<p><span class="tag m">${mt}% match with your skills</span></p>`:''}${act}<div class="row" style="margin-top:14px"><button class="btn o s" onclick="${u&&u.role==='seeker'?`sav(${j.id})`:`svT(event,${j.id})`}" aria-label="Save or bookmark job">${I('bm',15)} ${sv?'Saved':'Save'}</button><button class="btn o s" onclick="navigator.clipboard&&navigator.clipboard.writeText(location.href);toast('Link copied to clipboard')" aria-label="Share job">${I('share',15)} Share</button><button class="btn o s" onclick="cmpT(null,${j.id})" aria-label="Compare job">${cp.includes(j.id)?'Remove compare':'Compare'}</button></div>${cp.length>=2?'<p style="margin:10px 0 0"><a href="#/compare" style="color:var(--sec);font-weight:600">View comparison ('+cp.length+')</a></p>':''}<hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><dl class="ov"><div><dt>Posted</dt><dd>${ago(j.at)}</dd></div><div><dt>Job type</dt><dd>${j.type}</dd></div><div><dt>Work mode</dt><dd>${j.mode}</dd></div><div><dt>Experience</dt><dd>${E(j.exp||'Fresher')}</dd></div><div style="grid-column:1/-1"><dt>Location</dt><dd>${E(j.loc)}</dd></div></dl></div></aside></div>${sim.length?`<h2 class="sec">Similar jobs</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(430px,1fr))">${sim.map(card).join('')}</div>`:''}`;
};

function demo(r){
  const m={seeker:['seeker@hirehub.app','seeker123'],recruiter:['recruiter@hirehub.app','recruit123'],admin:['admin@hirehub.app','admin123']}[r],f=$('#app form');
  if(f){f.email.value=m[0];f.pw.value=m[1];f.querySelectorAll('.input-error').forEach(e=>e.classList.remove('input-error'))}
}

auth=function(mode,q){
  const reg=mode==='register',rr=q.get('r')==='recruiter';
  return`<div class="au"><div class="l"><span class="lg" style="width:52px;height:52px;margin-bottom:24px;--lg1:var(--lg1)"><i></i><i></i></span><h1>${reg?'Your next step starts here.':'Welcome back.'}</h1><p style="font-size:18px">${reg?'Join to apply for jobs and internships, or to hire great people.':'Log in to continue your search or manage your hiring.'}</p><ul style="padding:0;margin-top:20px">${['Verified jobs and internships','Track every application','Free resume builder and ATS checker'].map(x=>`<li>${I('check')}${x}</li>`).join('')}</ul></div><div class="r"><form id="authForm" onsubmit="event.preventDefault();submitAuth(this,'${reg?'reg':'log'}')"><h2>${reg?'Create your account':'Log in to HireHub'}</h2>${reg?`<div class="seg"><label><input type="radio" name="role" value="seeker" ${rr?'':'checked'}>Job seeker</label><label><input type="radio" name="role" value="recruiter" ${rr?'checked':''}>Recruiter</label></div><label>Full name / company</label><input name="name" required maxlength="60" autocomplete="name" placeholder="Your name or company">`:''}<label>Email</label><input name="email" type="email" required autocomplete="email" placeholder="you@domain.com"><label>Password</label><input name="pw" type="password" required minlength="6" autocomplete="${reg?'new-password':'current-password'}" placeholder="••••••••"><button class="btn lg" style="width:100%;margin-top:20px">${reg?'Create account':'Log in'}</button><p class="muted" style="text-align:center">${reg?'Already have an account? <a href="#/login" style="color:var(--sec);font-weight:600">Log in</a>':'New here? <a href="#/register" style="color:var(--sec);font-weight:600">Create an account</a>'}</p>${reg?'':`<div class="card" style="box-shadow:none;margin-top:16px;padding:14px"><div class="muted" style="font-size:13px;margin-bottom:8px">Try a demo account:</div><div class="row"><button type="button" class="chip" onclick="demo('seeker')">Job seeker</button><button type="button" class="chip" onclick="demo('recruiter')">Recruiter</button><button type="button" class="chip" onclick="demo('admin')">Admin</button></div></div>`}</form></div></div>`;
};

function submitAuth(f,fn){
  let valid=true;
  f.querySelectorAll('.input-error').forEach(e=>e.classList.remove('input-error'));
  f.querySelectorAll('.form-err-msg').forEach(e=>e.remove());
  const email=f.email;
  const pw=f.pw;
  if(!email.value.trim()||!email.value.includes('@')){
    email.classList.add('input-error');
    valid=false;
  }
  if(!pw.value||pw.value.length<6){
    pw.classList.add('input-error');
    valid=false;
  }
  if(!valid){
    f.classList.remove('shake');
    void f.offsetWidth;
    f.classList.add('shake');
    toast('Please check the required fields');
    return;
  }
  const btn=f.querySelector('button.btn');
  if(btn){
    btn.classList.add('is-loading');
    setTimeout(()=>{
      btn.classList.remove('is-loading');
      if(fn==='reg')reg(f);else log(f);
    },200);
  } else {
    if(fn==='reg')reg(f);else log(f);
  }
}

/* ---- dashboards ---- */
const kpi=(i,v,l)=>`<div class="card kpi"><div class="ico" style="margin:0">${I(i)}</div><div><b class="n">${v}</b><span>${l}</span></div></div>`,
DS={
  seeker:[['overview','Overview','grid'],['apps','Applications','brief'],['saved','Saved jobs','bm'],['following','Followed Companies','shield'],['#/alerts','Alerts','bell'],['#/profile','Profile','user'],['#/resume','Resume builder','file']],
  recruiter:[['overview','Overview','grid'],['listings','My listings','brief'],['company','My Company','brief'],['#/post','Post a job','plus'],['#/alerts','Alerts','bell'],['#/profile','Profile','user']],
  admin:[['overview','Overview','grid'],['approvals','Approvals','shield'],['users','Users','users'],['jobs','Live jobs','brief'],['messages','Messages','mail']]
};

const dsh=(u,t,b)=>`<div class="dsh"><aside class="side"><div class="who">${av(u.name,44)}<div><b>${E(u.name)}</b><span class="muted" style="font-size:13px;text-transform:capitalize">${u.role}</span></div></div><nav>${DS[u.role].map(x=>`<a class="${x[0]===t?'on':''}" href="${x[0][0]==='#'?x[0]:'#/dash?t='+x[0]}">${I(x[2])}${x[1]}</a>`).join('')}</nav></aside><section>${b}</section></div>`;

const cols=(a,mx)=>`<div class="col">${a.map(m=>`<div><span class="n">${m[1]}</span><i style="height:${Math.max(4,m[1]/mx*100)}%"></i><span>${E(String(m[0]).slice(0,11))}</span></div>`).join('')||'<span class="muted">No data yet</span>'}</div>`;

dash=function(q){
  const u=me();if(!u)return auth('login',q);
  const t=q.get('t')||'overview';
  return dsh(u,t,u.role==='admin'?adm(t):u.role==='recruiter'?rec(u,t):sek(u,t));
};

function sek(u,t){
  if(t==='following')return typeof seekerFollowingView==='function'?seekerFollowingView(u):'';
  const A=db.apps.filter(a=>a.uid===u.id),Sv=db.saved.filter(s=>s.uid===u.id).map(s=>db.jobs.find(j=>j.id===s.jobId)).filter(Boolean),jn=j=>db.jobs.find(x=>x.id===j);
  if(t==='apps')return`<div class="ph"><h1>Applications</h1><p>Track the status of every job you applied for.</p></div>${A.length?`<div class="card tw" style="padding:0"><table><tr><th>Role</th><th>Company</th><th>Status</th><th>Applied</th><th></th></tr>${A.map(a=>{const j=jn(a.jobId);return j?`<tr><td><a href="#/job/${j.id}"><b>${E(j.title)}</b></a></td><td>${E(j.co)}</td><td>${pill(a.status)}${a.when?`<br><span class="muted n" style="font-size:12px">${E(a.when.replace('T',' '))}</span>`:''}</td><td>${ago(a.at)}</td><td class="row"><a class="btn s o" href="#/chat/${a.id}">Chat</a>${a.status==='Applied'?`<button class="btn s x" onclick="wd(${a.id})">Withdraw</button>`:''}</td></tr>`:''}).join('')}</table></div>`:'<div class="card empty"><h3>No applications yet</h3><a class="btn" href="#/jobs">Find a job</a></div>'}`;
  if(t==='saved')return`<div class="ph"><h1>Saved jobs</h1><p>Roles you bookmarked to come back to.</p></div>${Sv.length?`<div class="grid" style="grid-template-columns:1fr">${Sv.map(card).join('')}</div>`:'<div class="card empty"><h3>Nothing saved yet</h3><a class="btn" href="#/jobs">Browse jobs</a></div>'}`;
  const C=SIDX.map(s=>A.filter(a=>a.status===s).length),T=A.length,cl=['var(--pri)','var(--sec)','var(--h-ink)','var(--ok)','var(--bad)'];
  let g='',ac=0;
  C.forEach((c,i)=>{if(c){g+=`${cl[i]} ${ac/T*360}deg ${(ac+c)/T*360}deg,`;ac+=c}});
  const F=['name','phone','location','headline','skills','link'],pc=Math.round(F.filter(f=>u[f]).length/F.length*100),done=new Set(A.map(a=>a.jobId)),rec=live().filter(j=>!done.has(j.id)).sort((a,b)=>matchPct(u,b)-matchPct(u,a)||b.at-a.at).slice(0,3);
  return`<div class="ph"><h1>Hi ${E(u.name.split(' ')[0])}, welcome back 👋</h1><p>Here is a snapshot of your job search.</p></div><div class="g4">${kpi('brief',T,'Applications')}${kpi('clock',C[1]+C[2],'In progress')}${kpi('check',C[3],'Offers')}${kpi('bm',Sv.length,'Saved jobs')}</div><div class="g2" style="margin-top:18px"><div class="card row" style="gap:22px;flex-wrap:nowrap"><div class="donut n" style="background:${T?`conic-gradient(${g.slice(0,-1)})`:'var(--s2)'}"><b>${T}</b></div><div><h3>Application funnel</h3>${SIDX.map((s,i)=>`<div class="muted" style="font-size:13px"><span style="color:${cl[i]}">●</span> ${s} <b class="n" style="color:var(--h-ink)">${C[i]}</b></div>`).join('')}</div></div><div class="card row" style="gap:22px;flex-wrap:nowrap"><div class="donut n" style="background:conic-gradient(var(--sec) ${pc*3.6}deg,var(--s2) 0)"><b>${pc}%</b></div><div><h3>Profile strength</h3><p class="muted" style="margin:0 0 10px;font-size:14px">Add skills to see a match % on every job.</p><a class="btn s" href="#/profile">Improve profile</a></div></div></div>
<div class="sh" style="margin-top:36px"><h2 style="font-size:22px">${u.skills?'Recommended for you':'Latest jobs'}</h2><a class="btn o s" href="#/jobs">Browse all</a></div><div class="grid" style="grid-template-columns:1fr">${rec.map(card).join('')}</div>`;
}

function rec(u,t){
  if(t==='company')return typeof recruiterCompanyView==='function'?recruiterCompanyView(u):'';
  const M=db.jobs.filter(j=>j.rid===u.id),AP=db.apps.filter(a=>M.some(j=>j.id===a.jobId));
  if(t==='listings')return`<div class="row sp ph"><div><h1>My listings</h1><p>Manage jobs and internships you posted.</p></div><a class="btn" href="#/post">${I('plus',16)} Post a job</a></div>${M.length?`<div class="card tw" style="padding:0"><table><tr><th>Role</th><th>Type</th><th>Status</th><th>Applicants</th><th></th></tr>${M.map(j=>`<tr><td><a href="#/job/${j.id}"><b>${E(j.title)}</b></a></td><td>${j.type}</td><td>${j.st==='approved'?'<span class="tag m">Live</span>':'<span class="tag a">Pending review</span>'}</td><td class="n">${db.apps.filter(a=>a.jobId===j.id).length}</td><td class="row"><a class="btn s" href="#/applicants/${j.id}">Applicants</a><button class="btn s x" onclick="del(${j.id})">Delete</button></td></tr>`).join('')}</table></div>`:'<div class="card empty"><h3>No listings yet</h3><a class="btn" href="#/post">Post your first job</a></div>'}`;
  const ch=M.slice(0,7).map(j=>[j.title,db.apps.filter(a=>a.jobId===j.id).length]);
  return`<div class="row sp ph"><div><h1>Recruiter dashboard</h1><p>Your hiring activity at a glance.</p></div><a class="btn" href="#/post">${I('plus',16)} Post a job</a></div><div class="g4">${kpi('brief',M.length,'Total listings')}${kpi('check',M.filter(j=>j.st==='approved').length,'Live')}${kpi('clock',M.filter(j=>j.st==='pending').length,'Pending review')}${kpi('users',AP.length,'Applicants')}</div><div class="card" style="margin-top:18px"><h3>Applicants per listing</h3>${cols(ch,Math.max(1,...ch.map(x=>x[1])))}</div><div class="sh" style="margin-top:36px"><h2 style="font-size:22px">Recent applicants</h2></div>${AP.length?`<div class="card tw" style="padding:0"><table><tr><th>Candidate</th><th>Role</th><th>Status</th><th>Applied</th><th></th></tr>${AP.slice(-6).reverse().map(a=>{const c=db.users.find(x=>x.id===a.uid)||{name:'?'},j=db.jobs.find(x=>x.id===a.jobId);return`<tr><td class="row" style="flex-wrap:nowrap">${av(c.name,32)}<b>${E(c.name)}</b></td><td>${E(j.title)}</td><td>${pill(a.status)}</td><td>${ago(a.at)}</td><td><a class="btn s o" href="#/applicants/${j.id}">Review</a></td></tr>`}).join('')}</table></div>`:'<div class="card empty">No applicants yet. Candidates will appear here.</div>'}`;
}

function adm(t){
  const P=db.jobs.filter(j=>j.st==='pending'),tb=(h,r)=>`<div class="card tw" style="padding:0"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${r||`<tr><td colspan="${h.length}" class="empty">Nothing here.</td></tr>`}</table></div>`,hd=(a,b)=>`<div class="ph"><h1>${a}</h1><p>${b}</p></div>`;
  if(t==='approvals')return hd('Approvals','Review new listings before they go live.')+tb(['Role','Company','Type',''],P.map(j=>`<tr><td><a href="#/job/${j.id}"><b>${E(j.title)}</b></a></td><td>${E(j.co)}</td><td>${j.type}</td><td class="row"><button class="btn s" onclick="ap(${j.id},1)">Approve</button><button class="btn s x" onclick="ap(${j.id},0)">Reject</button></td></tr>`).join(''));
  if(t==='users')return hd('Users','Manage accounts on the platform.')+tb(['Name','Email','Role',''],db.users.map(x=>`<tr><td class="row" style="flex-wrap:nowrap">${av(x.name,32)}${E(x.name)}</td><td>${E(x.email)}</td><td><span class="tag">${x.role}</span></td><td>${x.role==='admin'?'':`<button class="btn s ${x.blocked?'':'x'}" onclick="blk(${x.id})">${x.blocked?'Unblock':'Block'}</button>`}</td></tr>`).join(''));
  if(t==='jobs')return hd('Live jobs','Remove listings that break the rules.')+tb(['Role','Company','Type',''],live().map(j=>`<tr><td>${E(j.title)}</td><td>${E(j.co)}</td><td>${j.type}</td><td><button class="btn s x" onclick="del(${j.id})">Remove</button></td></tr>`).join(''));
  if(t==='messages')return hd('Messages','Questions sent through the Contact page.')+tb(['From','Email','Message','When'],db.msgs.map(m=>`<tr><td>${E(m.n)}</td><td>${E(m.e)}</td><td>${E(m.m)}</td><td>${ago(m.at)}</td></tr>`).join(''));
  const R=['seeker','recruiter','admin'].map(r=>[r,db.users.filter(u=>u.role===r).length]),TY=['Full-time','Internship','Part-time','Contract'].map(x=>[x,db.jobs.filter(j=>j.type===x).length]),mx=Math.max(1,...R.map(x=>x[1]),...TY.map(x=>x[1]));
  return hd('Admin console','Platform overview.')+`<div class="g4">${kpi('users',db.users.length,'Users')}${kpi('brief',db.jobs.length,'Jobs')}${kpi('clock',P.length,'Awaiting approval')}${kpi('file',db.apps.length,'Applications')}</div><div class="g2" style="margin-top:18px"><div class="card"><h3>Users by role</h3>${cols(R,mx)}</div><div class="card"><h3>Jobs by type</h3>${cols(TY,mx)}</div></div>${P.length?`<div class="card row sp" style="margin-top:18px;border-color:var(--amb)"><span><b>${P.length}</b> listing${P.length>1?'s':''} waiting for review</span><a class="btn s" href="#/dash?t=approvals">Review now</a></div>`:''}`;
}

/* ---- shell & dynamic animations ---- */
let lastH=null;
const _r4=render;

function initCountUps(){
  const els=document.querySelectorAll('.stat .n, .kp b.n, .kpi b.n');
  const io=new IntersectionObserver((entries,observer)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el=entry.target;
        observer.unobserve(el);
        const text=el.textContent.trim();
        const match=text.match(/^([^\d]*)([\d,.]+)(.*)$/);
        if(match){
          const prefix=match[1];
          const rawNum=parseFloat(match[2].replace(/,/g,''));
          const suffix=match[3];
          const isDecimal=match[2].includes('.');
          const duration=750;
          const startTime=performance.now();
          function step(now){
            const progress=Math.min((now-startTime)/duration,1);
            const ease=1-Math.pow(1-progress,3);
            const current=rawNum*ease;
            el.textContent=prefix+(isDecimal?current.toFixed(1):Math.round(current))+suffix;
            if(progress<1){
              requestAnimationFrame(step);
            }else{
              el.textContent=text;
            }
          }
          requestAnimationFrame(step);
        }
      }
    });
  },{threshold:0.1});
  els.forEach(el=>io.observe(el));
}

function enhance(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('vis');
      io.unobserve(e.target);
      setTimeout(()=>e.target.classList.remove('rv','vis'),600);
    }
  }),{threshold:.08});
  document.querySelectorAll('#app .rv').forEach(el=>io.observe(el));
  initCountUps();
}

render=function(){
  const y=scrollY,same=lastH===location.hash;
  lastH=location.hash;
  const pg=$('#pg');
  if(pg)pg.style.width='65%';
  _r4();
  const f=$('#app').firstElementChild;
  $('#app').className='wrap'+(f&&(f.classList.contains('au')||f.classList.contains('hero'))?' fl':'');
  const h1=$('#app h1');
  document.title=(h1&&!f.classList.contains('hero')?h1.textContent+' · ':'')+'HireHub — Jobs & internships that fit';
  enhance();
  if(pg){
    pg.style.width='100%';
    setTimeout(()=>{
      pg.style.opacity=0;
      setTimeout(()=>{pg.style.width='0';pg.style.opacity=1},300);
    },220);
  }
  if(same)scrollTo(0,y);
};

document.body.insertAdjacentHTML('beforeend','<div id="pg"></div><button id="top" aria-label="Back to top" onclick="scrollTo({top:0,behavior:\'smooth\'})">↑</button><div id="cmd" onclick="if(event.target===this)cmd(0)"><div><input placeholder="Search jobs, companies, pages… (Ctrl+K)" oninput="cf()" aria-label="Quick search"><div id="cmdl"></div></div></div>');

addEventListener('scroll',()=>{
  const top=$('#nav');
  if(top)top.classList.toggle('shrunk',scrollY>20);
  const btn=$('#top');
  if(btn)btn.classList.toggle('on',scrollY>400);
},{passive:true});

addEventListener('keydown',e=>{
  const cmdEl=$('#cmd');
  if(!cmdEl)return;
  const o=cmdEl.classList.contains('on');
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();
    cmd(!o);
  }else if(o){
    if(e.key==='Escape')cmd(0);
    else if(e.key==='ArrowDown'){
      e.preventDefault();
      cs=Math.min(cl.length-1,cs+1);
      cr();
    }else if(e.key==='ArrowUp'){
      e.preventDefault();
      cs=Math.max(0,cs-1);
      cr();
    }else if(e.key==='Enter'&&cl[cs]){
      go(cl[cs][1]);
      cmd(0);
    }
  }
});

document.addEventListener('click',e=>{
  document.querySelectorAll('.nb details[open]').forEach(d=>{
    if(!d.contains(e.target))d.open=false;
  });
});

render();
