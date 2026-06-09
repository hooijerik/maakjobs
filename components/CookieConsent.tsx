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
 * Consent manager. Google Analytics is treated as essential and loads on every page.
 * Microsoft Clarity is optional and loads only after the visitor clicks "Accepteren".
 * The banner is a full-screen takeover so the choice is unmissable (also on mobile).
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
      {/* Google Analytics — essentieel, altijd geladen. */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>

      {/* Microsoft Clarity — optioneel, alleen na toestemming. */}
      {consent === "granted" && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="text-3xl" aria-hidden>
              🍪
            </div>
            <h2 id="cookie-title" className="mt-3 text-xl font-bold text-slate-900">
              Cookies op Maakjobs
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We gebruiken Google Analytics om de site te laten werken en te verbeteren. Met jouw
              toestemming gebruiken we daarnaast Microsoft Clarity voor extra inzicht in het gebruik.{" "}
              <Link href="/cookies" className="font-medium text-brand-700 underline">
                Meer info
              </Link>
              .
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => choose("denied")}
                className="order-2 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:order-1"
              >
                Alleen noodzakelijk
              </button>
              <button
                onClick={() => choose("granted")}
                className="order-1 flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:order-2"
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
