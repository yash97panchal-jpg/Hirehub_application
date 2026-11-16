import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Briefcase,
  Phone,
  FileText,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { demoJobs, demoCompanies, type Job } from '../lib/data';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: { label: string; action: () => void }[];
  card?: {
    title: string;
    subtitle: string;
    badge?: string;
    meta?: string;
  };
}

type BotMode = 'idle' | 'applying' | 'contacting';

export function HelpChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<BotMode>('idle');
  const [applyStep, setApplyStep] = useState<number>(0);
  const [contactStep, setContactStep] = useState<number>(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Application collected data
  const [applyData, setApplyData] = useState({
    name: '',
    email: '',
    experience: '',
    portfolio: '',
  });

  // Contact collected data
  const [contactData, setContactData] = useState({
    name: '',
    contactInfo: '',
    inquiry: '',
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "👋 Hi there! I'm HireBot, your AI application & career assistant.",
      timestamp: 'Just now',
    },
    {
      id: 'welcome-2',
      sender: 'bot',
      text: "I can help you apply for open positions right here, connect you with our team, or answer questions about salaries and ATS screening. How can I help you?",
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isTyping]);

  // Listen for global custom event to trigger apply for a specific job
  useEffect(() => {
    const handleApplyEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ job: Job }>;
      if (customEvent.detail?.job) {
        const job = customEvent.detail.job;
        setSelectedJob(job);
        setMode('applying');
        setApplyStep(1);
        setIsOpen(true);

        const newMsg: Message = {
          id: 'apply-start-' + Date.now(),
          sender: 'bot',
          text: `Great choice! Let's submit your application for ${job.title} at ${job.company}. What is your Full Name?`,
          timestamp: 'Just now',
          card: {
            title: job.title,
            subtitle: `${job.company} • ${job.location}`,
            badge: job.salary,
          },
        };

        setMessages(prev => [...prev, newMsg]);
      }
    };

    window.addEventListener('open-hirebot-apply', handleApplyEvent);
    return () => window.removeEventListener('open-hirebot-apply', handleApplyEvent);
  }, []);

  const addBotMessage = (text: string, options?: { label: string; action: () => void }[], card?: Message['card']) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now() + Math.random(),
          sender: 'bot',
          text,
          timestamp: 'Just now',
          options,
          card,
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text) return;

    // Add user message
    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: 'Just now',
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Handle Application Flow
    if (mode === 'applying') {
      handleApplyFlow(text);
      return;
    }

    // Handle Contact Flow
    if (mode === 'contacting') {
      handleContactFlow(text);
      return;
    }

    // Handle General Queries & Intent Detection
    const lower = text.toLowerCase();

    if (lower.includes('apply') || lower.includes('job') || lower.includes('opening')) {
      startJobApplicationSelection();
    } else if (lower.includes('contact') || lower.includes('call') || lower.includes('support') || lower.includes('help me') || lower.includes('reach')) {
      startContactFlow();
    } else if (lower.includes('ats') || lower.includes('resume') || lower.includes('cv')) {
      addBotMessage(
        "Our Smart ATS Scanner checks your resume against automated screening algorithms for keyword density, measurable metrics, and action verbs. Would you like to test your resume now?",
        [
          {
            label: "Open ATS Checker",
            action: () => {
              window.location.href = '/ats-checker';
            },
          },
          {
            label: "Ask for Resume Tips",
            action: () => {
              addBotMessage("Top ATS Resume Tips:\n1. Use standard headings (Experience, Skills, Education).\n2. Include specific metrics (% improvements, revenue, user numbers).\n3. Avoid multi-column tables or graphics.\n4. Attach a clean PDF with selectable text.");
            },
          },
        ]
      );
    } else if (lower.includes('salary') || lower.includes('pay') || lower.includes('lpa')) {
      addBotMessage(
        "HireHub benchmarks salaries across verified tech roles in India:\n• Frontend Engineer: ₹7–24 LPA\n• Backend Lead: ₹25–50 LPA\n• Product Designer: ₹6–20 LPA\n• DevOps: ₹9–34 LPA",
        [
          {
            label: "View Salary Insights",
            action: () => {
              window.location.href = '/salaries';
            },
          },
        ]
      );
    } else if (lower.includes('company') || lower.includes('companies')) {
      addBotMessage(
        "We partner with high-growth product studios and tech companies like Google, Swiggy, Razorpay, Stripe, and Vercel. Would you like to browse verified companies?",
        [
          {
            label: "Browse Companies",
            action: () => {
              window.location.href = '/companies';
            },
          },
        ]
      );
    } else {
      addBotMessage(
        `I understand you're asking about "${text}". What would you like assistance with today?`,
        [
          { label: "Apply for a Job", action: () => startJobApplicationSelection() },
          { label: "Contact Us / Request Callback", action: () => startContactFlow() },
          { label: "Check ATS Resume", action: () => { window.location.href = '/ats-checker'; } },
          { label: "Browse Openings", action: () => { window.location.href = '/jobs'; } },
        ]
      );
    }
  };

  // JOB APPLICATION FLOW
  const startJobApplicationSelection = () => {
    setMode('applying');
    setApplyStep(0);
    const topJobs = demoJobs.slice(0, 4);
    addBotMessage(
      "Which role would you like to apply for? Select from the top openings below or type the company name:",
      topJobs.map(job => ({
        label: `${job.title} (${job.company})`,
        action: () => {
          setSelectedJob(job);
          setApplyStep(1);
          addBotMessage(`Applying for ${job.title} at ${job.company}. What is your Full Name?`);
        },
      }))
    );
  };

  const handleApplyFlow = (answer: string) => {
    if (applyStep === 0) {
      const match = demoJobs.find(
        j => j.title.toLowerCase().includes(answer.toLowerCase()) || j.company.toLowerCase().includes(answer.toLowerCase())
      ) || demoJobs[0];
      setSelectedJob(match);
      setApplyStep(1);
      addBotMessage(`Selected: ${match.title} at ${match.company}. What is your Full Name?`);
    } else if (applyStep === 1) {
      setApplyData(prev => ({ ...prev, name: answer }));
      setApplyStep(2);
      addBotMessage(`Nice to meet you, ${answer}! What is your Email Address so the hiring team can contact you?`);
    } else if (applyStep === 2) {
      setApplyData(prev => ({ ...prev, email: answer }));
      setApplyStep(3);
      addBotMessage("How many years of relevant experience do you have? (e.g. 'Fresher', '2 years', '4+ years')");
    } else if (applyStep === 3) {
      setApplyData(prev => ({ ...prev, experience: answer }));
      setApplyStep(4);
      addBotMessage("Please provide your LinkedIn / GitHub / Portfolio link or a brief summary of your background:");
    } else if (applyStep === 4) {
      setApplyData(prev => ({ ...prev, portfolio: answer }));

      // Complete Application
      const job = selectedJob || demoJobs[0];
      const apps: string[] = JSON.parse(localStorage.getItem('hirehub_applied') || '[]');
      if (!apps.includes(job.id)) {
        localStorage.setItem('hirehub_applied', JSON.stringify([...apps, job.id]));
        window.dispatchEvent(new Event('hirehub-application-submitted'));
      }

      const appId = 'HH-' + Math.floor(1000 + Math.random() * 9000);

      addBotMessage(
        `Application Submitted Successfully! 🎉\n\nApplication ID: #${appId}\nRole: ${job.title}\nCompany: ${job.company}\nCandidate: ${applyData.name || 'Candidate'}\n\nYour application has been routed directly to the hiring manager. You can track this application on your Dashboard.`,
        [
          {
            label: "View in Dashboard",
            action: () => {
              window.location.href = '/dashboard';
            },
          },
          {
            label: "Apply for Another Role",
            action: () => startJobApplicationSelection(),
          },
        ],
        {
          title: `Application Confirmed • #${appId}`,
          subtitle: `${job.title} at ${job.company}`,
          badge: 'Status: Under Review',
        }
      );

      setMode('idle');
      setApplyStep(0);
      setSelectedJob(null);
    }
  };

  // CONTACT FLOW
  const startContactFlow = () => {
    setMode('contacting');
    setContactStep(1);
    addBotMessage("I'm happy to connect you with our team! What is your Full Name?");
  };

  const handleContactFlow = (answer: string) => {
    if (contactStep === 1) {
      setContactData(prev => ({ ...prev, name: answer }));
      setContactStep(2);
      addBotMessage(`Thanks, ${answer}! What is your Email Address or Phone Number?`);
    } else if (contactStep === 2) {
      setContactData(prev => ({ ...prev, contactInfo: answer }));
      setContactStep(3);
      addBotMessage("What is your inquiry or message for our team? (e.g. candidate question, recruiter partnership, support)");
    } else if (contactStep === 3) {
      setContactData(prev => ({ ...prev, inquiry: answer }));

      const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);

      // Save to localStorage
      const tickets = JSON.parse(localStorage.getItem('hirehub_support_tickets') || '[]');
      tickets.push({
        id: ticketId,
        name: contactData.name,
        contact: contactData.contactInfo,
        inquiry: answer,
        date: new Date().toISOString(),
      });
      localStorage.setItem('hirehub_support_tickets', JSON.stringify(tickets));

      addBotMessage(
        `Your support request has been logged! 🎫\n\nTicket ID: #${ticketId}\nContact: ${contactData.contactInfo}\nStatus: Priority Assigned\n\nA representative from our team will reach out to you within 2 hours. Is there anything else I can help with?`,
        [
          { label: "Browse Job Openings", action: () => { window.location.href = '/jobs'; } },
          { label: "Check Salary Insights", action: () => { window.location.href = '/salaries'; } },
        ]
      );

      setMode('idle');
      setContactStep(0);
    }
  };

  const resetChat = () => {
    setMode('idle');
    setApplyStep(0);
    setContactStep(0);
    setSelectedJob(null);
    setMessages([
      {
        id: 'reset-1',
        sender: 'bot',
        text: "Conversation refreshed. I'm ready to help you apply for jobs, contact our team, or assist your career search!",
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hirebot-trigger-btn"
          aria-label="Open HireHub Assistant Chatbot"
          title="Need help? Chat with HireBot"
        >
          <div className="hirebot-trigger-glow" />
          <div className="hirebot-trigger-inner">
            <Bot size={20} color="#FFE4A0" />
            <span className="hirebot-trigger-dot" />
          </div>
          <span className="hirebot-trigger-label">Ask HireBot</span>
        </button>
      )}

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div className="hirebot-window">
          {/* Header */}
          <div className="hirebot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="hirebot-avatar">
                <Bot size={18} color="#FFE4A0" />
                <span className="hirebot-online-dot" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  HireBot
                  <span className="hirebot-ai-badge">AI Assistant</span>
                </div>
                <div style={{ fontSize: '11px', color: '#8FA3C7' }}>
                  {mode === 'applying' ? 'Application Process Active' : mode === 'contacting' ? 'Contact Support Mode' : 'Online • Ready to help'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={resetChat}
                className="hirebot-header-btn"
                title="Reset conversation"
                aria-label="Reset chat"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hirebot-header-btn"
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="hirebot-body">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`hirebot-msg-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="hirebot-msg-avatar">
                    <Bot size={13} color="#FFE4A0" />
                  </div>
                )}

                <div className={`hirebot-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {msg.text}
                  </p>

                  {/* Optional Job / Confirmation Card */}
                  {msg.card && (
                    <div className="hirebot-card-attachment">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#101B2D', display: 'block' }}>{msg.card.title}</strong>
                          <small style={{ fontSize: '11px', color: '#68737B' }}>{msg.card.subtitle}</small>
                        </div>
                        {msg.card.badge && (
                          <span className="hirebot-card-badge">{msg.card.badge}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interactive Option Chips */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="hirebot-options-wrap">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          className="hirebot-option-btn"
                          onClick={opt.action}
                        >
                          {opt.label} <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="hirebot-msg-row bot-row">
                <div className="hirebot-msg-avatar">
                  <Bot size={13} color="#FFE4A0" />
                </div>
                <div className="hirebot-bubble bot-bubble hirebot-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (when in idle mode) */}
          {mode === 'idle' && (
            <div className="hirebot-quick-chips">
              <button
                type="button"
                onClick={() => handleSend("I want to apply for a job")}
                className="hirebot-quick-chip"
              >
                <Briefcase size={12} color="#3B82F6" /> Quick Apply
              </button>
              <button
                type="button"
                onClick={() => handleSend("Contact me and support")}
                className="hirebot-quick-chip"
              >
                <Phone size={12} color="#E87438" /> Contact Support
              </button>
              <button
                type="button"
                onClick={() => handleSend("How does the ATS checker work?")}
                className="hirebot-quick-chip"
              >
                <FileText size={12} color="#10B981" /> ATS Checker
              </button>
              <button
                type="button"
                onClick={() => handleSend("What are the salary ranges?")}
                className="hirebot-quick-chip"
              >
                <TrendingUp size={12} color="#C5A15B" /> Salaries
              </button>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="hirebot-footer"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                mode === 'applying'
                  ? 'Type your answer to continue application...'
                  : mode === 'contacting'
                  ? 'Type your contact message...'
                  : 'Ask HireBot anything or apply...'
              }
              className="hirebot-input"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="hirebot-send-btn"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
