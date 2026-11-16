import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './FloatingDock.css';
import {
  Compass,
  Search,
  Building2,
  Sparkles,
  TrendingUp,
  BookOpen,
  Bookmark,
  LayoutDashboard,
  LucideIcon,
} from 'lucide-react';

export interface DockItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isDivider?: false;
}

export interface DockDivider {
  id: string;
  isDivider: true;
}

export type DockEntry = DockItem | DockDivider;

export const defaultDockItems: DockEntry[] = [
  { id: 'explore', label: 'Explore', href: '/', icon: Compass },
  { id: 'jobs', label: 'Opportunities', href: '/jobs', icon: Search },
  { id: 'companies', label: 'Companies', href: '/companies', icon: Building2 },
  { id: 'ats', label: 'ATS Checker', href: '/ats', icon: Sparkles },
  { id: 'salary', label: 'Salary Insights', href: '/salary', icon: TrendingUp },
  { id: 'resources', label: 'Resources', href: '/resources', icon: BookOpen },
  { id: 'div-1', isDivider: true },
  { id: 'saved', label: 'Saved Roles', href: '/saved', icon: Bookmark },
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

interface FloatingDockProps {
  items?: DockEntry[];
  className?: string;
}

export function FloatingDock({ items = defaultDockItems, className = '' }: FloatingDockProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const location = useLocation();

  return (
    <>
      {/* Ambient background soft blur blobs behind the dock */}
      <div
        className="dock-ambient-blobs"
        style={{
          position: 'fixed',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(90vw, 560px)',
          height: '80px',
          pointerEvents: 'none',
          zIndex: 998,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          filter: 'blur(35px)',
          opacity: 0.65,
        }}
      >
        <div
          style={{
            width: '140px',
            height: '50px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #253D68 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            width: '120px',
            height: '45px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232, 116, 56, 0.35) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            width: '140px',
            height: '50px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #1E3458 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Floating macOS-Style Glassmorphism Dock */}
      <nav
        aria-label="Floating Navigation Dock"
        className={`floating-macos-dock bg-[#0A0F1E]/35 backdrop-blur-xl border border-[#8FA3C7]/20 shadow-2xl ${className}`}
        style={{
          position: 'fixed',
          bottom: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '26px',
          backgroundColor: 'rgba(10, 15, 30, 0.38)',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          border: '1px solid rgba(143, 163, 199, 0.22)',
          boxShadow:
            '0 20px 48px -10px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(143, 163, 199, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {items.map(entry => {
          if (entry.isDivider) {
            return (
              <div
                key={entry.id}
                className="dock-divider"
                style={{
                  width: '1px',
                  height: '24px',
                  backgroundColor: 'rgba(143, 163, 199, 0.22)',
                  margin: '0 4px',
                }}
              />
            );
          }

          const isHovered = hoveredId === entry.id;
          const isActive =
            entry.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(entry.href);

          const IconComponent = entry.icon;

          return (
            <div
              key={entry.id}
              className="dock-item-wrapper"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Dark Pill-shaped Tooltip with Copper Highlight */}
              <div
                className="dock-tooltip"
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 12px)',
                  left: '50%',
                  transform: isHovered
                    ? 'translateX(-50%) translateY(0)'
                    : 'translateX(-50%) translateY(6px)',
                  opacity: isHovered ? 1 : 0,
                  pointerEvents: 'none',
                  backgroundColor: 'rgba(10, 15, 30, 0.94)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(143, 163, 199, 0.3)',
                  boxShadow:
                    '0 10px 25px -4px rgba(0, 0, 0, 0.65), 0 0 12px rgba(232, 116, 56, 0.15)',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#F0F4FA',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 1000,
                }}
              >
                {/* Tiny Copper highlight pip */}
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#E87438',
                    boxShadow: '0 0 8px #E87438',
                    display: 'inline-block',
                  }}
                />
                <span style={{ color: '#E87438', fontWeight: 700, fontSize: '10px' }}>
                  {entry.label}
                </span>
              </div>

              {/* Icon Link Button */}
              <NavLink
                to={entry.href}
                className="dock-icon-btn"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  position: 'relative',
                  outline: 'none',
                  transform: isHovered ? 'scale(1.26) translateY(-4px)' : 'scale(1) translateY(0)',
                  backgroundColor: isHovered
                    ? 'rgba(232, 116, 56, 0.12)'
                    : isActive
                    ? 'rgba(143, 163, 199, 0.1)'
                    : 'transparent',
                  border: isHovered
                    ? '1px solid rgba(232, 116, 56, 0.4)'
                    : isActive
                    ? '1px solid rgba(143, 163, 199, 0.2)'
                    : '1px solid transparent',
                  boxShadow: isHovered
                    ? '0 6px 18px -2px rgba(232, 116, 56, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                    : 'none',
                  transition:
                    'transform 0.24s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <IconComponent
                  size={20}
                  strokeWidth={1.8}
                  style={{
                    color: isHovered ? '#E87438' : isActive ? '#D6E2F7' : '#8FA3C7',
                    filter: isHovered
                      ? 'drop-shadow(0 0 10px rgba(232, 116, 56, 0.85))'
                      : isActive
                      ? 'drop-shadow(0 0 6px rgba(143, 163, 199, 0.5))'
                      : 'none',
                    transition: 'color 0.2s ease, filter 0.2s ease, transform 0.2s ease',
                  }}
                />
              </NavLink>

              {/* Tiny, soft indicator dot below icon */}
              <div
                className="dock-indicator-dot"
                style={{
                  width: '4.5px',
                  height: '4.5px',
                  borderRadius: '50%',
                  marginTop: '3px',
                  backgroundColor: isHovered ? '#E87438' : isActive ? '#8FA3C7' : 'transparent',
                  boxShadow: isHovered
                    ? '0 0 8px #E87438, 0 0 14px rgba(232, 116, 56, 0.8)'
                    : isActive
                    ? '0 0 6px rgba(143, 163, 199, 0.6)'
                    : 'none',
                  transform: isHovered ? 'scale(1.3)' : isActive ? 'scale(1)' : 'scale(0)',
                  opacity: isHovered || isActive ? 1 : 0,
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default FloatingDock;
