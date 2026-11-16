import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, Briefcase, ExternalLink, ShieldCheck, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { demoCompanies, type Company } from '../lib/data';

export default function Companies() {
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const industries = useMemo(() => {
    const list = Array.from(new Set(demoCompanies.map(c => c.industry)));
    return ['All', ...list];
  }, []);

  const filteredCompanies = useMemo(() => {
    return demoCompanies.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.about.toLowerCase().includes(search.toLowerCase());
      const matchIndustry = industryFilter === 'All' || c.industry === industryFilter;
      return matchSearch && matchIndustry;
    });
  }, [search, industryFilter]);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" /> VERIFIED EMPLOYERS
        </div>
        <h1>
          Discover companies that <em>hire right.</em>
        </h1>
        <p>
          Explore verified studios, high-growth startups, and tech teams with transparent cultures, real benefits, and active openings.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="workspace-card" style={{ marginBottom: '28px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px', background: 'var(--paper)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <Search size={18} color="var(--muted)" />
            <input
              type="text"
              placeholder="Search companies by name, location, or tech…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', color: 'var(--ink)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {industries.map(ind => (
              <button
                key={ind}
                onClick={() => setIndustryFilter(ind)}
                className={`btn small-btn ${industryFilter === ind ? 'btn-dark' : 'btn-outline'}`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="listing-grid">
        {filteredCompanies.map(company => (
          <div key={company.id} className="workspace-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'var(--navy)',
                      color: 'var(--gold-light)',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '18px',
                      boxShadow: '0 4px 12px rgba(16,27,45,0.15)',
                    }}
                  >
                    {company.name.slice(0, 1)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{company.name}</h3>
                      {company.verified && (
                        <span title="Verified Employer" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <ShieldCheck size={16} color="var(--green)" />
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>{company.industry}</span>
                  </div>
                </div>
                <span className="status shortlist" style={{ fontSize: '11px', padding: '4px 9px' }}>
                  {company.openRoles} active {company.openRoles === 1 ? 'role' : 'roles'}
                </span>
              </div>

              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#4a5568', margin: '0 0 16px' }}>
                {company.about}
              </p>

              <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {company.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> {company.size}
                </span>
              </div>

              {/* Culture snippet */}
              <div style={{ background: 'var(--paper)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--gold)', fontSize: '12px', color: 'var(--ink)', marginBottom: '16px' }}>
                <Sparkles size={13} style={{ display: 'inline', marginRight: '6px', color: 'var(--gold)' }} />
                {company.cultureHighlight}
              </div>

              {/* Tech Stack Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {company.techStack.map(tech => (
                  <span key={tech} style={{ background: 'rgba(197,161,91,0.12)', color: 'var(--navy)', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <Link to={`/jobs?company=${encodeURIComponent(company.name)}`} className="btn btn-dark small-btn" style={{ flex: 1 }}>
                <Briefcase size={14} /> View Openings
              </Link>
              <button onClick={() => setSelectedCompany(company)} className="btn btn-outline small-btn" style={{ padding: '8px 14px' }}>
                Company Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="workspace-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Building2 size={36} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No companies found</h3>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Try adjusting your search keyword or selected industry filter.</p>
          <button onClick={() => { setSearch(''); setIndustryFilter('All'); }} className="btn btn-dark small-btn" style={{ marginTop: '12px' }}>
            Reset Filters
          </button>
        </div>
      )}

      {/* Company Modal Drawer */}
      {selectedCompany && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16,27,45,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="workspace-card"
            style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--navy)', color: 'var(--gold-light)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '20px' }}>
                  {selectedCompany.name.slice(0, 1)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px' }}>{selectedCompany.name}</h2>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{selectedCompany.industry} · {selectedCompany.location}</span>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedCompany(null)} style={{ fontSize: '18px' }}>✕</button>
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--ink)', marginBottom: '20px' }}>
              {selectedCompany.about}
            </p>

            <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--navy)' }}>Key Benefits & Perks</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {selectedCompany.perks.map(perk => (
                <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ink)' }}>
                  <CheckCircle2 size={15} color="var(--green)" /> {perk}
                </div>
              ))}
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--navy)' }}>Primary Tech Stack</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {selectedCompany.techStack.map(t => (
                <span key={t} style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline small-btn">
                Visit Website <ExternalLink size={14} />
              </a>
              <Link to={`/jobs?company=${encodeURIComponent(selectedCompany.name)}`} onClick={() => setSelectedCompany(null)} className="btn btn-dark small-btn">
                Browse {selectedCompany.openRoles} Openings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
