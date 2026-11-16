import { useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Candidate Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && message.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" /> GET IN TOUCH
        </div>
        <h1>
          We are here to <em>help.</em>
        </h1>
        <p>
          Have a question about a job listing, need employer verification assistance, or want to suggest an improvement? Send us a note.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Contact Form */}
        <div className="workspace-card" style={{ padding: '32px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '36px 12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(49,118,92,0.12)', color: 'var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: '24px', color: 'var(--navy)', margin: '0 0 10px' }}>Message Received</h2>
              <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto 24px' }}>
                Thank you for reaching out, <b>{name}</b>. A member of our support team has received your ticket and will reply to <b>{email}</b> within 2–4 business hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="btn btn-outline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ margin: '0 0 18px', fontSize: '18px' }}>Send a Support Inquiry</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Yash Panchal"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', fontSize: '13px', color: 'var(--ink)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', fontSize: '13px', color: 'var(--ink)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Inquiry Topic</label>
                  <select
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', fontSize: '13px', color: 'var(--ink)' }}
                  >
                    <option value="Candidate Support">Candidate Support & Applications</option>
                    <option value="Employer Verification">Employer Verification & Job Postings</option>
                    <option value="ATS Scanner">ATS Resume Checker Inquiries</option>
                    <option value="Privacy Request">Privacy & Account Deletion Request</option>
                    <option value="Partnership">Partnership & General Inquiries</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Message Details</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us how we can help you…"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', fontSize: '13px', color: 'var(--ink)', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-dark" style={{ marginTop: '8px' }}>
                  Send Inquiry <Send size={14} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="workspace-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Mail size={20} color="var(--navy)" />
              <h4 style={{ margin: 0, fontSize: '16px' }}>Direct Email</h4>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--muted)' }}>For general inquiries and candidate questions:</p>
            <a href="mailto:support@hirehub.app" style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '14px' }}>
              support@hirehub.app
            </a>
          </div>

          <div className="workspace-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Clock size={20} color="var(--navy)" />
              <h4 style={{ margin: 0, fontSize: '16px' }}>Response Time</h4>
            </div>
            <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.6', color: '#4a5568' }}>
              Our operations team monitors inquiries Monday through Saturday, 9:00 AM – 7:00 PM IST. Priority tickets for domain verification are addressed within 2 hours.
            </p>
          </div>

          <div className="workspace-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <ShieldCheck size={20} color="var(--green)" />
              <h4 style={{ margin: 0, fontSize: '16px' }}>Anti-Scam Reporting</h4>
            </div>
            <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.6', color: '#4a5568' }}>
              If you suspect an employer listing violates our zero-fee guarantee or asks for deposits, report them immediately. We review and sanction bad actors within 1 hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
