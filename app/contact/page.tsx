'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  PhoneCall,
  Mail,
  Send,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: 'Konsultasi Unit & Stok',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.locations)) setLocations(data.locations);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const targetWa = settings?.whatsapp || '6281334785858';
    const formattedText = encodeURIComponent(
      `Halo *Rizkya Motor Showroom*,\n\nSaya ingin bertanya/konsultasi:\n• *Nama*: ${formData.name}\n${formData.company ? `• *Perusahaan*: ${formData.company}\n` : ''}• *No. WA*: ${formData.phone}\n• *Email*: ${formData.email}\n• *Subjek*: ${formData.subject}\n\n*Pesan Pertanyaan*:\n"${formData.message}"`
    );

    const waUrl = `https://wa.me/${targetWa}?text=${formattedText}`;

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      window.open(waUrl, '_blank');
    }, 400);
  };

  const waText = encodeURIComponent(
    `Halo *Rizkya Motor Showroom*,\n\nSaya ${formData.name || 'Pelanggan'} (${formData.phone || ''}) ingin bertanya mengenai "${formData.subject}".\nPesan: ${formData.message}`
  );

  return (
    <div className="bg-slate-50/50 min-h-screen py-12 sm:py-16 text-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-start">
          
          {/* Left Column: Hubungi Kami & Info Grid */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-slate-400 font-bold text-xs tracking-wider block mb-2">
                Hubungi Kami
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Hubungi Kami, Siap Melayani Anda.
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed">
                Punya pertanyaan seputar unit mobil, konsultasi garansi, simulasi kredit, atau ingin menjadwalkan test drive? Tim konsultan kami siap melayani Anda.
              </p>
            </div>

            <div className="border-t border-slate-200" />

            {/* 4 Info Blocks in 2x2 Grid with Website Palette (Slate 900 Icon Boxes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Kantor Pusat */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kantor Pusat</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {settings?.address || 'Jl. Raya Otomotif No. 88, Kebayoran Baru, Jakarta Selatan'}
                  </p>
                </div>
              </div>

              {/* Dukungan Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dukungan Email</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug break-all">
                    info@rizkyamotor.co.id
                  </p>
                  <p className="text-xs text-slate-500 leading-snug break-all">
                    support@rizkyamotor.co.id
                  </p>
                </div>
              </div>

              {/* Hubungi Kami */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Telepon & WA</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Telepon: {settings?.phone || '0812-9988-7766'}
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">
                    WA: +62 {settings?.whatsapp || '812-9988-7766'}
                  </p>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Jam Operasional</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {settings?.operatingHoursText || 'Senin - Sabtu: 08.30 - 18.00'}
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">
                    Minggu: Sesi Test Drive
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200" />

            {/* Social Network Section with Website Palette (Slate 900 Circles) */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 block">
                Ikuti Media Sosial Kami
              </span>
              <div className="flex items-center gap-2.5">
                {/* Facebook */}
                <a
                  href={settings?.facebookUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 cursor-pointer"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={settings?.instagramUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 cursor-pointer"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href={settings?.tiktokUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 cursor-pointer"
                  title="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.96-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.56-1.28 2.55.02.99.57 1.94 1.42 2.45.92.56 2.12.56 3.04.04.88-.49 1.44-1.43 1.47-2.44.07-4.43.03-8.86.04-13.29z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={settings?.youtubeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 cursor-pointer"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* WhatsApp Direct */}
                <a
                  href={`https://wa.me/${settings?.whatsapp || '6281299887766'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 cursor-pointer"
                  title="WhatsApp Sales"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Kirimkan Pesan Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-10 shadow-lg border border-slate-200 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Kirimkan Pesan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Isi formulir di bawah ini dan konsultan showroom kami akan menghubungi Anda segera.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Pesan Berhasil Terkirim!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Terima kasih <strong>{formData.name}</strong>. Tim Sales Consultant Rizkya Motor akan segera merespon pertanyaan Anda.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/${settings?.whatsapp || '6281299887766'}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs"
                  >
                    Lanjutkan ke WhatsApp
                  </a>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        company: '',
                        email: '',
                        phone: '',
                        subject: 'Konsultasi Unit & Stok',
                        message: '',
                      });
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-6 py-3 rounded-xl border border-slate-300"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {/* Row 1: Nama & Perusahaan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Anda"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Perusahaan / Instansi</label>
                    <input
                      type="text"
                      placeholder="Nama Perusahaan (Opsional)"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Row 2: Telepon & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Nomor Telepon / WA *</label>
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Alamat Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Row 3: Subjek */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Subjek Pertanyaan</label>
                  <input
                    type="text"
                    placeholder="Subjek / Topik Pertanyaan"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Row 4: Pesan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Pesan Pertanyaan *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan pesan atau pertanyaan Anda disini..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-md tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Mengirim Pesan...' : 'Kirim Pesan'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Store Location Section - Full Width Map */}
        <div className="max-w-[1180px] mx-auto space-y-4 w-full pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Peta Lokasi Showroom {locations.length > 0 ? locations[0].name : (settings?.name || 'Utama')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kunjungi showroom kami secara langsung di {locations.length > 0 ? locations[0].address : (settings?.address || 'Alamat Showroom')}.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[22px] p-2.5 shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="bg-slate-100 rounded-[18px] overflow-hidden relative shadow-inner h-[420px] sm:h-[480px]">
              <iframe
                title={`Peta Lokasi Showroom ${settings?.name || ''}`}
                src={
                  locations.length > 0 && locations[0].mapUrl
                    ? locations[0].mapUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent(
                        locations.length > 0 ? locations[0].address : (settings?.address || 'Jakarta')
                      )}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                }
                className="w-full h-full border-0"
                loading="lazy"
              />
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 border border-slate-200 shadow-md flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-900" />
                <span>
                  {locations.length > 0 ? `${locations[0].name} — ${locations[0].address}` : `${settings?.name || 'Rizkya Motor'} — ${settings?.address || ''}`}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
