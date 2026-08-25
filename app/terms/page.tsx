'use client';

import { useState, useEffect } from 'react';

export default function TermsAndConditionsPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  const showroomName = settings?.name || 'Rizkya Motor';

  return (
    <div className="bg-white min-h-[75vh] py-16 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Title Section */}
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Syarat & Ketentuan
          </h1>
          <p className="text-sm text-slate-500">
            Panduan dan ketentuan resmi pengoperasian layanan dan transaksi di {showroomName}.
          </p>
        </div>

        {/* Text Body */}
        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              1. Ketentuan Umum
            </h2>
            <p>
              Dengan mengakses situs web ini atau menggunakan layanan yang disediakan oleh {showroomName}, Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan yang berlaku di bawah ini:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pengguna wajib memberikan data identitas yang benar, akurat, dan dapat dipertanggungjawabkan saat melakukan reservasi test drive maupun pengajuan jual mobil.</li>
              <li>{showroomName} berhak memperbarui Syarat & Ketentuan ini sewaktu-waktu sesuai perkembangan hukum dan operasional showroom.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              2. Layanan Test Drive & Penjadwalan
            </h2>
            <p>
              Setiap calon pembeli dapat melakukan reservasi test drive unit mobil yang tersedia dengan ketentuan sebagai berikut:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pemesanan slot test drive harus diajukan minimal H-1 dari tanggal kedatangan yang diinginkan.</li>
              <li>Pengunjung wajib membawa Surat Izin Mengemudi (SIM A) asli yang masih berlaku saat menghadiri sesi test drive di showroom.</li>
              <li>Pihak {showroomName} berhak membatalkan atau menjadwalkan ulang sesi test drive apabila unit kendaraan yang bersangkutan telah terpasang uang tanda jadi (DP) oleh pembeli lain terlebih dahulu.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              3. Standar Inspeksi & Jaminan Unit
            </h2>
            <p>
              Semua unit kendaraan bekas yang dijual di showroom {showroomName} dijamin memenuhi standar kualitas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Garansi Bebas Banjir & Bebas Kecelakaan Besar:</strong> Kami memberikan jaminan buyback apabila unit terbukti pernah terendam banjir atau mengalami kecelakaan berstruktur rangka utama.</li>
              <li><strong>Keabsahan Dokumen Legalitas:</strong> Seluruh BPKB, STNK, dan Faktur telah melalui pemeriksaan keabsahan pada Samsat / Kepolisian resmi.</li>
              <li>Kondisi fisik dan mesin dijelaskan secara terbuka dan transparan sesuai hasil lembar inspeksi unit.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              4. Pembayaran & Pembatalan
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pembayaran transaksi pembelian unit hanya sah jika ditransfer ke rekening resmi atas nama showroom {showroomName} atau dilakukan melalui kasir resmi showroom.</li>
              <li>Uang tanda jadi (booking fee) diatur sesuai dengan kesepakatan tertulis pada Surat Pemesanan Kendaraan (SPK).</li>
            </ul>
          </section>

          {/* Section 5 Contact */}
          <section className="pt-6 border-t border-slate-200 space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              Butuh Bantuan Lebih Lanjut?
            </h2>
            <p className="text-slate-600 text-sm">
              Jika ada hal yang kurang jelas mengenai syarat & ketentuan di atas, silakan hubungi tim tim kami di <strong>{settings?.phone || '0812-3456-7890'}</strong> atau kunjungi langsung showroom {showroomName}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
