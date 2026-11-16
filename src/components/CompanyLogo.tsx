import React, { useState } from 'react';

export const COMPANY_LOGO_MAP: Record<string, string> = {
  // Real Global & Indian Tech Giants
  google: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
  microsoft: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
  razorpay: 'https://www.google.com/s2/favicons?domain=razorpay.com&sz=128',
  swiggy: 'https://www.google.com/s2/favicons?domain=swiggy.com&sz=128',
  stripe: 'https://www.google.com/s2/favicons?domain=stripe.com&sz=128',
  zomato: 'https://www.google.com/s2/favicons?domain=zomato.com&sz=128',
  flipkart: 'https://www.google.com/s2/favicons?domain=flipkart.com&sz=128',
  postman: 'https://www.google.com/s2/favicons?domain=postman.com&sz=128',
  vercel: 'https://www.google.com/s2/favicons?domain=vercel.com&sz=128',
  supabase: 'https://www.google.com/s2/favicons?domain=supabase.com&sz=128',
  canva: 'https://www.google.com/s2/favicons?domain=canva.com&sz=128',
  apple: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
  meta: 'https://www.google.com/s2/favicons?domain=meta.com&sz=128',
  amazon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128',
  netflix: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128',
  spotify: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128',
  airbnb: 'https://www.google.com/s2/favicons?domain=airbnb.com&sz=128',
  uber: 'https://www.google.com/s2/favicons?domain=uber.com&sz=128',
  openai: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
  atlassian: 'https://www.google.com/s2/favicons?domain=atlassian.com&sz=128',
  github: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
  slack: 'https://www.google.com/s2/favicons?domain=slack.com&sz=128',
  figma: 'https://www.google.com/s2/favicons?domain=figma.com&sz=128',
  notion: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128',
  cred: 'https://www.google.com/s2/favicons?domain=cred.club&sz=128',
  zoho: 'https://www.google.com/s2/favicons?domain=zoho.com&sz=128',
  infosys: 'https://www.google.com/s2/favicons?domain=infosys.com&sz=128',
  tcs: 'https://www.google.com/s2/favicons?domain=tata.com&sz=128',
  paytm: 'https://www.google.com/s2/favicons?domain=paytm.com&sz=128',
  tata: 'https://www.google.com/s2/favicons?domain=tata.com&sz=128',
  shopify: 'https://www.google.com/s2/favicons?domain=shopify.com&sz=128',
  docker: 'https://www.google.com/s2/favicons?domain=docker.com&sz=128',
  cloudflare: 'https://www.google.com/s2/favicons?domain=cloudflare.com&sz=128',

  // Curated Partner Studios & Labs
  pixelforge: 'https://www.google.com/s2/favicons?domain=figma.com&sz=128',
  northstar: 'https://www.google.com/s2/favicons?domain=snowflake.com&sz=128',
  stackyard: 'https://www.google.com/s2/favicons?domain=docker.com&sz=128',
  formfunction: 'https://www.google.com/s2/favicons?domain=framer.com&sz=128',
  neurobyte: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
  asterdigital: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
  mosaiccommerce: 'https://www.google.com/s2/favicons?domain=shopify.com&sz=128',
  cloudharbor: 'https://www.google.com/s2/favicons?domain=intercom.com&sz=128',
  brightleaf: 'https://www.google.com/s2/favicons?domain=hubspot.com&sz=128',
};

export function getCompanyLogoUrl(name: string, website?: string): string {
  const clean = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [k, url] of Object.entries(COMPANY_LOGO_MAP)) {
    if (clean.includes(k) || k.includes(clean)) {
      return url;
    }
  }

  if (website) {
    try {
      const parsed = new URL(website.startsWith('http') ? website : `https://${website}`);
      const host = parsed.hostname.replace(/^www\./, '');
      return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    } catch {
      // ignore
    }
  }

  // Domain guessing fallback from company name
  const guessedDomain = `${clean.replace(/studio|labs|cloud|digital|commerce|ai|growth|technologies/g, '')}.com`;
  return `https://www.google.com/s2/favicons?domain=${guessedDomain}&sz=128`;
}

interface CompanyLogoProps {
  name: string;
  website?: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({ name, website, size = 44, className = '' }: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getCompanyLogoUrl(name, website);

  const initial = (name || 'C').slice(0, 1).toUpperCase();
  const radius = Math.round(size * 0.26);

  if (hasError) {
    return (
      <div
        className={`company-logo-fallback ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: 'linear-gradient(135deg, #18283E 0%, #101B2D 100%)',
          color: '#E5C578',
          border: '1px solid rgba(197, 161, 91, 0.4)',
          boxShadow: '0 4px 14px rgba(16, 27, 45, 0.12)',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 800,
          fontSize: Math.round(size * 0.44),
          fontFamily: 'Manrope, sans-serif',
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={`company-logo-container ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: '#FFFFFF',
        border: '1px solid rgba(16, 27, 45, 0.09)',
        boxShadow: '0 4px 14px rgba(16, 27, 45, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        display: 'grid',
        placeItems: 'center',
        padding: Math.max(3, Math.round(size * 0.14)),
        flexShrink: 0,
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <img
        src={logoUrl}
        alt={`${name} logo`}
        onError={() => setHasError(true)}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: Math.round(radius * 0.6),
        }}
      />
    </div>
  );
}
