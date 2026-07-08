'use client';

import React, { useRef } from 'react';

interface VisitWebsiteButtonProps {
  agent: {
    id: number;
    website?: string;
  };
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function VisitWebsiteButton({ agent, className, style, onClick }: VisitWebsiteButtonProps) {
  const isTrackingRef = useRef(false);

  const handleVisitWebsite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick?.();

    if (!agent?.id || !agent?.website) return;

    // 1. Prevent double-click spam to protect Lead metrics
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;
    setTimeout(() => { isTrackingRef.current = false; }, 2000);

    // 2. Format URL and redirect instantly
    const targetUrl = agent.website.startsWith('http')
      ? agent.website
      : `https://${agent.website}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // 3. Fire background tracking (No await)
    try {
      // Capture referrer, utm params, device type
      const referrer_page = document.referrer || window.location.pathname;
      const url = new URL(window.location.href);
      const utm_source = url.searchParams.get('utm_source') || null;
      const utm_medium = url.searchParams.get('utm_medium') || null;
      const utm_campaign = url.searchParams.get('utm_campaign') || null;
      
      // Detect device type
      const userAgent = navigator.userAgent;
      let device_type = 'desktop';
      if (/mobile|android|iphone|ipod|windows phone/i.test(userAgent)) {
        device_type = 'mobile';
      } else if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
        device_type = 'tablet';
      }

      fetch('/api/agent-interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.id,
          referrer_page,
          utm_source,
          utm_medium,
          utm_campaign,
          device_type,
        }),
      }).then(response => {
        if (!response.ok) {
          console.error('Failed to track click:', response.statusText);
        }
      }).catch(error => {
        console.error('Tracking failed:', error);
      });
    } catch (error) {
      console.error('Error setting up tracking:', error);
    }
  };

  return (
    <button
      onClick={handleVisitWebsite}
      style={style}
      className={className || "w-auto px-6 h-11 bg-[#2563eb] text-white font-semibold rounded-lg shrink-0 flex items-center justify-center no-underline hover:bg-[#1d4ed8] transition-colors cursor-pointer border-none"}
    >
      Visit Website
    </button>
  );
}
