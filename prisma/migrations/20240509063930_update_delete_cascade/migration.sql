-- DropForeignKey
ALTER TABLE `borrowing_transaction` DROP FOREIGN KEY `Borrowing_Transaction_id_buku_fkey`;

-- DropForeignKey
ALTER TABLE `borrowing_transaction` DROP FOREIGN KEY `Borrowing_Transaction_id_peminjam_fkey`;

-- DropForeignKey
ALTER TABLE `borrowing_transaction` DROP FOREIGN KEY `Borrowing_Transaction_id_penjaga_fkey`;

-- AddForeignKey
ALTER TABLE `Borrowing_Transaction` ADD CONSTRAINT `Borrowing_Transaction_id_peminjam_fkey` FOREIGN KEY (`id_peminjam`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Borrowing_Transaction` ADD CONSTRAINT `Borrowing_Transaction_id_penjaga_fkey` FOREIGN KEY (`id_penjaga`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Borrowing_Transaction` ADD CONSTRAINT `Borrowing_Transaction_id_buku_fkey` FOREIGN KEY (`id_buku`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
