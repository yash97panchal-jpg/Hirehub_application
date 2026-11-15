db.chats=db.chats||[];const SIDX=['Applied','Shortlisted','Interview','Hired','Rejected'];
const _ap3=applicants;applicants=function(id){
  const h=_ap3(id),j=db.jobs.find(x=>x.id==id),u=me();
  if(!j||!u||(j.rid!==u.id&&u.role!=='admin'))return h;
  const A=db.apps.filter(a=>a.jobId===j.id);
  return h+`<h2 class="sec">Pipeline board</h2><p class="muted">Drag a candidate card to a new column to change their status.</p><div class="kan">${SIDX.map(s=>`<div class="kc" ondragover="event.preventDefault();this.classList.add('ov')" ondragleave="this.classList.remove('ov')" ondrop="dropS(event,'${s}')"><h4><span>${s}</span><span class="tag ${s==='Hired'?'m':s==='Rejected'?'r':'i'}">${A.filter(a=>a.status===s).length}</span></h4>${A.filter(a=>a.status===s).map(a=>{const c=db.users.find(x=>x.id===a.uid)||{name:'?'};return`<div class="kcard" draggable="true" ondragstart="event.dataTransfer.setData('text',${a.id})"><b>${E(c.name)}</b><br><a href="#/chat/${a.id}" class="muted" style="font-size:13px;display:inline-block;margin-top:4px">Message candidate →</a>${s==='Interview'?`<input type="datetime-local" value="${E(a.when||'')}" onchange="setWhen(${a.id},this.value)" style="margin-top:8px;padding:6px 8px;font-size:12px;border-radius:8px">`:''}</div>`}).join('')}</div>`).join('')}</div>`;
};
function dropS(e,s){
  e.preventDefault();
  const kc=e.currentTarget;
  if(kc)kc.classList.remove('ov');
  const id=+e.dataTransfer.getData('text'),a=db.apps.find(x=>x.id===id);
  if(a&&a.status!==s){
    setst(id,s);
    toast(`Candidate moved to ${s}`);
  }
}
function setWhen(id,v){
  const a=db.apps.find(x=>x.id===id);
  a.when=v;
  save();
  addNote(a.uid,'Interview scheduled: '+v.replace('T',' '));
  toast('Interview time saved');
}
const _s3=setst;setst=function(id,s){_s3(id,s);if(location.hash.startsWith('#/applicants'))render()};
function chat(id){
  const u=me();if(!u)return auth('login',new URLSearchParams());
  const a=db.apps.find(x=>x.id==id),j=a&&db.jobs.find(x=>x.id===a.jobId);
  if(!a||!j||!(a.uid===u.id||j.rid===u.id||u.role==='admin'))return'<div class="card empty">Conversation not found.</div>';
  const c=db.users.find(x=>x.id===a.uid)||{name:'Candidate'},M=db.chats.filter(m=>m.a===a.id);
  setTimeout(()=>{const b=$('.chat');if(b)b.scrollTop=1e9},50);
  return`<a href="#/dash" style="color:var(--sec);text-decoration:none;font-weight:600">← Back to dashboard</a>${ph('Messages',E(j.title)+' · '+E(j.co)+' · '+E(c.name))}<div class="card" style="max-width:720px"><div class="chat">${M.map(m=>`<div class="msg ${m.f===u.id?'me':''}"><small>${E((db.users.find(x=>x.id===m.f)||{}).name)} · ${ago(m.at)}</small>${E(m.t)}</div>`).join('')||'<p class="muted">No messages yet. Say hello!</p>'}</div><form class="row" style="margin-top:14px;flex-wrap:nowrap;gap:8px" onsubmit="event.preventDefault();sendChat(${a.id},this.t)"><input name="t" required maxlength="500" placeholder="Write a message…" autocomplete="off"><button class="btn">Send</button></form></div>`;
}
function sendChat(id,i){
  const u=me(),a=db.apps.find(x=>x.id===id),j=db.jobs.find(x=>x.id===a.jobId),t=i.value.trim();
  if(!t)return;
  db.chats.push({id:nid(),a:id,f:u.id,t,at:Date.now()});
  addNote(u.id===a.uid?j.rid:a.uid,`New message about ${j.title} from ${u.name}`);
  save();
  render();
}
function compare(){
  const J=LS.g('hhcmp',[]).map(i=>db.jobs.find(j=>j.id===i)).filter(Boolean);
  if(J.length<2)return ph('Compare jobs','Select the ⇄ Compare button on 2 or 3 job cards to see them side-by-side.')+'<div class="card empty"><a class="btn" href="#/jobs">Browse jobs</a></div>';
  const R=[['Company','co'],['Type','type'],['Mode','mode'],['Location','loc'],['Pay','pay'],['Skills','skills']];
  return ph('Compare jobs','Side by side comparison.')+`<div class="card" style="overflow-x:auto"><table><tr><th></th>${J.map(j=>`<th><a href="#/job/${j.id}" style="color:var(--h-ink);font-weight:700">${E(j.title)}</a> <button class="btn s x" onclick="cmpT(null,${j.id})" aria-label="Remove job from comparison">✕</button></th>`).join('')}</tr>${R.map(r=>`<tr><th>${r[0]}</th>${J.map(j=>`<td class="${r[1]==='pay'?'n':''}">${E(j[r[1]])}</td>`).join('')}</tr>`).join('')}</table></div>`;
}
function cmpT(e,id){
  if(e){e.preventDefault();e.stopPropagation()}
  let l=LS.g('hhcmp',[]);
  const adding = !l.includes(id);
  l=l.includes(id)?l.filter(x=>x!==id):[...l,id].slice(-3);
  LS.s('hhcmp',l);
  toast(adding?'Added to comparison':'Removed from comparison');
  render();
}
const _ex2=extra;extra=function(p,q,s){
  if(s[1]==='chat')return chat(s[2]);
  if(p==='/compare')return compare();
  return _ex2(p,q,s);
};

/* ---- command palette Ctrl+K ---- */
const PG=[['Find jobs','#/jobs'],['Internships','#/jobs?type=Internship'],['Remote jobs','#/jobs?mode=Remote'],['Companies','#/companies'],['Salary insights','#/salary'],['Resume builder','#/resume'],['ATS checker','#/ats'],['Career blog','#/blog'],['Compare jobs','#/compare'],['Dashboard','#/dash'],['Profile','#/profile'],['Alerts','#/alerts'],['Help & FAQ','#/faq'],['Contact','#/contact']];
let cs=0,cl=[];
function cmd(o){
  const c=$('#cmd');
  if(!c)return;
  c.classList.toggle('on',!!o);
  if(o){
    const inp=c.querySelector('input');
    inp.value='';
    cf();
    setTimeout(()=>inp.focus(),50);
  }
}
function cf(){
  const inp=$('#cmd input');if(!inp)return;
  const q=inp.value.toLowerCase(),all=[...PG.map(p=>[p[0],p[1],'Page']),...live().map(j=>[j.title+' · '+j.co,'#/job/'+j.id,j.type]),...[...new Set(live().map(j=>j.co))].map(c=>[c,'#/company/'+enc(c),'Company'])];
  cl=all.filter(x=>x[0].toLowerCase().includes(q)).slice(0,8);
  cs=0;
  cr();
}
function cr(){
  const el=$('#cmdl');if(!el)return;
  el.innerHTML=cl.map((x,i)=>{
    let prefix = '';
    if(x[2]==='Company'){
      const co = typeof getCompany==='function'?getCompany(x[0]):null;
      prefix = co && typeof renderCompanyLogo==='function'?renderCompanyLogo(co,24):'';
    }
    return `<a href="${x[1]}" class="${i===cs?'sel':''}" onclick="cmd(0)"><div class="row" style="gap:10px;align-items:center">${prefix}<span>${E(x[0])}</span></div><span class="tag i" style="font-size:11px">${x[2]}</span></a>`;
  }).join('')||'<div class="empty">No matching results</div>';
}
