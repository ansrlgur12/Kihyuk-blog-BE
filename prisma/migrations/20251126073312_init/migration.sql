-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_email` VARCHAR(100) NOT NULL,
    `user_password` VARCHAR(255) NOT NULL,
    `user_nickname` VARCHAR(50) NOT NULL,
    `user_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_user_email_key`(`user_email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `post_id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_title` VARCHAR(200) NOT NULL,
    `post_content` TEXT NOT NULL,
    `post_author_id` INTEGER NOT NULL,
    `post_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `post_updated_at` DATETIME(3) NOT NULL,

    INDEX `posts_post_author_id_idx`(`post_author_id`),
    PRIMARY KEY (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `comment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `comment_content` TEXT NOT NULL,
    `comment_author_id` INTEGER NOT NULL,
    `comment_post_id` INTEGER NOT NULL,
    `comment_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `comments_comment_author_id_idx`(`comment_author_id`),
    INDEX `comments_comment_post_id_idx`(`comment_post_id`),
    PRIMARY KEY (`comment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_post_author_id_fkey` FOREIGN KEY (`post_author_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_comment_author_id_fkey` FOREIGN KEY (`comment_author_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_comment_post_id_fkey` FOREIGN KEY (`comment_post_id`) REFERENCES `posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;
