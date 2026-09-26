import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function RegisterPage() { if (await getCurrentUser()) redirect("/dashboard"); return <><AuthForm mode="register"/><Link className="auth-back" href="/">← Back to home</Link></>; }
