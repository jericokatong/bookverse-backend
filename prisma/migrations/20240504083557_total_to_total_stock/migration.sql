/*
  Warnings:

  - You are about to drop the column `total` on the `book` table. All the data in the column will be lost.
  - Added the required column `total_stock` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `book` DROP COLUMN `total`,
    ADD COLUMN `total_stock` INTEGER NOT NULL;
