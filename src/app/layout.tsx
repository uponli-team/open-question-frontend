import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/app/providers";
import PageTransition from "@/components/layout/PageTransition";

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
    default: "OQD — Open Questions Database",
    template: "%s · OQD",
  },
  description:
    "Explore the World's Unsolved Problems. Structured, searchable, and realtime-ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-white text-slate-900`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Providers>
            <PageTransition>{children}</PageTransition>
          </Providers>
        </div>
        <Footer />
      </body>
    </html>
  );
}
