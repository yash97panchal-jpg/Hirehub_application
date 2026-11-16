import { useState } from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function Legal() {
  const [tab, setTab] = useState<'privacy' | 'terms'>('privacy');

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" /> TRUST & TRANSPARENCY
        </div>
        <h1>
          Privacy Policy & <em>Terms.</em>
        </h1>
        <p>
          We take candidate data privacy, fair hiring practices, and transparency seriously. Here is exactly how your data is handled.
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <button
          onClick={() => setTab('privacy')}
          className={`btn ${tab === 'privacy' ? 'btn-dark' : 'btn-outline'}`}
        >
          <Shield size={16} /> Privacy Policy
        </button>
        <button
          onClick={() => setTab('terms')}
          className={`btn ${tab === 'terms' ? 'btn-dark' : 'btn-outline'}`}
        >
          <FileText size={16} /> Terms of Service
        </button>
      </div>

      <div className="workspace-card" style={{ padding: '36px', fontSize: '14px', lineHeight: '1.8', color: '#2d3748' }}>
        {tab === 'privacy' ? (
          <div>
            <h2 style={{ fontSize: '22px', color: 'var(--navy)', marginBottom: '16px' }}>HireHub Privacy Policy</h2>
            <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '24px' }}>Last updated: November 16, 2026</p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginTop: '24px', marginBottom: '8px' }}>1. What Data We Collect</h3>
            <p>
              We collect information provided directly by you when creating an account, including your full name, email address, role designation (Job Seeker or Recruiter), professional headlines, skills, and any resume documents you voluntarily upload during job applications.
            </p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginTop: '24px', marginBottom: '8px' }}>2. How Your Resume & Application Data Is Protected</h3>
            <p>
              Your uploaded resumes are stored in encrypted private cloud storage buckets protected by database-enforced Row Level Security (RLS). Resumes are strictly accessible only by the verified recruiter or hiring administrator of listings to which you explicitly submit an application. We do not index resumes publicly on search engines and we never sell candidate information to third-party ad networks.
            </p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginTop: '24px', marginBottom: '8px' }}>3. Real-Time Tracking & Application Transparency</h3>
            <p>
              When applying for a role, we maintain status audit timestamps (Applied, Under Review, Shortlisted, Interview Scheduled, Closed) so candidates have visibility into their pipeline progress.
            </p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginTop: '24px', marginBottom: '8px' }}>4. Your Right to Permanent Account Deletion</h3>
            <p>
              You maintain full ownership of your data. At any time, you may request permanent deletion of your profile, application records, and uploaded files through your profile settings or by contacting privacy@hirehub.app. Deletions are processed within 48 hours.
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '22px', color: 'var(--navy)', marginBottom: '16px' }}>HireHub Terms of Service</h2>
            <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '24px' }}>Last updated: November 16, 2026</p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginTop: '24px', marginBottom: '8px' }}>1. Acceptance of Terms</h3>
            <p>
              By accessing or using the HireHub platform, you agree to comply with and be bound by these Terms. If you do not agree, you must discontinue using our services.
            </p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginTop: '24px', marginBottom: '8px' }}>2. Zero-Fee Candidate Guarantee</h3>
            <p>
              HireHub is strictly free for job seekers. Employers and recruiters are explicitly forbidden from charging application fees, assessment charges, or onboarding deposits. Any violation results in immediate employer account termination and reporting to regulatory bodies.
            </p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginTop: '24px', marginBottom: '8px' }}>3. Employer Verification Standards</h3>
            <p>
              Recruiters agree to post only legitimate, active openings with truthful salary ranges or stipends. HireHub reserves the right to unpublish listings and revoke recruiter access if compensation disclosures are misleading or fraudulent.
            </p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginTop: '24px', marginBottom: '8px' }}>4. Community Standards</h3>
            <p>
              Users agree to maintain professional conduct across all platform messaging, interview scheduling, and feedback exchanges. Discriminatory language, spam, or harassment will result in permanent platform ban.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
