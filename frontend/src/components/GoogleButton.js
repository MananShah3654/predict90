import { useEffect, useRef, useCallback } from "react";

const CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "301503395573-h3pknvrt7egpa6orh14gsq7dm73o8j2g.apps.googleusercontent.com";
const SRC = "https://accounts.google.com/gsi/client";

function loadGsi() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    let s = document.querySelector(`script[src="${SRC}"]`);
    if (s) { s.addEventListener("load", () => resolve()); s.addEventListener("error", reject); return; }
    s = document.createElement("script");
    s.src = SRC; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/**
 * Renders the official "Continue with Google" button.
 * Returns null (renders nothing) when no client ID is configured.
 */
export default function GoogleButton({ onCredential }) {
  const ref = useRef(null);

  const handle = useCallback((resp) => {
    if (resp?.credential) onCredential(resp.credential);
  }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGsi().then(() => {
      if (cancelled || !window.google?.accounts?.id || !ref.current) return;
      window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handle });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "filled_black", size: "large", shape: "pill", text: "continue_with", width: 320,
      });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [handle]);

  if (!CLIENT_ID) return null;
  return <div ref={ref} data-testid="google-signin" className="flex justify-center" />;
}
