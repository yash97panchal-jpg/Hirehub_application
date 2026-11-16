import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Search, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { faqList, type FAQItem } from '../lib/data';

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set([faqList[0].id, faqList[3].id]));

  const categories = ['All', 'Job Seekers', 'Employers', 'Verification & Security'];

  const toggleQuestion = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return faqList.filter(item => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch =
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" /> HELP & SUPPORT
        </div>
        <h1>
          Frequently asked <em>questions.</em>
        </h1>
        <p>
          Everything you need to know about applying, employer verification, ATS resume scans, and data privacy on HireHub.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="search-studio-card" style={{ padding: '16px 20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-box" style={{ flex: '1', minWidth: '260px' }}>
            <Search size={18} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search questions by keyword, topic, or policy…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-pill-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accordion Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        {filtered.map(item => {
          const isOpen = openIds.has(item.id);
          return (
            <div
              key={item.id}
              className="workspace-card"
              style={{ padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.2s', borderColor: isOpen ? 'var(--gold)' : 'var(--line)' }}
              onClick={() => toggleQuestion(item.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="status review" style={{ fontSize: '10px', padding: '3px 8px' }}>
                    {item.category}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                    {item.question}
                  </h3>
                </div>
                <ChevronDown
                  size={18}
                  color="var(--muted)"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                />
              </div>

              {isOpen && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--line)', fontSize: '14px', lineHeight: '1.7', color: '#4a5568' }}>
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="workspace-card" style={{ textAlign: 'center', padding: '40px' }}>
            <HelpCircle size={32} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
            <h3>No matching questions found</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Try searching with a different term or clear the filter.</p>
          </div>
        )}
      </div>

      {/* Still need help strip */}
      <div className="workspace-card" style={{ padding: '28px', background: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="icon-badge copper">
            <MessageSquare size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--navy)' }}>Still have questions?</h4>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Our support team usually replies within 2–4 hours.</span>
          </div>
        </div>
        <Link to="/contact" className="btn btn-dark">
          Contact Support <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
