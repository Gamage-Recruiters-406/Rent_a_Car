import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const base = useMemo(
    () => `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`,
    []
  );

  const ranOnce = useRef(false);

  const [msg, setMsg] = useState("Verifying...");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // ✅ If token missing, just set message async (avoids "sync setState in effect" warning)
    if (!token) {
      queueMicrotask(() => setMsg("Invalid verification link."));
      return;
    }

    // ✅ prevent double-call in React StrictMode (dev)
    if (ranOnce.current) return;
    ranOnce.current = true;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `${base}/authUser/verify-email?token=${encodeURIComponent(token)}`,
          { signal: controller.signal }
        );

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          setOk(true);
          setMsg(data.message || "Email verified!");
        } else {
          setOk(false);
          setMsg(data.message || "Verification failed.");
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          setOk(false);
          setMsg("Network error. Try again.");
        }
      }
    })();

    return () => controller.abort();
  }, [token, base]);

  const showAdvice = !ok;

  return (
    <div style={{ padding: 24 }}>
      <h2>
        {!token ? "❌ Invalid Link" : ok ? "✅ Verified" : "⏳ Verifying"}
      </h2>

      <p>{msg}</p>

      {showAdvice && (
        <p>
          Log into your account and request a verification email, then try again.
        </p>
      )}
    </div>
  );
}
