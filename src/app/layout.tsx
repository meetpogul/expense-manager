import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Expense Manager",
    default: "Expense Manager | Minimal Personal Finance Tracker",
  },
  description:
    "A sleek, offline-first personal expense tracker. Manage your budgets, track transactions, and achieve your financial goals with ease.",
  keywords: [
    "expense tracker",
    "budget manager",
    "personal finance",
    "PWA",
    "offline",
  ],
  authors: [{ name: "Expense Manager Team" }],
  creator: "Expense Manager Team",
  manifest: "/manifest.json",
  applicationName: "Expense Manager",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    url: "/",
    title: "Expense Manager | Minimal Personal Finance Tracker",
    description:
      "A sleek, offline-first personal expense tracker. Manage your budgets, track transactions, and achieve your financial goals with ease.",
    siteName: "Expense Manager",
    images: [
      {
        url: "/icons/og-image.png",
        width: 1024,
        height: 1024,
        alt: "Expense Manager Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expense Manager | Minimal Personal Finance Tracker",
    description: "A sleek, offline-first personal expense tracker.",
    images: ["/icons/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Expense Manager",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground antialiased">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
