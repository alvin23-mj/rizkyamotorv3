'use client';

import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white min-h-[75vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      {/* Import Space Grotesk Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-3xl w-full text-center space-y-10">
        {/* Title with Space Grotesk Font */}
        <h1
          className="text-3xl sm:text-5xl font-extrabold text-slate-900 text-center tracking-tight py-2 mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Tentang {settings?.name || 'Rizkya Motor'}
        </h1>

        {/* Pure Text Paragraphs with extra wide vertical line height (leading-[2.3]) & paragraph spacing (space-y-8) */}
        <div
          className="space-y-8 text-slate-700 text-sm sm:text-base leading-[2.3] text-center"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <p>
            <strong>{settings?.name || 'Rizkya Motor'}</strong> adalah showroom dan platform otomotif terpercaya yang melayani jual beli mobil bekas dan baru berkualitas tinggi dengan standar transparansi terbaik.
          </p>

          <p>
            Setiap kendaraan yang kami hadirkan telah melalui proses inspeksi ketat lebih dari 160 titik pemeriksaan mencakup kelayakan mesin, kondisi bodi, kelistrikan, serta keabsahan seluruh dokumen legalitas kendaraan di Kepolisian resmi.
          </p>

          <p>
            Komitmen utama kami adalah memberikan ketenangan pikiran bagi setiap konsumen melalui garansi terbebas dari bekas banjir dan kecelakaan besar, harga jujur bersaing, serta kemudahan transaksi tukar tambah maupun pengajuan test drive online secara fleksibel.
          </p>
        </div>
      </div>
    </div>
  );
}
