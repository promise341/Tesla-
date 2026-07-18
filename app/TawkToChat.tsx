"use client";

import { useEffect } from "react";

export default function TawkToChat() {
  useEffect(() => {
    const Tawk_API = (window as any).Tawk_API || {};
    const Tawk_LoadStart = new Date();
    (window as any).Tawk_API = Tawk_API;
    (window as any).Tawk_LoadStart = Tawk_LoadStart;

    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = "https://embed.tawk.to/6a5c0dc9096ab21d402a7d3b/1jtrpbn6d";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s0.parentNode?.insertBefore(s1, s0);
  }, []);

  return null;
}
