# MobilKu — Platform Jual Beli Mobil Bekas Model Bisnis HYBRID

**MobilKu** adalah platform digital jual beli mobil bekas dengan **Model Bisnis HYBRID**:
1. **Showroom Resmi (Official Showroom Inventory)** — Tim admin/owner platform mengunggah dan menjual stok mobil resmi bersertifikat 160 titik dengan garansi mesin 12 bulan.
2. **Marketplace C2C (Customer-to-Customer)** — Pengguna terdaftar (penjual individu) dapat memasang iklan jual mobil pribadi mereka secara langsung tanpa biaya komisi perantara.

---

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router, Server Actions & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Modern Automotive Visual Palette (Dark Slate #030712 + Navy + Emerald & Amber Badges)
- **Database & ORM**: PostgreSQL / SQLite via **Prisma ORM** v5
- **Autentikasi**: NextAuth.js (Credentials Provider + Role-Based Access Control)
- **State Management**: React Context API (`ComparisonContext` untuk komparasi melayang)

---

## Struktur Peran Pengguna (Roles)

1. **Guest** — Jelajah katalog, pencarian multi-filter, dan komparasi mobil tanpa login.
2. **Buyer** — Menyimpan favorit (wishlist), berkirim pesan chat internal ke penjual, dan melihat detail mobil.
3. **Seller Individu** — Memasang iklan mobil pribadi, mengelola listing (edit/hapus/terjual), dan memantau jumlah views.
4. **Admin / Showroom Manager** — Mengelola stok inventory Showroom Resmi, memoderasi & mengubah status listing C2C pengguna (Active/Draft/Sold/Rejected), serta mengelola statistik platform.

---

## Fitur Utama (MVP Phase 1)

1. **Badge Pembeda Model Bisnis**:
   - `Verified Showroom` (Emerald Badge) — Untuk unit dari showroom resmi.
   - `Dijual Pemilik Langsung` (Amber Badge) — Untuk iklan C2C pemilik pribadi.
2. **Pencarian & Multi-Filter Realtime**:
   - Autocomplete search (merek, model, deskripsi).
   - Filter kriteria: Rentang Harga, Tahun Pembuatan, Transmisi (Matic/Manual), Bahan Bakar (Bensin, Diesel, EV, Hybrid), Tipe Bodi (SUV, Sedan, MPV, Hatchback), serta Tipe Penjual (Showroom vs Pemilik Langsung).
   - Sorting: Termurah, Termahal, Tahun Terbaru, Kilometer Terendah.
3. **Halaman Detail Mobil Komprehensif**:
   - Multi-photo gallery & thumbnail viewer.
   - Tabel spesifikasi teknis terperinci (transmisi, mileage, jumlah pemilik, warna, lokasi).
   - Profil penjual + indikator WhatsApp / Chat Internal.
   - Rekomendasi mobil serupa (*Related Listings*).
4. **Komparasi Mobil Side-by-Side (`/compare`)**:
   - Membandingkan hingga 3 mobil sekaligus dalam tabel kontras.
   - Drawer melayang (*floating bottom bar*) di bagian bawah layar.
5. **Fitur Chat Internal Realtime (`/dashboard/chat`)**:
   - Percakapan terenkripsi antara Buyer & Seller tanpa perlu membagikan nomor HP langsung.
6. **Favorit & Wishlist (`/dashboard/favorites`)**:
   - Simpan mobil favorit untuk dipantau.
7. **Dashboard Multi-Role (`/dashboard`, `/dashboard/admin`)**:
   - Panel khusus per peran pengguna.

---

## Kredensial Demo Akun (Instant Login)

Anda dapat langsung mencoba login dengan kredensial bawaan (*password untuk semua akun:* `password123`):

| Peran (Role) | Email | Deskripsi |
| :--- | :--- | :--- |
| **Admin Showroom** | `admin@mobilku.id` | Akses penuh stok showroom & moderasi C2C |
| **Seller Verified** | `budi@gmail.com` | Penjual pribadi terverifikasi (Toyota Innova, Honda Brio) |
| **Seller Unverified**| `siti@gmail.com` | Penjual pribadi listrik (Hyundai IONIQ 5) |
| **Buyer** | `dani@gmail.com` | Pembeli terdaftar (memiliki chat & favorit aktif) |

---

## Cara Menjalankan Project Secara Lokal

1. **Clone repository & masuk ke folder:**
   ```bash
   cd auto-hybrid-marketplace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Inisialisasi Database & Seeding Data:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Jalankan Dev Server:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

---

## Roadmap Fitur Lanjutan (Phase 2)

Fitur berikut telah tercatat dalam rencana pengembangan Phase 2 setelah MVP rilis:
- [ ] **Histori Kendaraan**: Integrasi API pihak ketiga untuk riwayat klaim asuransi, kecelakaan, & banjir.
- [ ] **Sertifikasi & Inspeksi AI**: Sistem grading otomatis 160 titik dengan sertifikat PDF terunduh.
- [ ] **Simulasi Kredit & Leasing**: Kalkulator angsuran bulanan & integrasi pengajuan kredit bank/finance.
- [ ] **Estimasi Harga Pasar (AI Valuation)**: Algoritma membandingkan harga listing vs rata-rata pasaran.
- [ ] **Program Trade-In (Tukar Tambah)**: Fitur appraisal mobil lama untuk ditukar ke stok showroom.
- [ ] **Escrow Payment System**: Rekening bersama (rekber) untuk keamanan pembayaran transaksi online.
- [ ] **Rating & Review Penjual**: Sistem ulasan reputasi penjual C2C.
- [ ] **Video Walkaround 360°**: Player interaktif tampilan luar & dalam mobil 360 derajat.
