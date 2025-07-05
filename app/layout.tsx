import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'WorldTree',
  description: 'Build your family tree, discover heritage, and connect with relatives on-chain',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WorldTree',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overscroll-none">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body 
        className={cn(
          inter.className,
          "flex flex-col min-h-[100dvh] overscroll-none touch-pan-y bg-background antialiased"
        )}
      >
        <ClientProviders>
          <div className="flex-1 flex flex-col w-full max-w-screen-sm mx-auto bg-white relative">
            <main className="flex-1 overflow-y-auto overscroll-none">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
