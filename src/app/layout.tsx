import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: {
    default: "OrbitFlow — Customer engagement workspace",
    template: "%s · OrbitFlow",
  },
  description:
    "A modern customer engagement workspace for contacts, deals, campaigns, and AI-powered conversations.",
  applicationName: "OrbitFlow",
  keywords: ["customer engagement", "CRM", "campaigns", "AI automation", "dashboard"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f5f8f7" }, { media: "(prefers-color-scheme: dark)", color: "#0b1417" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem storageKey="orbitflow-theme" disableTransitionOnChange>

          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}
