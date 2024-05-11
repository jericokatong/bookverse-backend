-- CreateTable
CREATE TABLE `Book` (
    `id` VARCHAR(191) NOT NULL,
    `judul_buku` VARCHAR(191) NOT NULL,
    `nama_pengarang` VARCHAR(191) NOT NULL,
    `penerbit` VARCHAR(191) NOT NULL,
    `tahun_terbit` INTEGER NOT NULL,
    `isbn` VARCHAR(191) NOT NULL,
    `jumlah_tersedia` INTEGER NOT NULL,
    `jumlah_dipinjam` INTEGER NOT NULL,
    `total` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
