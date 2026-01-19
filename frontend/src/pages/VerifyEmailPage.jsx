import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const ranOnce = useRef(false);

  const [msg, setMsg] = useState("Verifying...");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setMsg("Invalid verification link.");
      return;
    }

    if (ranOnce.current) return;
    ranOnce.current = true;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `http://localhost:8090/api/v1/authUser/verify-email?token=${token}`,
          { signal: controller.signal }
        );

        const data = await res.json();

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
  }, [token]);

  return (
    <div style={{ padding: 24 }}>
      <h2>{ok ? "✅ Verified" : "⏳ Verifying"}</h2>
      <p>{msg}</p>
    </div>
  );
}
