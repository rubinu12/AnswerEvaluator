import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/lib/AuthContext"; 
import PageLoader from "@/components/shared/PageLoader"; // For the navigation progress bar
import { Suspense } from "react"; // Required for PageLoader

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
        
        {/* --- YOUR UPDATES --- */}
        {/* This adds the top loading bar for page navigation */}
        <Suspense fallback={null}>
            <PageLoader />
        </Suspense>
        
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}