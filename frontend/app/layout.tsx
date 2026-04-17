import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { WalletProvider } from "@/app/lib/WalletContext";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoFi | Automate Your DeFi Goals",
  description:
    "Set your goal. We handle the rest. The intelligent layer for decentralized finance that prioritizes your outcomes over complexity.",
  keywords: ["DeFi", "automation", "yield", "Solana", "crypto", "AutoFi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} dark`}
    >
      <body className="min-h-screen flex flex-col">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
