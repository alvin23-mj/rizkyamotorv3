'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ComparisonDrawer from '@/components/cars/ComparisonDrawer';
import ChatbotWidget from '@/components/layout/ChatbotWidget';

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/dashboard/admin');

  useEffect(() => {
    if (isAdminRoute || typeof document === 'undefined') return;

    let tabTitle = 'Beranda | Rizkya Motor';
    if (pathname === '/') {
      tabTitle = 'Beranda | Rizkya Motor';
    } else if (pathname === '/cars') {
      tabTitle = 'Katalog Mobil | Rizkya Motor';
    } else if (pathname?.startsWith('/cars/')) {
      tabTitle = 'Detail Mobil | Rizkya Motor';
    } else if (pathname === '/sell') {
      tabTitle = 'Jual Mobil | Rizkya Motor';
    } else if (pathname === '/schedule') {
      tabTitle = 'Test Drive | Rizkya Motor';
    } else if (pathname === '/events') {
      tabTitle = 'Event & Promo | Rizkya Motor';
    } else if (pathname === '/about') {
      tabTitle = 'Tentang Kami | Rizkya Motor';
    } else if (pathname === '/contact') {
      tabTitle = 'Kontak | Rizkya Motor';
    } else if (pathname === '/compare') {
      tabTitle = 'Komparasi | Rizkya Motor';
    } else if (pathname === '/favorites') {
      tabTitle = 'Mobil Favorit | Rizkya Motor';
    } else if (pathname === '/login') {
      tabTitle = 'Masuk | Rizkya Motor';
    } else if (pathname === '/register') {
      tabTitle = 'Daftar | Rizkya Motor';
    } else if (pathname === '/dashboard') {
      tabTitle = 'Dashboard | Rizkya Motor';
    } else if (pathname === '/dashboard/chat') {
      tabTitle = 'Chat Konsultasi | Rizkya Motor';
    } else if (pathname === '/dashboard/favorites') {
      tabTitle = 'Favorit Saya | Rizkya Motor';
    } else if (pathname === '/dashboard/listings/create') {
      tabTitle = 'Jual Mobil | Rizkya Motor';
    }

    document.title = tabTitle;
  }, [pathname, isAdminRoute]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <ComparisonDrawer />
      <Footer />
    </>
  );
}
