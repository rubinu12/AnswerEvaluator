import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Using Poppins for the new design
import "./globals.css";
import { AuthContextProvider } from '../lib/AuthContext'; // Preserved your Auth provider

// Setup Poppins font to match the new dashboard's aesthetic
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Root & Rise - UPSC Evaluator", // Using your app's title
  description: "AI-Powered UPSC Mains Answer Evaluation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {/* Added the animated background div for the new dashboard */}
        <div className="fixed-background" />
        
        {/* Your existing AuthContextProvider is preserved */}
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}