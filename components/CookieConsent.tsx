"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

const COOKIE = "mj_consent";
const MAXAGE = 60 * 60 * 24 * 180; // ~6 months
const GA_ID = "G-5VFC4QPRNM";
const CLARITY_ID = "x1ky0qa7kq";
export const COOKIE_SETTINGS_EVENT = "maakjobs:cookie-settings";

type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)mj_consent=(granted|denied)/);
  return m ? (m[1] as Consent) : null;
}
function writeConsent(v: "granted" | "denied") {
  document.cookie = `${COOKIE}=${v}; path=/; max-age=${MAXAGE}; samesite=lax`;
}

/**
 * AVG-compliant consent gate: analytics (GA4 + Microsoft Clarity) load ONLY after the
 * visitor clicks "Accepteren". The choice is stored in the mj_consent cookie; the footer
 * "Cookievoorkeuren" link re-opens the banner via a window event.
 */
export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    setOpen(c === null);
    const reopen = () => setOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  function choose(v: "granted" | "denied") {
    writeConsent(v);
    setConsent(v);
    setOpen(false);
  }

  return (
    <>
      {consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
          <Script id="clarity-init" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
          </Script>
        </>
      )}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              We gebruiken functionele cookies en — met jouw toestemming — analytische cookies om de
              site te verbeteren.{" "}
              <Link href="/cookies" className="font-medium text-brand-700 underline">
                Meer info
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => choose("denied")}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Weigeren
              </button>
              <button
                onClick={() => choose("granted")}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Accepteren
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
