'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-slate-500">
            Komitmen kerahasiaan dan perlindungan data pribadi konsumen {showroomName}.
          </p>
        </div>

        {/* Text Body */}
        <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              1. Informasi yang Kami Kumpulkan
            </h2>
            <p>
              Kami mengumpulkan informasi tertentu saat Anda berinteraksi dengan layanan {showroomName}, baik melalui platform web maupun kunjungan langsung ke showroom kami. Informasi tersebut meliputi:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Data Diri Kontak:</strong> Nama lengkap, nomor telepon (WhatsApp), dan alamat email saat Anda mengajukan jadwal test drive, pengajuan jual mobil, atau komparasi unit.</li>
              <li><strong>Informasi Kendaraan:</strong> Detail kendaraan yang Anda masukkan pada formulir pengajuan jual mobil (merek, model, tahun, kilometer, ekspektasi harga, dan foto unit).</li>
              <li><strong>Data Transaksi & Interaksi:</strong> Riwayat pemesanan jadwal test drive, penawaran harga, serta catatan komunikasi dengan tim layanan pelanggan kami.</li>
              <li><strong>Data Teknis Otomatis:</strong> Alamat IP, tipe peramban (browser), dan data cookie dasar untuk mengoptimalkan performa situs web kami.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              2. Penggunaan Informasi
            </h2>
            <p>
              Informasi yang kami kumpulkan digunakan secara khusus untuk keperluan operasional showroom dan peningkatan kualitas pelayanan Anda, antara lain:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Memproses dan mengonfirmasi reservasi jadwal test drive kendaraan pilihan Anda.</li>
              <li>Menghubungi Anda terkait penawaran harga dan jadwal inspeksi unit pada pengajuan jual mobil.</li>
              <li>Memberikan informasi pembaruan status transaksi, dokumen kendaraan (STNK/BPKB), serta promo resmi showroom.</li>
              <li>Meningkatkan pengalaman navigasi dan fitur pada platform marketplace kami.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              3. Keamanan & Kerahasiaan Data
            </h2>
            <p>
              Kami menjamin bahwa {showroomName} <strong>tidak pernah dan tidak akan pernah menjual, menyewakan, atau memperjualbelikan data pribadi Anda</strong> kepada pihak ketiga mana pun tanpa persetujuan eksplisit dari Anda.
            </p>
            <p>
              Seluruh data pribadi disimpan menggunakan standar enkripsi dan sistem keamanan informasi terkini untuk mencegah akses tidak sah, pengungkapan, atau penyalahgunaan data.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              4. Hak dan Kontrol Pengguna
            </h2>
            <p>
              Anda memiliki hak penuh atas data pribadi yang telah diserahkan kepada kami. Anda berhak untuk:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Meminta salinan data pribadi yang kami simpan mengenai Anda.</li>
              <li>Memperbarui atau mengoreksi informasi pribadi yang tidak akurat.</li>
              <li>Meminta penghapusan data pribadi Anda dari database aktif kami kapan saja.</li>
            </ul>
          </section>

          {/* Section 5 Contact */}
          <section className="pt-6 border-t border-slate-200 space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              Pertanyaan Mengenai Privasi?
            </h2>
            <p className="text-slate-600 text-sm">
              Jika Anda memiliki pertanyaan atau kendala terkait Kebijakan Privasi ini, silakan hubungi tim tim kami di <strong>{settings?.phone || '0812-3456-7890'}</strong> atau email <strong>{settings?.email || 'info@rizkyamotor.com'}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
