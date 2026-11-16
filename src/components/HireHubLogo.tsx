import React from 'react';

interface HireHubLogoProps {
  size?: number;
  showText?: boolean;
  light?: boolean;
  className?: string;
}

export function HireHubLogo({
  size = 38,
  showText = true,
  light = false,
  className = '',
}: HireHubLogoProps) {
  const radius = Math.round(size * 0.28);

  return (
    <div
      className={`hirehub-brand-logo ${light ? 'light-brand' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '11px',
        textDecoration: 'none',
        lineHeight: 1,
      }}
    >
      {/* Emblem */}
      <div
        className="brand-logo-emblem"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: light
            ? 'linear-gradient(135deg, #1C2D44 0%, #101B2D 100%)'
            : 'linear-gradient(135deg, #18283E 0%, #101B2D 100%)',
          border: '1.5px solid rgba(197, 161, 91, 0.45)',
          boxShadow: light
            ? '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
            : '0 4px 16px rgba(16, 27, 45, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          display: 'grid',
          placeItems: 'center',
          padding: Math.round(size * 0.12),
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src="/logo.png"
          alt="HireHub Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
          }}
        />
      </div>

      {/* Typography */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: Math.max(19, Math.round(size * 0.58)),
              fontWeight: 800,
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '-1.1px',
              color: light ? '#FFFFFF' : 'var(--navy)',
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            hire
            <span
              style={{
                color: 'var(--gold)',
                background: 'linear-gradient(135deg, #E5C578 0%, #C5A15B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}
            >
              hub
            </span>
          </span>
          <span
            style={{
              fontSize: '7.5px',
              fontWeight: 800,
              letterSpacing: '1.8px',
              color: light ? 'var(--gold-light)' : '#8B8A83',
              textTransform: 'uppercase',
              marginTop: '3px',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            CAREER, IN MOTION
          </span>
        </div>
      )}
    </div>
  );
}
