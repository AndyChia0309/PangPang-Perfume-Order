import { useEffect, useRef } from "react";

const TURNSTILE_SITE_KEY = "0x4AAAAAAFI83cByNmIvEHd-";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise;

function loadTurnstile() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function TurnstileWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    let widgetId;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: "order",
          size: "flexible",
        });
      })
      .catch((error) => {
        console.error("Turnstile 載入失敗", error);
      });

    return () => {
      cancelled = true;
      if (widgetId !== undefined) window.turnstile.remove(widgetId);
    };
  }, []);

  return <div ref={containerRef} className="w-full" />;
}

export default TurnstileWidget;
