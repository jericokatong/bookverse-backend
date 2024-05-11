/*
  Warnings:

  - The primary key for the `authentication` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `authentication` DROP PRIMARY KEY,
    MODIFY `token` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`token`);
