import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RankMyCV — AI-Powered ATS Resume Analyzer",
  description:
    "Get your resume scored by a real-world ATS engine combined with a senior tech recruiter. Analyze keyword match, skill gaps, and get actionable improvement tips instantly.",
  keywords: "ATS resume analyzer, resume score, job match, keyword analysis, resume checker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
