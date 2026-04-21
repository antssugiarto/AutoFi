import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import Providers from "./providers";
import { GlobalStateProvider } from "./lib/GlobalStateContext";
import { Toaster } from "react-hot-toast";
import ScrollToTopButton from "./components/scroll-to-top";
import "./globals.css";
import '@solana/wallet-adapter-react-ui/styles.css';

const manrope = Manrope({
  variable: "--font-manrope",
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
  title: "AutoFi",
  description: "AutoFi DeFi Automation",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
      className={`${manrope.variable} ${inter.variable} dark`}
    >
      <head>
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/icon.png" as="image" />
      </head>
      <body className="min-h-screen flex flex-col">
        <GlobalStateProvider>
          <Providers>
            <Toaster position="top-center" toastOptions={{
              style: {
                background: '#1a1a24',
                color: '#fff',
                border: '1px solid rgba(163, 166, 255, 0.2)',
                borderRadius: '16px',
              }
            }} />
            {children}
            <ScrollToTopButton />
          </Providers>
        </GlobalStateProvider>
      </body>
    </html>
  );
}
