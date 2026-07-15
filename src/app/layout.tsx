import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://career-copilot-ai-web.vercel.app"),
  title: {
    default: "Career Copilot AI - AI-Powered Career Assistant",
    template: "%s | Career Copilot AI",
  },
  description:
    "Analyze your resume against job descriptions, get ATS scores, skill gap insights, interview prep, and personalized learning roadmaps.",
  keywords: [
    "AI career coach",
    "resume parser",
    "ATS scorer",
    "interview practice tool",
    "skill gap analysis",
    "personalized learning roadmap",
    "job search copilot",
  ],
  authors: [{ name: "Career Copilot AI Team" }],
  creator: "Career Copilot AI Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://careercopilot.ai",
    title: "Career Copilot AI - AI-Powered Career Assistant",
    description:
      "Analyze your resume against job descriptions, get ATS scores, skill gap insights, interview prep, and personalized learning roadmaps.",
    siteName: "Career Copilot AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Career Copilot AI Platform Overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Copilot AI - AI-Powered Career Assistant",
    description:
      "Analyze your resume against job descriptions, get ATS scores, skill gap insights, interview prep, and personalized learning roadmaps.",
    images: ["/og-image.png"],
    creator: "@careercopilotai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
