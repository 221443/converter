import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'File Converter Pro - Privacy-First Image & PDF Conversion',
  description: 'Convert images and PDFs instantly in your browser. No uploads, complete privacy, professional results.',
  keywords: ['image converter', 'pdf converter', 'privacy', 'client-side', 'batch conversion'],
  openGraph: {
    type: 'website',
    url: 'https://221443.github.io/converter/',
    title: 'File Converter Pro - Privacy-First Conversion',
    description: 'Convert images and PDFs instantly in your browser. No uploads, complete privacy.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'File Converter Pro',
    description: 'Convert images and PDFs instantly in your browser. No uploads, complete privacy.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.className} bg-gray-50`}>{children}</body>
    </html>
  );
}
