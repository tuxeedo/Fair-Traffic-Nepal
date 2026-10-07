import React from 'react';

export default function Logo({
  size = 36,
  showText = true,
  roleText = '',
  onLogoClick = null,
  canSwitchRole = false,
  onRoleClick = null,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, userSelect: 'none' }}>
      {/* Clickable Logo Emblem + FairTraffic Title Wrapper */}
      <div
        onClick={onLogoClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: onLogoClick ? 'pointer' : 'default',
        }}
        className="logo-brand-trigger"
        title="Go to Dashboard Home"
      >
        {/* Vector Shield Emblem */}
        <div
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #06b6d4 100%)',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
          }}
          className="logo-icon-box"
        >
          <svg
            width={size * 0.65}
            height={size * 0.65}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shield Base */}
            <path
              d="M12 22C12 22 20 18 20 11V5L12 2L4 5V11C4 18 12 22 12 22Z"
              fill="white"
              fillOpacity="0.2"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Traffic Signal Lights */}
            <circle cx="12" cy="7" r="1.5" fill="#ef4444" />
            <circle cx="12" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="12" cy="15" r="1.5" fill="#10b981" />
          </svg>
        </div>

        {showText && (
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* ALWAYS VISIBLE FairTraffic Text */}
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  transition: 'color 0.2s',
                }}
              >
                FairTraffic
              </span>

              {/* Static non-clickable NEPAL badge */}
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--color-primary-light)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  cursor: 'default',
                  pointerEvents: 'none',
                }}
              >
                NEPAL
              </span>
            </div>

            {/* Role Subtext (Clickable if multi-role, non-clickable if single role) */}
            {roleText && (
              <div
                onClick={(e) => {
                  if (canSwitchRole && onRoleClick) {
                    e.stopPropagation();
                    onRoleClick(e);
                  }
                }}
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 500,
                  color: canSwitchRole ? 'var(--color-primary-light)' : 'var(--text-muted)',
                  cursor: canSwitchRole ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  marginTop: 1,
                  textTransform: 'capitalize',
                }}
              >
                <span>{roleText}</span>
                {canSwitchRole && <span style={{ fontSize: '0.65rem' }}>▼</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
