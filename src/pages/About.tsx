import { Link } from 'react-router-dom';
import { Briefcase, ShieldCheck, HeartHandshake, Eye, Sparkles, ArrowRight, CheckCircle2, Users, Building2, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" /> ABOUT HIREHUB
        </div>
        <h1>
          Building a more <em>human way to work.</em>
        </h1>
        <p>
          HireHub was created out of frustration with outdated job boards full of ghost jobs, hidden salaries, and automated rejection black holes. We believe hiring should be transparent, respectful, and direct.
        </p>
      </div>

      {/* Numbers Grid */}
      <div className="stat-grid" style={{ marginBottom: '48px' }}>
        <div className="stat-card">
          <Briefcase size={20} color="var(--navy)" />
          <strong>15,000+</strong>
          <span>Verified Applications Sent</span>
        </div>
        <div className="stat-card">
          <Building2 size={20} color="var(--navy)" />
          <strong>450+</strong>
          <span>Vetted Tech Employers</span>
        </div>
        <div className="stat-card">
          <Award size={20} color="var(--navy)" />
          <strong>98%</strong>
          <span>Candidate Satisfaction</span>
        </div>
        <div className="stat-card">
          <ShieldCheck size={20} color="var(--green)" />
          <strong>100%</strong>
          <span>Free for Candidates Always</span>
        </div>
      </div>

      {/* Core Principles */}
      <div style={{ marginBottom: '56px' }}>
        <div className="section-heading" style={{ marginBottom: '28px' }}>
          <div>
            <div className="eyebrow dark-eyebrow">OUR COMMITMENT</div>
            <h2 style={{ fontSize: '32px', margin: '8px 0 0' }}>The four tenets we stand by.</h2>
          </div>
        </div>

        <div className="listing-grid">
          <div className="workspace-card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--paper)', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
              <Eye size={22} color="var(--navy)" />
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 10px', color: 'var(--navy)' }}>Salary Transparency First</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#4a5568', margin: 0 }}>
              Every job listing on HireHub must disclose an honest compensation range or fixed stipend. No bait-and-switch offers, and no hidden salary negotiations.
            </p>
          </div>

          <div className="workspace-card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--paper)', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
              <HeartHandshake size={22} color="var(--navy)" />
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 10px', color: 'var(--navy)' }}>Zero-Ghosting Policy</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#4a5568', margin: 0 }}>
              We hold hiring teams accountable. Our application pipeline enforces automated progress timestamps so candidates never wonder if their resume fell into a void.
            </p>
          </div>

          <div className="workspace-card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--paper)', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={22} color="var(--green)" />
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 10px', color: 'var(--navy)' }}>Vetted Employers Only</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#4a5568', margin: 0 }}>
              Every employer account is verified before job postings go live. We strictly prohibit fake consultancies, multi-level marketing schemes, or requests for fees.
            </p>
          </div>

          <div className="workspace-card" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--paper)', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
              <Users size={22} color="var(--navy)" />
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 10px', color: 'var(--navy)' }}>Direct Recruiter Channels</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#4a5568', margin: 0 }}>
              Candidates connect directly with internal hiring leads, engineering managers, and founders rather than unmonitored external black-box portals.
            </p>
          </div>
        </div>
      </div>

      {/* Join the Movement Callout */}
      <div className="workspace-card" style={{ padding: '40px', background: 'var(--navy)', color: 'white', borderRadius: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>JOIN THE COMMUNITY</div>
            <h2 style={{ fontSize: '32px', color: 'white', margin: '12px 0 14px' }}>
              Ready to find work that <em>truly fits?</em>
            </h2>
            <p style={{ color: '#c0c9d1', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
              Whether you are looking for your first engineering internship or hiring your tenth senior developer, HireHub is built for your next chapter.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
            <Link to="/jobs" className="btn btn-gold">
              Explore Openings <ArrowRight size={15} />
            </Link>
            <Link to="/post-job" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Post a Role
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
