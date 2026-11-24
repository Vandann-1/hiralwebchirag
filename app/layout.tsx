import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hiralxchirag.wedding'),
  title: 'Hiral & Chirag — Royal Wedding Invitation',
  description: 'Together with the blessings of our families, we joyfully invite you to celebrate our royal wedding on 11th & 12th February 2027.',
  openGraph: {
    title: 'Hiral & Chirag — Royal Wedding Invitation',
    description: 'We joyfully invite you to celebrate the wedding of Hiral & Chirag on 11-12 February 2027.',
    images: ['/assets/images/hc-monogram.svg'],
    type: 'website',
  },
  icons: {
    icon: '/assets/images/hc-monogram.svg',
    apple: '/assets/images/hc-monogram.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#120C06',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="desktop-backdrop" />
        {children}
      </body>
    </html>
  );
}
