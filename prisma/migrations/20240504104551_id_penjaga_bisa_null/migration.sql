-- DropForeignKey
ALTER TABLE `borrowing_transaction` DROP FOREIGN KEY `Borrowing_Transaction_id_penjaga_fkey`;

-- AlterTable
ALTER TABLE `borrowing_transaction` MODIFY `id_penjaga` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Borrowing_Transaction` ADD CONSTRAINT `Borrowing_Transaction_id_penjaga_fkey` FOREIGN KEY (`id_penjaga`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
