-- AlterTable
ALTER TABLE `comments` ADD COLUMN `comment_status` VARCHAR(1) NOT NULL DEFAULT 'Y';

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `post_status` VARCHAR(1) NOT NULL DEFAULT 'Y';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `user_status` VARCHAR(1) NOT NULL DEFAULT 'Y';
