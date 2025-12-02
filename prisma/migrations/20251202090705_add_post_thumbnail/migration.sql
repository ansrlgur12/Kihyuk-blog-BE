/*
  Warnings:

  - Added the required column `post_thumbnail` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `posts` ADD COLUMN `post_thumbnail` VARCHAR(200) NOT NULL;
