import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import QueryProviders from "@/providers/query-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Liquid8",
    default: "Liquid8 - Liquidasi Retail Online", // a default is required when creating a template
  },
  description:
    "Perusahaan likuidasi hulu ke hiir pertama di Indonesia. Pusat grosir barang gagal kirim COD marketplace dengan diskon upto 70%.",
  // metadataBase: new URL("https://liquid8-new.vercel.app"),
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <QueryProviders>
          <NuqsAdapter>
            <Toaster />
            {children}
          </NuqsAdapter>
        </QueryProviders>
      </body>
    </html>
  );
}
