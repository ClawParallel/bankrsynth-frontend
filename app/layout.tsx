import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BankrSynth Terminal",
  description: "Autonomous token deployment and AI market analysis on Base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 font-mono antialiased scanlines">
        {children}
      </body>
    </html>
  );
}
