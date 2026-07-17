import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientShell from "./ClientShell";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tesla-CapX | Precision Investing, Maximum Growth",
  description: "Sign up with Tesla-CapX to join thousands of investors",
};

export const viewport: Viewport = {
  themeColor: "#E31937",
};

// Providers wraps children before they reach ClientShell.
// ClientShell renders <body> so this gives SessionProvider context
// to all client components inside the body.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script src="https://s3.tradingview.com/tv.js" async></script>
        {/* Google Translate — initialised by LanguageSelector component */}
        <script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async></script>
      </head>
      <ClientShell>
        <Providers>{children}</Providers>
      </ClientShell>
    </html>
  );
}
