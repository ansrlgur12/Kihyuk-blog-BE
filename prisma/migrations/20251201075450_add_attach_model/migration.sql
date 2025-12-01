-- CreateTable
CREATE TABLE `attaches` (
    `att_idx` INTEGER NOT NULL AUTO_INCREMENT,
    `att_target_type` VARCHAR(50) NULL,
    `att_target` VARCHAR(50) NULL,
    `att_origin` VARCHAR(255) NOT NULL,
    `att_filepath` VARCHAR(500) NOT NULL,
    `att_ext` VARCHAR(10) NULL,
    `att_is_image` VARCHAR(1) NULL,

    PRIMARY KEY (`att_idx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
