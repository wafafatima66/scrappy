"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { analyticsChoice, setAppAnalytics } from "@/lib/analytics";
import { isNative } from "@/lib/native";

// Android app only: usage statistics stay OFF until the person taps Allow. They can change it later in Profile.
export default function AppAnalytics() {
  const [ask, setAsk] = useState(false);
  const path = usePathname() ?? "/";

  useEffect(() => {
    if (!isNative()) return;
    const c = analyticsChoice();
    if (c === "yes") void setAppAnalytics(true);
    else if (c === null) setAsk(true);
  }, []);

  if (!ask || path.startsWith("/book") || path.startsWith("/profile")) return null;
  const choose = (yes: boolean) => {
    void setAppAnalytics(yes);
    setAsk(false);
  };
  return (
    <div className="cookiebar" role="dialog" aria-label="Usage statistics">
      <p>Help improve Patchlet? We count which tools and layouts people use. No photos, pages, names or emails are sent. You can change this any time in Profile.</p>
      <div>
        <button className="btn" onClick={() => choose(false)}>
          No thanks
        </button>
        <button className="btn primary" onClick={() => choose(true)}>
          Allow
        </button>
      </div>
    </div>
  );
}
