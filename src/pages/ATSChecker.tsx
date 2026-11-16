import { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight, RefreshCw, BarChart2, ShieldCheck, Copy } from 'lucide-react';

interface ATSResult {
  score: number;
  grade: 'Excellent' | 'Good' | 'Needs Work';
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
}

const roleSkillsMap: Record<string, string[]> = {
  'Frontend Developer': ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Redux', 'REST API', 'Git', 'Testing', 'Performance Optimization'],
  'Backend Engineer': ['Node.js', 'Python', 'PostgreSQL', 'SQL', 'Docker', 'Redis', 'REST', 'AWS', 'Microservices', 'CI/CD'],
  'Data Analyst': ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel', 'Data Modeling', 'Dashboards', 'ETL', 'Statistics', 'Reporting'],
  'UI/UX Designer': ['Figma', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research', 'Usability Testing', 'Typography', 'Responsive Design'],
  'DevOps Engineer': ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Monitoring', 'Bash', 'Prometheus', 'Security'],
  'Product Manager': ['Roadmapping', 'Agile', 'Scrum', 'User Stories', 'KPIs', 'Market Research', 'Stakeholder Management', 'A/B Testing', 'Prioritization'],
};

const sampleResume = `Senior Frontend Engineer with 3+ years building responsive web platforms.
Core Skills: React, TypeScript, JavaScript, CSS, REST API, Git, Redux, Performance Optimization.
Experience:
- Architected enterprise React design system reducing UI development turnaround by 35%.
- Implemented state management using Redux Toolkit and optimized bundle size, boosting Lighthouse score from 68 to 94.
- Collaborated with product designers in Figma to ship accessible WCAG 2.1 compliant components.
Education: B.Tech in Computer Science & Engineering.`;

export default function ATSChecker() {
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [resumeText, setResumeText] = useState(sampleResume);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      const skills = roleSkillsMap[targetRole] || roleSkillsMap['Frontend Developer'];
      const textLower = resumeText.toLowerCase();

      const matched: string[] = [];
      const missing: string[] = [];

      skills.forEach(skill => {
        if (textLower.includes(skill.toLowerCase())) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      });

      const skillRatio = matched.length / skills.length;
      let calculatedScore = Math.round(skillRatio * 70);

      // Check for action verbs and metrics
      const hasMetrics = /\d+[\%|k|\+|ms|s]|\b\d+\b/.test(resumeText);
      const hasActionVerbs = /architected|developed|built|implemented|reduced|optimized|led|designed|launched/i.test(resumeText);
      const hasEducation = /education|degree|b\.tech|bachelor|master|university/i.test(resumeText);

      if (hasMetrics) calculatedScore += 12;
      if (hasActionVerbs) calculatedScore += 10;
      if (hasEducation) calculatedScore += 8;

      calculatedScore = Math.min(96, Math.max(45, calculatedScore));

      const strengths: string[] = [];
      const improvements: string[] = [];

      if (hasMetrics) strengths.push('Quantifiable achievements detected (% improvements, numbers, scale).');
      else improvements.push('Add measurable outcomes (e.g. "Reduced load time by 30%", "Managed 10k users").');

      if (hasActionVerbs) strengths.push('Strong action verbs present (Architected, Implemented, Optimized).');
      else improvements.push('Start bullet points with assertive verbs instead of passive phrases like "Responsible for".');

      if (matched.length >= skills.length * 0.6) {
        strengths.push(`High keyword density for ${targetRole} (${matched.length} core competencies found).`);
      } else {
        improvements.push(`Include more specific ${targetRole} tools from our recommended skills list.`);
      }

      setResult({
        score: calculatedScore,
        grade: calculatedScore >= 80 ? 'Excellent' : calculatedScore >= 65 ? 'Good' : 'Needs Work',
        matchedKeywords: matched,
        missingKeywords: missing,
        strengths,
        improvements,
      });
      setAnalyzing(false);
    }, 600);
  };

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" /> SMART RESUME SCANNER
        </div>
        <h1>
          Test your resume for <em>ATS systems.</em>
        </h1>
        <p>
          Find out how automated Applicant Tracking Systems parse your credentials. See missing keywords, formatting traps, and instant recommendations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '28px', alignItems: 'start' }}>
        {/* Input Panel */}
        <div className="workspace-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Target Role & Resume Text</h3>
            <button
              onClick={() => setResumeText(sampleResume)}
              className="text-link"
              style={{ fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Copy size={13} /> Load Sample Resume
            </button>
          </div>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Select Target Position
          </label>
          <select
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', marginBottom: '18px', color: 'var(--ink)' }}
          >
            {Object.keys(roleSkillsMap).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Paste Resume Plain Text (or summary)
          </label>
          <textarea
            rows={11}
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your resume sections, skills list, and bullet points here…"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--white)', fontSize: '13px', lineHeight: '1.6', fontFamily: 'inherit', color: 'var(--ink)', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {resumeText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !resumeText.trim()}
              className="btn btn-gold"
              style={{ minWidth: '170px' }}
            >
              {analyzing ? <><RefreshCw size={15} className="spinner" /> Analyzing…</> : <><Sparkles size={15} /> Analyze Resume</>}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="workspace-card" style={{ padding: '24px' }}>
            {/* Score Ring / Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '18px', marginBottom: '20px' }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '4px' }}>OVERALL MATCH</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--navy)', fontFamily: 'Manrope, sans-serif' }}>
                    {result.score}
                  </span>
                  <span style={{ fontSize: '18px', color: 'var(--muted)', fontWeight: 600 }}>/ 100</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status ${result.score >= 80 ? 'shortlist' : result.score >= 65 ? 'applied' : 'review'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  {result.grade} ATS Alignment
                </span>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--muted)' }}>Role: {targetRole}</p>
              </div>
            </div>

            {/* Keyword Match Badges */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--navy)', marginBottom: '8px' }}>
                Identified Competencies ({result.matchedKeywords.length})
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {result.matchedKeywords.map(kw => (
                  <span key={kw} style={{ background: 'rgba(49,118,92,0.12)', color: 'var(--green)', fontSize: '11px', fontWeight: 700, padding: '4px 9px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> {kw}
                  </span>
                ))}
              </div>

              {result.missingKeywords.length > 0 && (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#c53030', marginBottom: '8px' }}>
                    Missing Target Keywords ({result.missingKeywords.length})
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {result.missingKeywords.map(kw => (
                      <span key={kw} style={{ background: '#fff5f5', border: '1px dashed #feb2b2', color: '#9b2c2c', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>
                        + {kw}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Strengths */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Key Strengths</h4>
              {result.strengths.map(s => (
                <div key={s} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--ink)', marginBottom: '6px' }}>
                  <CheckCircle2 size={15} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {/* Improvements */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Recommended Improvements</h4>
              {result.improvements.map(imp => (
                <div key={imp} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#744210', marginBottom: '6px', background: '#fffaf0', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid var(--gold)' }}>
                  <AlertCircle size={15} color="var(--gold)" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{imp}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--paper)', borderRadius: '8px', fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#059669" />
              HireHub ATS scanner strictly runs client-side. Your resume content is never stored without your explicit job application.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
