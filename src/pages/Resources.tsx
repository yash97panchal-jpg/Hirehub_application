import { useState } from 'react';
import { BookOpen, Clock, ArrowRight, Sparkles, CheckCircle2, Bookmark, Share2, X } from 'lucide-react';
import { careerArticles, type CareerArticle } from '../lib/data';

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<CareerArticle | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const categories = ['All', 'Interviews', 'Resumes', 'Salary Negotiation', 'Growth'];

  const filtered = activeCategory === 'All'
    ? careerArticles
    : careerArticles.filter(a => a.category === activeCategory);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" /> CAREER PLAYBOOKS
        </div>
        <h1>
          Actionable guides to <em>level up your career.</em>
        </h1>
        <p>
          Tactical advice written by hiring managers and tech recruiters. No generic buzzwords—only practical, proven playbooks.
        </p>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn small-btn ${activeCategory === cat ? 'btn-dark' : 'btn-outline'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="listing-grid">
        {filtered.map(article => (
          <div
            key={article.id}
            className="workspace-card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '26px' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="status review" style={{ fontSize: '11px', padding: '4px 10px' }}>
                  {article.category}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={13} color="#8FA3C7" /> {article.readTime}
                </span>
              </div>

              <h3 style={{ fontSize: '19px', lineHeight: '1.3', margin: '0 0 12px', color: 'var(--navy)' }}>
                {article.title}
              </h3>

              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#4a5568', margin: '0 0 18px' }}>
                {article.summary}
              </p>

              {/* Takeaway preview */}
              <div style={{ background: 'var(--paper)', padding: '12px', borderRadius: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--navy)', display: 'block', marginBottom: '6px' }}>
                  Key Takeaway
                </span>
                <div style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--ink)' }}>
                  <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{article.keyTakeaways[0]}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                By {article.author} · {article.date}
              </span>
              <button
                onClick={() => setSelectedArticle(article)}
                className="btn btn-dark small-btn"
              >
                Read Guide <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter Strip */}
      <div className="workspace-card" style={{ marginTop: '48px', padding: '36px', background: 'var(--navy)', color: 'white', textAlign: 'center' }}>
        <Sparkles size={28} color="var(--gold-light)" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '26px', color: 'white', margin: '0 0 8px' }}>
          Get hiring trends and salary reports bi-weekly.
        </h2>
        <p style={{ color: '#c0c9d1', fontSize: '14px', maxWidth: '520px', margin: '0 auto 24px' }}>
          Join 8,000+ engineers, designers and founders receiving tactical career insights and early access to verified openings.
        </p>

        {subscribed ? (
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Thanks for subscribing! You're on the priority list.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', maxWidth: '420px', margin: '0 auto' }}>
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', background: 'var(--white)', fontSize: '13px', outline: 'none', color: 'var(--ink)' }}
            />
            <button className="btn btn-gold" type="submit">
              Subscribe
            </button>
          </form>
        )}
      </div>

      {/* Full Article Modal */}
      {selectedArticle && (
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
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="workspace-card"
            style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '32px', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="status shortlist" style={{ fontSize: '11px', padding: '4px 10px' }}>
                {selectedArticle.category} · {selectedArticle.readTime}
              </span>
              <button
                className="icon-btn"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close article modal"
                style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <h2 style={{ fontSize: '24px', lineHeight: '1.3', color: 'var(--navy)', margin: '0 0 12px' }}>
              {selectedArticle.title}
            </h2>

            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '22px' }}>
              Authored by {selectedArticle.author} · Published {selectedArticle.date}
            </div>

            <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--ink)', marginBottom: '24px' }}>
              {selectedArticle.summary}
            </p>

            <h3 style={{ fontSize: '16px', color: 'var(--navy)', margin: '0 0 12px' }}>
              Actionable Principles & Takeaways
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {selectedArticle.keyTakeaways.map((point, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', background: 'var(--paper)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <button onClick={() => setSelectedArticle(null)} className="btn btn-dark small-btn">
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
