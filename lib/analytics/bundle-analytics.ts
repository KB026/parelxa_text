'use client';

declare global {
  interface Window {
    posthog?: {
      capture: (eventName: string, properties?: Record<string, any>) => void;
    };
  }
}

export function trackBundleView(properties: {
  bundle_id: number | string;
  bundle_slug: string;
}) {
  if (typeof window !== 'undefined' && window.posthog) {
    try {
      window.posthog.capture('bundle_view', {
        bundle_id: properties.bundle_id,
        bundle_slug: properties.bundle_slug,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('PostHog trackBundleView error:', e);
    }
  }
}

export function trackBundleToolClick(properties: {
  bundle_id: number | string;
  bundle_slug: string;
  agent_id: number | string;
  tool_slug: string;
}) {
  if (typeof window !== 'undefined' && window.posthog) {
    try {
      window.posthog.capture('bundle_tool_click', {
        bundle_id: properties.bundle_id,
        bundle_slug: properties.bundle_slug,
        agent_id: properties.agent_id,
        tool_slug: properties.tool_slug,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('PostHog trackBundleToolClick error:', e);
    }
  }
}
