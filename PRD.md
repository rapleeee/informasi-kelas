# 📋 PRD Final — Website Pengumuman SMK Informatika Pesat

> **Status**: ✅ Siap Diimplementasi — Semua open questions sudah terjawab

## Ringkasan Proyek

Website pengumuman resmi untuk **SMK Informatika Pesat** yang menampilkan informasi penerimaan/pembagian kelas siswa baru. Pengumuman dijadwalkan pada **Senin, 13 Juli 2026 pukul 07.00 WIB**. Sebelum tanggal tersebut, website menampilkan countdown timer. Setelah pengumuman live, siswa dapat mencari informasi kelas mereka menggunakan NIS.

---

## 🎯 Target Pengguna

| Peran | Akses | Deskripsi |
|---|---|---|
| **Siswa / Orang Tua** | Publik (tanpa login) | Mengecek informasi kelas via NIS |
| **Admin** | Login required | Mengelola data siswa, master kelas & pengaturan |

---

## ✅ Keputusan Teknis Final

| Topik | Keputusan |
|---|---|
| Database | **PostgreSQL** langsung (production-ready dari awal) |
| Quotes | **API eksternal** bahasa Indonesia → fallback ke quotes lokal jika down |
| Import Siswa | **Import Excel** + download template + **preview sebelum simpan** + laporan error |
| Daftar Kelas | **Dropdown dari Master Kelas** (ada halaman CRUD tersendiri) |
| Jadwal Datang | **Global untuk semua siswa** — Rabu, 15 Juli 2026 |

---

## 🖥️ Tech Stack Final

### Frontend
| Layer | Teknologi | Versi | Status |
|---|---|---|---|
| Framework | **Next.js** (App Router) | 16.2.10 | ✅ Ada |
| Language | **TypeScript** | ^5 | ✅ Ada |
| Styling | **Tailwind CSS v4** | ^4 | ✅ Ada |
| UI Components | **shadcn/ui** | latest | 🔧 Install |
| Animasi UI | **React Bits** | latest | 🔧 Install |
| Animasi Lottie | **@lottiefiles/dotlottie-react** | latest | 🔧 Install |
| Icons | **Lucide React** | latest | 🔧 Install |
| Form | **React Hook Form + Zod** | latest | 🔧 Install |
| Tabel Data | **@tanstack/react-table** | latest | 🔧 Install |

### Backend / Database
| Layer | Teknologi | Keterangan |
|---|---|---|
| API | **Next.js API Routes** | Built-in, App Router |
| ORM | **Prisma** | Type-safe, migration, seeding |
| Database | **PostgreSQL** | Production-ready dari awal |
| Auth | **NextAuth.js v5 (Auth.js)** | Credentials provider untuk admin |
| Password | **bcryptjs** | Hashing password |
| Excel | **xlsx (SheetJS)** | Parse file Excel dari client |
| Excel Export | **xlsx (SheetJS)** | Generate template Excel |

### External API
| Layanan | URL | Keterangan |
|---|---|---|
| Quotes ID | `https://api.quotable.io/quotes/random?language=id` | Prioritas utama |
| Fallback | `forismatic.com/api/1.0/?method=getQuote&lang=id` | Jika Quotable tidak ada |
| Fallback lokal | `lib/quotes-local.ts` | Jika semua API down |

---

## 📐 Arsitektur Sistem

```
informasi-kelas/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Publik: countdown / pengumuman
│   ├── cari/
│   │   └── page.tsx                    # (redirect ke /) cari NIS sudah di halaman utama
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx               # Login admin
│   │   └── dashboard/
│   │       ├── layout.tsx             # Sidebar layout admin
│   │       ├── page.tsx               # Dashboard overview
│   │       ├── siswa/
│   │       │   └── page.tsx           # CRUD siswa + import Excel
│   │       ├── kelas/
│   │       │   └── page.tsx           # Master kelas (CRUD)
│   │       └── pengaturan/
│   │           └── page.tsx           # Pengaturan pengumuman
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── siswa/
│       │   ├── route.ts               # GET all, POST single
│       │   ├── [id]/route.ts          # GET, PUT, DELETE
│       │   ├── cari/route.ts          # GET by NIS (publik)
│       │   └── import/route.ts        # POST import Excel (admin)
│       ├── kelas/
│       │   ├── route.ts               # GET all, POST kelas
│       │   └── [id]/route.ts          # PUT, DELETE kelas
│       ├── pengaturan/route.ts        # GET + PUT pengaturan
│       └── quotes/route.ts            # GET quotes Indonesia
├── components/
│   ├── ui/                            # shadcn/ui components
│   ├── countdown/
│   │   ├── CountdownTimer.tsx
│   │   └── CountdownCard.tsx
│   ├── publik/
│   │   ├── SearchNIS.tsx              # Form cari NIS
│   │   └── HasilPencarian.tsx         # Card hasil + quotes
│   ├── admin/
│   │   ├── Sidebar.tsx
│   │   ├── siswa/
│   │   │   ├── SiswaTable.tsx
│   │   │   ├── SiswaFormModal.tsx
│   │   │   ├── DeleteConfirmDialog.tsx
│   │   │   ├── ImportExcelModal.tsx   # Upload + preview + konfirmasi
│   │   │   └── ImportPreviewTable.tsx # Tabel preview sebelum import
│   │   ├── kelas/
│   │   │   ├── KelasTable.tsx
│   │   │   └── KelasFormModal.tsx
│   │   └── pengaturan/
│   │       └── PengaturanForm.tsx
│   └── shared/
│       └── LottiePlayer.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── quotes.ts                      # Quotes service + fallback
│   ├── quotes-local.ts                # Daftar quotes lokal bahasa Indonesia
│   ├── excel.ts                       # Util generate template + parse upload
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── middleware.ts                      # Proteksi route /admin/*
```

---

## 🗄️ Database Schema (PostgreSQL)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}

model Kelas {
  id        Int      @id @default(autoincrement())
  namaKelas String   @unique   // contoh: "X-RPL-1", "X-TKJ-2"
  jurusan   String             // contoh: "Rekayasa Perangkat Lunak"
  siswa     Siswa[]
  createdAt DateTime @default(now())
}

model Siswa {
  id           Int      @id @default(autoincrement())
  nis          String   @unique
  namaLengkap  String
  kelasId      Int
  kelas        Kelas    @relation(fields: [kelasId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Pengaturan {
  id                Int      @id @default(1)  // Singleton (satu baris saja)
  tanggalPengumuman DateTime
  jadwalDatang      String   // "Rabu, 15 Juli 2026 pukul 07.00 WIB"
  judulPengumuman   String
  deskripsiSingkat  String
  updatedAt         DateTime @updatedAt
}
```

---

## 🌐 Halaman & Fitur Detail

### 1. 🏠 Halaman Publik — Sebelum Pengumuman (`/`)

**Trigger**: `now() < tanggalPengumuman`

| Elemen | Detail |
|---|---|
| Header | Logo + Nama Sekolah dengan animasi masuk (React Bits `TextAnimate`) |
| Subtitle | "Pengumuman Resmi Pembagian Kelas TP 2026/2027" |
| Countdown | 4 card: Hari / Jam / Menit / Detik — update tiap detik |
| Animasi Lottie | Animasi jam atau sekolah, loop |
| Pesan | "Pengumuman akan segera tersedia. Pantau terus halaman ini!" |
| Background | Dark gradient + partikel animasi |

---

### 2. 🔍 Halaman Publik — Setelah Pengumuman (`/`)

**Trigger**: `now() >= tanggalPengumuman`

| Elemen | Detail |
|---|---|
| Header | Logo + nama sekolah |
| Banner | "🎉 Pengumuman Resmi Telah Dibuka!" |
| Form Cari NIS | Input NIS + tombol "Cek Sekarang" |
| Loading | Animasi Lottie loading saat fetch |
| Hasil ditemukan | Card berisi: Nama, NIS, Kelas, Jadwal Datang, Quotes |
| Quotes | Tampil di bawah hasil dengan style italic, warna berbeda |
| Error | Animasi Lottie "not found" + pesan "NIS tidak ditemukan" |

**Format Kartu Hasil:**
```
╔══════════════════════════════════╗
║  🎓 Selamat! Kamu diterima di:   ║
║  Nama   : Budi Santoso           ║
║  NIS    : 20260001               ║
║  Kelas  : X-RPL-1                ║
║  Jadwal : Rabu, 15 Juli 2026     ║
║           pukul 07.00 WIB        ║
║  ──────────────────────────────  ║
║  💬 "Pendidikan adalah senjata   ║
║  paling ampuh untuk mengubah     ║
║  dunia." — Nelson Mandela        ║
╚══════════════════════════════════╝
```

---

### 3. 🔐 Admin Login (`/admin/login`)

- Form username + password
- Validasi Zod
- Session via NextAuth + JWT
- Animasi Lottie saat submit

---

### 4. 📊 Admin Dashboard (`/admin/dashboard`)

**Sidebar:**
- 📊 Dashboard
- 👥 Data Siswa
- 🏫 Master Kelas
- ⚙️ Pengaturan
- 🚪 Logout

**Konten Dashboard:**
- Jumlah total siswa
- Jumlah kelas aktif
- Status pengumuman (Live / Countdown)
- Tanggal pengumuman & jadwal datang

---

### 5. 👥 Admin — Data Siswa (`/admin/dashboard/siswa`)

#### Tabel Siswa
| Kolom | Keterangan |
|---|---|
| No | Nomor urut |
| NIS | Nomor Induk Siswa |
| Nama Lengkap | Nama siswa |
| Kelas | Dropdown dari master kelas |
| Aksi | Edit \| Hapus |

#### Fitur
- Search by nama / NIS / kelas
- Sort kolom
- Pagination
- Tombol **"+ Tambah Siswa"** → modal form
- Tombol **"Import Excel"** → modal import
- Tombol **"Download Template"** → unduh file `.xlsx`

#### Modal Form Siswa (Create / Edit)
```
NIS          : [input teks]
Nama Lengkap : [input teks]
Kelas        : [dropdown dari master kelas]
```

#### Modal Import Excel

**Alur:**
```
1. User klik "Import Excel"
2. Modal muncul
3. User download template (opsional) → file: template_import_siswa.xlsx
4. User upload file Excel (.xlsx / .xls)
5. Preview tabel muncul di modal:
   - Baris valid   : latar hijau muda ✅
   - Baris error   : latar merah muda ❌ + tooltip/keterangan error
   (contoh error: NIS sudah ada, kelas tidak ditemukan, kolom kosong)
6. Ringkasan: "X baris valid, Y baris gagal"
7. Tombol "Simpan Data Valid" → hanya import baris yang valid
8. Tombol "Batal"
```

**Format Template Excel:**
| NIS | Nama Lengkap | Kode Kelas |
|---|---|---|
| 20260001 | Budi Santoso | X-RPL-1 |
| 20260002 | Siti Rahayu | X-TKJ-1 |

> ⚠️ Kolom "Kode Kelas" harus sesuai dengan nama kelas di Master Kelas

---

### 6. 🏫 Admin — Master Kelas (`/admin/dashboard/kelas`)

#### Tabel Kelas
| Kolom | Keterangan |
|---|---|
| No | Nomor urut |
| Nama Kelas | Contoh: X-RPL-1 |
| Jurusan | Contoh: Rekayasa Perangkat Lunak |
| Jumlah Siswa | Auto-count dari relasi |
| Aksi | Edit \| Hapus |

> **Catatan**: Kelas tidak bisa dihapus jika masih ada siswa yang terdaftar di dalamnya.

#### Modal Form Kelas
```
Nama Kelas : [input teks] (misal: X-RPL-1)
Jurusan    : [input teks] (misal: Rekayasa Perangkat Lunak)
```

---

### 7. ⚙️ Admin — Pengaturan (`/admin/dashboard/pengaturan`)

```
Tanggal Pengumuman  : [datetime picker]  → default: 13 Juli 2026 07:00
Jadwal Datang       : [input teks]       → default: "Rabu, 15 Juli 2026 pukul 07.00 WIB"
Judul Pengumuman    : [input teks]
Deskripsi Singkat   : [textarea]
[Simpan Perubahan]
```

---

## 🎨 Desain & Animasi

### Color Palette
| Nama | Hex | Kegunaan |
|---|---|---|
| Primary | `#6C63FF` | CTA, highlight, accent |
| Secondary | `#22D3EE` | Countdown cards, borders |
| Accent Gold | `#F59E0B` | Badge, quotes section |
| Dark BG | `#0A0A1A` | Background halaman |
| Card BG | `rgba(255,255,255,0.05)` | Glassmorphism cards |
| Text Primary | `#F0F0FF` | Teks utama |
| Text Muted | `#8888AA` | Label, keterangan |

### Lottie Animations
| Halaman | Animasi | Play Mode |
|---|---|---|
| Countdown | Jam / rocket | Loop |
| Hasil ditemukan | Confetti / sukses | One-shot |
| NIS tidak ditemukan | Not found / search | One-shot |
| Admin login | Lock / security | Loop idle |
| Import loading | Upload / cloud | Loop saat proses |

### React Bits Components
| Komponen | Digunakan di |
|---|---|
| `TextAnimate` | Judul halaman utama |
| `BlurFade` | Card hasil pencarian |
| `NumberTicker` | Angka countdown |
| `AnimatedShinyText` | Badge "Pengumuman Live" |
| `Meteors` / `Particles` | Background halaman countdown |

---

## 📡 API Endpoints Final

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/signin` | — | Login admin |
| `GET` | `/api/siswa/cari?nis=xxx` | — | Cari siswa by NIS (publik) |
| `GET` | `/api/siswa` | Admin | Ambil semua siswa |
| `POST` | `/api/siswa` | Admin | Tambah siswa |
| `PUT` | `/api/siswa/:id` | Admin | Update siswa |
| `DELETE` | `/api/siswa/:id` | Admin | Hapus siswa |
| `POST` | `/api/siswa/import` | Admin | Import batch dari Excel |
| `GET` | `/api/kelas` | — | Ambil semua kelas |
| `POST` | `/api/kelas` | Admin | Tambah kelas |
| `PUT` | `/api/kelas/:id` | Admin | Update kelas |
| `DELETE` | `/api/kelas/:id` | Admin | Hapus kelas |
| `GET` | `/api/pengaturan` | — | Ambil pengaturan |
| `PUT` | `/api/pengaturan` | Admin | Update pengaturan |
| `GET` | `/api/quotes` | — | Quotes Indonesia random |

---

## 🌱 Data Seeding

```typescript
// prisma/seed.ts — Data default yang akan di-seed

// Admin
{ username: "admin", email: "admin@smkpesat.sch.id", password: bcrypt("Admin@1234") }

// Master Kelas (contoh)
[
  { namaKelas: "X-RPL-1", jurusan: "Rekayasa Perangkat Lunak" },
  { namaKelas: "X-RPL-2", jurusan: "Rekayasa Perangkat Lunak" },
  { namaKelas: "X-TKJ-1", jurusan: "Teknik Komputer dan Jaringan" },
  { namaKelas: "X-TKJ-2", jurusan: "Teknik Komputer dan Jaringan" },
  { namaKelas: "X-MM-1",  jurusan: "Multimedia" },
]

// Pengaturan
{
  tanggalPengumuman: new Date("2026-07-13T07:00:00+07:00"),
  jadwalDatang: "Rabu, 15 Juli 2026 pukul 07.00 WIB",
  judulPengumuman: "Pengumuman Resmi Pembagian Kelas TP 2026/2027",
  deskripsiSingkat: "Selamat datang di keluarga besar SMK Informatika Pesat! ..."
}
```

---

## 📦 Paket yang Perlu Diinstall

```bash
# UI Components
npx shadcn@latest init
npm install lucide-react

# Animasi
npm install @lottiefiles/dotlottie-react

# Auth & Security
npm install next-auth@beta @auth/prisma-adapter
npm install bcryptjs && npm install -D @types/bcryptjs

# Database ORM
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql

# Form & Validation
npm install react-hook-form zod @hookform/resolvers

# Tabel & Data
npm install @tanstack/react-table

# Excel
npm install xlsx

# Date utility
npm install date-fns
```

---

## 🚀 Fase Implementasi

### Fase 1 — Setup & Fondasi
- [ ] Install semua dependencies
- [ ] Setup Prisma schema + PostgreSQL connection
- [ ] Buat migration + jalankan seeding
- [ ] Setup NextAuth credentials provider
- [ ] Setup middleware proteksi route `/admin/*`

### Fase 2 — Halaman Publik
- [ ] Halaman countdown (sebelum pengumuman)
- [ ] Halaman cari NIS + kartu hasil
- [ ] API `/api/siswa/cari`
- [ ] API `/api/quotes` (eksternal + fallback lokal)
- [ ] Integrasi Lottie & React Bits

### Fase 3 — Admin: Auth & Dashboard
- [ ] Halaman login admin
- [ ] Layout dashboard + sidebar
- [ ] Halaman dashboard overview

### Fase 4 — Admin: Master Kelas
- [ ] Tabel kelas + CRUD
- [ ] API kelas

### Fase 5 — Admin: Data Siswa
- [ ] Tabel siswa + CRUD manual (form modal)
- [ ] Import Excel: upload → parse → preview → simpan
- [ ] Download template Excel
- [ ] API siswa + `/api/siswa/import`

### Fase 6 — Admin: Pengaturan
- [ ] Form pengaturan pengumuman
- [ ] API pengaturan

### Fase 7 — Polish & Testing
- [ ] Responsif mobile
- [ ] Error states & loading states
- [ ] Animasi & transisi
- [ ] End-to-end testing manual
