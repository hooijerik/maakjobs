"use client";
import { COOKIE_SETTINGS_EVENT } from "./CookieConsent";

/** Re-opens the cookie banner so visitors can change their choice (used in the footer). */
export function CookieSettingsLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))} className={className}>
      {children}
    </button>
  );
}
