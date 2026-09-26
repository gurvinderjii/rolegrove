"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "register" | "login" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const registering = mode === "register";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const payload = Object.fromEntries(data.entries());
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Something went wrong. Please try again."); return; }
      router.push("/dashboard"); router.refresh();
    } catch { setError("We couldn’t reach the server. Check your connection and try again."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><Link className="brand auth-brand" href="/"><span className="brand-mark">r<span>.</span></span><span>rolegrove</span></Link><section className="auth-card"><div className="auth-mark">✳</div><div className="section-kicker">{registering ? "A FRESH START" : "WELCOME BACK"}</div><h1>{registering ? "Make space for what’s next." : "Pick up where you left off."}</h1><p>{registering ? "Create your personal workspace. Your job search, in good order." : "Your opportunities are right where you left them."}</p><form onSubmit={submit} className="auth-form">{registering && <label>Your name<input name="name" autoComplete="name" placeholder="Sam Carter" minLength={2} maxLength={70} required /></label>}<label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required /></label><label>Password<input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} placeholder={registering ? "At least 8 characters" : "Your password"} minLength={registering ? 8 : undefined} maxLength={128} required /></label>{registering && <small className="password-hint">Use at least 8 characters.</small>}{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button auth-submit" data-umami-event={registering ? "create-workspace" : "login"} disabled={busy}>{busy ? "Please wait…" : registering ? "Create my workspace" : "Log in to Rolegrove"} <span>→</span></button></form><div className="auth-switch">{registering ? <>Already have an account? <Link href="/login">Log in</Link></> : <>New to Rolegrove? <Link href="/register">Create an account</Link></>}</div></section><div className="auth-footer">Your workspace is private to your account. <span>♥</span></div></main>;
}
