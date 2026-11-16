import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Building2,
  Sparkles,
  TrendingUp,
  BookOpen,
  Bookmark,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { FloatingDock } from '../components/FloatingDock';

export default function DockShowcase() {
  return (
    <div
      className="dock-showcase-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0F1E',
        color: '#F0F4FA',
        position: 'relative',
        overflow: 'hidden',
        padding: '60px 24px 140px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Ambient background soft blur blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 53, 91, 0.55) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          width: '460px',
          height: '460px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 116, 56, 0.22) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '30%',
          width: '580px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(42, 75, 128, 0.45) 0%, transparent 70%)',
          filter: 'blur(95px)',
          pointerEvents: 'none',
        }}
      />

      {/* Content Container */}
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Navigation Breadcrumb / Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Link
            to="/"
            style={{
              fontSize: '12px',
              color: '#8FA3C7',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back to HireHub
          </Link>
          <span style={{ color: 'rgba(143, 163, 199, 0.4)' }}>/</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#E87438',
              backgroundColor: 'rgba(232, 116, 56, 0.12)',
              border: '1px solid rgba(232, 116, 56, 0.3)',
              padding: '3px 10px',
              borderRadius: '999px',
            }}
          >
            MACOS GLASSMORPHISM DOCK
          </span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-2px',
            lineHeight: 1.1,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #D8E3F5 60%, #8FA3C7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Floating macOS Navigation Dock
        </h1>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.7,
            color: '#8FA3C7',
            maxWidth: '650px',
            margin: '0 0 40px',
          }}
        >
          Crafted with semi-transparent Deep Navy (<code style={{ color: '#E87438' }}>#0A0F1E</code>),
          delicate Silver Blue borders (<code style={{ color: '#8FA3C7' }}>#8FA3C7</code>),
          strong backdrop blur, and interactive icons that scale into glowing Copper (<code style={{ color: '#E87438' }}>#E87438</code>)
          with tiny indicator dots and pill tooltips.
        </p>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '50px',
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              backgroundColor: 'rgba(10, 15, 30, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(143, 163, 199, 0.2)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(232, 116, 56, 0.12)',
                border: '1px solid rgba(232, 116, 56, 0.35)',
                display: 'grid',
                placeItems: 'center',
                color: '#E87438',
                marginBottom: '16px',
                filter: 'drop-shadow(0 0 8px rgba(232, 116, 56, 0.5))',
              }}
            >
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Glowing Copper Hover State
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#8FA3C7', margin: 0 }}>
              Hover any icon in the floating dock below: it smoothly magnifies by 1.28x, illuminates in glowing Copper (<span style={{ color: '#E87438', fontWeight: 600 }}>#E87438</span>), and reveals a soft indicator dot.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              backgroundColor: 'rgba(10, 15, 30, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(143, 163, 199, 0.2)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(143, 163, 199, 0.12)',
                border: '1px solid rgba(143, 163, 199, 0.35)',
                display: 'grid',
                placeItems: 'center',
                color: '#8FA3C7',
                marginBottom: '16px',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Delicate Silver Blue Border
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#8FA3C7', margin: 0 }}>
              Default icons are rendered in sleek monochromatic Silver Blue (<span style={{ color: '#8FA3C7', fontWeight: 600 }}>#8FA3C7</span>) enclosed in an ultra-crisp semi-transparent glass dock with 38% opacity.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              backgroundColor: 'rgba(10, 15, 30, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(143, 163, 199, 0.2)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(10, 15, 30, 0.9)',
                border: '1px solid rgba(143, 163, 199, 0.3)',
                display: 'grid',
                placeItems: 'center',
                color: '#E87438',
                marginBottom: '16px',
              }}
            >
              <Bookmark size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
              Pill-Shaped Tooltip System
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#8FA3C7', margin: 0 }}>
              Hovering displays a dark glass pill tooltip directly above each icon with a luminous copper highlight dot and high-contrast label typography.
            </p>
          </div>
        </div>

        {/* Live Interaction Demonstration Box */}
        <div
          style={{
            backgroundColor: 'rgba(10, 15, 30, 0.75)',
            border: '1px solid rgba(143, 163, 199, 0.25)',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '1.8px',
              fontWeight: 800,
              color: '#8FA3C7',
              textTransform: 'uppercase',
            }}
          >
            INTERACTIVE PREVIEW
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0 12px' }}>
            Look at the floating dock at the bottom of your screen
          </h2>
          <p style={{ fontSize: '14px', color: '#8FA3C7', maxWidth: '500px', margin: '0 auto 20px' }}>
            Hover your cursor over any icon to experience the macOS magnification, glowing copper aura, pill tooltip, and indicator dot in real-time.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/jobs"
              className="btn btn-gold"
              style={{
                borderRadius: '12px',
                padding: '12px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Explore Opportunities <ArrowRight size={15} />
            </Link>
            <Link
              to="/companies"
              className="btn btn-dark"
              style={{
                borderRadius: '12px',
                padding: '12px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Browse Verified Companies
            </Link>
          </div>
        </div>
      </div>

      {/* Floating macOS Dock Component */}
      <FloatingDock />
    </div>
  );
}
