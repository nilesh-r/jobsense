import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobSense AI - Smart Job Matcher & ATS Analyzer",
  description: "Analyze your resume against job descriptions with AI-powered ATS scoring",
};

import AIChat from "@/components/AIChat";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
          <AIChat />
        </Providers>
      </body>
    </html>
  );
}

