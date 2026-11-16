import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, Award, MapPin, Briefcase, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { salaryBenchmarks, type SalaryBenchmark } from '../lib/data';

export default function SalaryInsights() {
  const [selectedRole, setSelectedRole] = useState(salaryBenchmarks[0].role);
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | 'mid' | 'senior' | 'lead'>('mid');

  const benchmark = useMemo(() => {
    return salaryBenchmarks.find(b => b.role === selectedRole) || salaryBenchmarks[0];
  }, [selectedRole]);

  const currentPay = benchmark.experience[experienceLevel];

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" /> TRANSPARENT COMPENSATION
        </div>
        <h1>
          Know your market worth with <em>verified insights.</em>
        </h1>
        <p>
          Real salary benchmarks aggregated from verified offer letters, employer listings, and recruiter submissions across India and remote roles.
        </p>
      </div>

      {/* Interactive Calculator Section */}
      <div className="workspace-card" style={{ padding: '32px', marginBottom: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '8px' }}>STEP 1 · SELECT ROLE</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {salaryBenchmarks.map(b => (
                <button
                  key={b.role}
                  onClick={() => setSelectedRole(b.role)}
                  className={`btn small-btn ${selectedRole === b.role ? 'btn-dark' : 'btn-outline'}`}
                >
                  {b.role}
                </button>
              ))}
            </div>

            <span className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '8px' }}>STEP 2 · EXPERIENCE BRACKET</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { key: 'fresher', label: 'Fresher', sub: '0–1 yr' },
                { key: 'mid', label: 'Mid-Level', sub: '1–3 yrs' },
                { key: 'senior', label: 'Senior', sub: '3–5 yrs' },
                { key: 'lead', label: 'Lead / Staff', sub: '5+ yrs' },
              ].map(tier => (
                <button
                  key={tier.key}
                  onClick={() => setExperienceLevel(tier.key as any)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: '1px solid ' + (experienceLevel === tier.key ? 'var(--navy)' : 'var(--line)'),
                    background: experienceLevel === tier.key ? 'var(--navy)' : 'var(--white)',
                    color: experienceLevel === tier.key ? 'white' : 'var(--ink)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700 }}>{tier.label}</div>
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>{tier.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Output Card */}
          <div style={{ background: 'var(--paper)', borderRadius: '14px', border: '1px solid var(--line)', padding: '28px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Estimated Median Annual CTC
            </span>
            <div style={{ fontSize: '46px', fontWeight: 800, color: 'var(--navy)', fontFamily: 'Manrope, sans-serif', margin: '10px 0 16px' }}>
              {currentPay}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              <span className="status shortlist" style={{ fontSize: '11px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={13} color="#E87438" />
                {benchmark.demand} Demand
              </span>
              {benchmark.remoteFriendly && (
                <span className="status review" style={{ fontSize: '11px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="#0284C7" />
                  Remote Friendly
                </span>
              )}
            </div>

            {/* Compensation breakdown mock */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', textAlign: 'left', fontSize: '12px', color: 'var(--ink)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Fixed Base Component:</span>
                <b>80%–85%</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Performance Variable / Bonus:</span>
                <b>10%–15%</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Health, Equipment & Stipends:</span>
                <b>Included</b>
              </div>
            </div>

            <Link
              to={`/jobs?keyword=${encodeURIComponent(benchmark.role.split(' ')[0])}`}
              className="btn btn-dark full"
              style={{ marginTop: '20px' }}
            >
              Browse Matching Openings <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* In demand skills */}
        <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            High-Leverage Skills for {benchmark.role} (Commands Top 10% Bracket)
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {benchmark.topSkills.map(sk => (
              <span key={sk} style={{ background: 'rgba(197,161,91,0.15)', color: 'var(--navy)', fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '6px' }}>
                <Sparkles size={12} style={{ display: 'inline', marginRight: '5px', color: 'var(--gold)' }} />
                {sk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full Benchmark Table */}
      <div className="workspace-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>Comprehensive Tech Compensation Table (India & Remote)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--navy)' }}>
              <th style={{ padding: '12px 14px' }}>Role</th>
              <th style={{ padding: '12px 14px' }}>Category</th>
              <th style={{ padding: '12px 14px' }}>Fresher (0–1y)</th>
              <th style={{ padding: '12px 14px' }}>Mid-Level (1–3y)</th>
              <th style={{ padding: '12px 14px' }}>Senior (3–5y)</th>
              <th style={{ padding: '12px 14px' }}>Lead (5+y)</th>
              <th style={{ padding: '12px 14px' }}>Demand</th>
            </tr>
          </thead>
          <tbody>
            {salaryBenchmarks.map((b, idx) => (
              <tr key={b.role} style={{ borderBottom: '1px solid var(--line)', background: idx % 2 === 0 ? 'var(--white)' : 'var(--paper)' }}>
                <td style={{ padding: '14px', fontWeight: 700, color: 'var(--navy)' }}>{b.role}</td>
                <td style={{ padding: '14px', color: 'var(--muted)' }}>{b.category}</td>
                <td style={{ padding: '14px', fontWeight: 600 }}>{b.experience.fresher}</td>
                <td style={{ padding: '14px', fontWeight: 600 }}>{b.experience.mid}</td>
                <td style={{ padding: '14px', fontWeight: 600, color: 'var(--navy)' }}>{b.experience.senior}</td>
                <td style={{ padding: '14px', fontWeight: 700, color: 'var(--gold)' }}>{b.experience.lead}</td>
                <td style={{ padding: '14px' }}>
                  <span className={`status ${b.demand === 'Very High' ? 'shortlist' : 'applied'}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
                    {b.demand}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
