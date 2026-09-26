import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rolegrove — Your job search, in good order",
  description: "A private space to track job applications, interviews, and follow-ups. Keep your next career move in view.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const analyticsId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const analyticsScript = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";
  return <html lang="en"><body>{children}{analyticsId&&<Script src={analyticsScript} data-website-id={analyticsId} strategy="afterInteractive" />}</body></html>;
}
