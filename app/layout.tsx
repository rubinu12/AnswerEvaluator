import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/lib/AuthContext";
import PageLoader from "@/components/shared/PageLoader";
import { Suspense } from "react";
import BackgroundProcessingIndicator from "@/components/shared/BackgroundProcessingIndicator"; // 1. Import the new component

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Root & Rise - Your Path to Exam Success",
  description: "The ultimate AI-powered platform for UPSC, State PCS, and other competitive exam aspirants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${poppins.variable} font-poppins h-full`}>
        <div className="fixed-background" />

        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        
        <AuthContextProvider>
          <BackgroundProcessingIndicator /> {/* 2. Add the component here */}
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}