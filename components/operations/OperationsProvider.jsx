"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
const Context = createContext(null);
export function OperationsProvider({ children }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState(null);
  const pending = useRef(false),
    serial = useRef(0),
    mounted = useRef(true);
  const refresh = useCallback(async () => {
    if (pending.current) return;
    const id = ++serial.current;
    try {
      const res = await fetch("/api/operations", { cache: "no-store" });
      if (res.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (!res.ok)
        throw new Error("Telemetry unavailable. Retrying automatically.");
      const data = await res.json();
      if (mounted.current && id === serial.current) {
        setState(data);
        setConnectionError("");
      }
    } catch (e) {
      if (mounted.current && id === serial.current)
        setConnectionError(e.message);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    fetch("/api/ops-session", { cache: "no-store" }).then((response) => response.json()).then((data) => { if (mounted.current) setRole(data.role); }).catch(() => {});
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      serial.current++;
    };
  }, [refresh]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  const send = useCallback(async (action, success = "Operation updated.") => {
    if (pending.current) return false;
    pending.current = true;
    ++serial.current;
    setBusy(true);
    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.assign("/login");
        return false;
      }
      if (!res.ok) throw new Error(data.error || "The operation failed.");
      setState(data);
      setError("");
      setNotice(success);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }, []);
  return (
    <Context.Provider value={{ state, send, busy, error, refresh, role }}>
      {(error || connectionError) && (
        <div className="ops-error" role="alert">
          {error || connectionError}{" "}
          {error ? (
            <button onClick={() => setError("")}>Dismiss</button>
          ) : (
            <button onClick={refresh}>Retry connection</button>
          )}
        </div>
      )}
      {children}
      {notice && (
        <div className="ops-toast" role="status">
          <span>✓</span>
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useOperations() {
  return useContext(Context);
}
