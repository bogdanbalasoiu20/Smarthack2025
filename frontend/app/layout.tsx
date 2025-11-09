import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartHack 2025 Studio",
  description: "Design, collaborate and manage presentations with a unified experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        data-app-theme="glass"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
