-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" SERIAL NOT NULL,
    "namaKelas" TEXT NOT NULL,
    "jurusan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siswa" (
    "id" SERIAL NOT NULL,
    "nis" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "kelasId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengaturan" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "tanggalPengumuman" TIMESTAMP(3) NOT NULL,
    "jadwalDatang" TEXT NOT NULL,
    "judulPengumuman" TEXT NOT NULL,
    "deskripsiSingkat" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kelas_namaKelas_key" ON "Kelas"("namaKelas");

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_nis_key" ON "Siswa"("nis");

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
