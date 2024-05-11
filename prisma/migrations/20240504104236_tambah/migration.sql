-- CreateTable
CREATE TABLE `Borrowing_Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `id_peminjam` VARCHAR(191) NOT NULL,
    `id_penjaga` VARCHAR(191) NOT NULL,
    `id_buku` VARCHAR(191) NOT NULL,
    `status_peminjaman` ENUM('WAITING', 'APPROVED', 'REJECTED', 'RETURNED') NOT NULL DEFAULT 'WAITING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Borrowing_Transaction` ADD CONSTRAINT `Borrowing_Transaction_id_peminjam_fkey` FOREIGN KEY (`id_peminjam`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Borrowing_Transaction` ADD CONSTRAINT `Borrowing_Transaction_id_penjaga_fkey` FOREIGN KEY (`id_penjaga`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Borrowing_Transaction` ADD CONSTRAINT `Borrowing_Transaction_id_buku_fkey` FOREIGN KEY (`id_buku`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
