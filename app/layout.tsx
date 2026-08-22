import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import { ComparisonProvider } from '@/context/ComparisonContext';
import PublicShell from '@/components/layout/PublicShell';

import { FavoritesProvider } from '@/context/FavoritesContext';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Beranda | Rizkya Motor',
  description:
    'Showroom resmi mobil bekas berkualitas di Indonesia. Garansi mesin 12 bulan, 160 titik inspeksi bersertifikat, bebas banjir & tabrakan. Melayani jual mobil & kredit DP ringan.',
  keywords: [
    'rizkya motor',
    'showroom mobil bekas',
    'jual mobil ke showroom',
    'kredit mobil dp ringan',
    'mobil bekas garansi 1 tahun',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${spaceGrotesk.className} bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ComparisonProvider>
            <FavoritesProvider>
              <PublicShell>
                {children}
              </PublicShell>
            </FavoritesProvider>
          </ComparisonProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
