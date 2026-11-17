"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { isNative } from "@/lib/native";
import { GA_ID } from "@/lib/site";

const KEY = "patchlet.analytics";
type Gtag = (...a: unknown[]) => void;

// Google Analytics for the WEBSITE only (never inside the Android app).
// Starts with analytics cookies off; they are switched on only if the visitor taps "Allow".
export default function Analytics() {
  const [on, setOn] = useState(false);
  const [asked, setAsked] = useState(true);
  const path = usePathname() ?? "/";

  useEffect(() => {
    if (!GA_ID || isNative()) return;
    setOn(true);
    try {
      setAsked(localStorage.getItem(KEY) !== null);
    } catch {
      setAsked(true);
    }
  }, []);

  if (!GA_ID || !on) return null;

  const choose = (yes: boolean) => {
    try {
      localStorage.setItem(KEY, yes ? "yes" : "no");
    } catch {}
    (window as unknown as { gtag?: Gtag }).gtag?.("consent", "update", { analytics_storage: yes ? "granted" : "denied" });
    setAsked(true);
  };

  // keep the bar off the editor so it never covers the tools
  const hideBar = path.startsWith("/book") || path.startsWith("/profile");

  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
try{if(localStorage.getItem('${KEY}')==='yes')gtag('consent','update',{analytics_storage:'granted'})}catch(e){}
gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      {!asked && !hideBar && (
        <div className="cookiebar" role="dialog" aria-label="Analytics">
          <p>We use Google Analytics to count visits and see which links bring people here. No names or emails. Okay?</p>
          <div>
            <button className="btn" onClick={() => choose(false)}>
              No thanks
            </button>
            <button className="btn primary" onClick={() => choose(true)}>
              Allow
            </button>
          </div>
        </div>
      )}
    </>
  );
}
