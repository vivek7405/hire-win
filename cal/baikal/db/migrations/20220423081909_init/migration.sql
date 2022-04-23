-- CreateTable
CREATE TABLE `addressbookchanges` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uri` VARBINARY(200) NOT NULL,
    `synctoken` INTEGER UNSIGNED NOT NULL,
    `addressbookid` INTEGER UNSIGNED NOT NULL,
    `operation` BOOLEAN NOT NULL,

    INDEX `addressbookid_synctoken`(`addressbookid`, `synctoken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addressbooks` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `principaluri` VARBINARY(255) NULL,
    `displayname` VARCHAR(255) NULL,
    `uri` VARBINARY(200) NULL,
    `description` TEXT NULL,
    `synctoken` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendarchanges` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uri` VARBINARY(200) NOT NULL,
    `synctoken` INTEGER UNSIGNED NOT NULL,
    `calendarid` INTEGER UNSIGNED NOT NULL,
    `operation` BOOLEAN NOT NULL,

    INDEX `calendarid_synctoken`(`calendarid`, `synctoken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendarinstances` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `calendarid` INTEGER UNSIGNED NOT NULL,
    `principaluri` VARBINARY(100) NULL,
    `access` BOOLEAN NOT NULL DEFAULT true,
    `displayname` VARCHAR(100) NULL,
    `uri` VARBINARY(200) NULL,
    `description` TEXT NULL,
    `calendarorder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `calendarcolor` VARBINARY(10) NULL,
    `timezone` TEXT NULL,
    `transparent` BOOLEAN NOT NULL DEFAULT false,
    `share_href` VARBINARY(100) NULL,
    `share_displayname` VARCHAR(100) NULL,
    `share_invitestatus` TINYINT NOT NULL DEFAULT 2,

    UNIQUE INDEX `calendarid`(`calendarid`, `principaluri`),
    UNIQUE INDEX `calendarid_2`(`calendarid`, `share_href`),
    UNIQUE INDEX `principaluri`(`principaluri`, `uri`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendarobjects` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `calendardata` MEDIUMBLOB NULL,
    `uri` VARBINARY(200) NULL,
    `calendarid` INTEGER UNSIGNED NOT NULL,
    `lastmodified` INTEGER UNSIGNED NULL,
    `etag` VARBINARY(32) NULL,
    `size` INTEGER UNSIGNED NOT NULL,
    `componenttype` VARBINARY(8) NULL,
    `firstoccurence` INTEGER UNSIGNED NULL,
    `lastoccurence` INTEGER UNSIGNED NULL,
    `uid` VARBINARY(200) NULL,

    UNIQUE INDEX `calendarid`(`calendarid`, `uri`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendars` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `synctoken` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `components` VARBINARY(21) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendarsubscriptions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uri` VARBINARY(200) NOT NULL,
    `principaluri` VARBINARY(100) NOT NULL,
    `source` TEXT NULL,
    `displayname` VARCHAR(100) NULL,
    `refreshrate` VARCHAR(10) NULL,
    `calendarorder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `calendarcolor` VARBINARY(10) NULL,
    `striptodos` BOOLEAN NULL,
    `stripalarms` BOOLEAN NULL,
    `stripattachments` BOOLEAN NULL,
    `lastmodified` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `principaluri`(`principaluri`, `uri`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cards` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `addressbookid` INTEGER UNSIGNED NOT NULL,
    `carddata` MEDIUMBLOB NULL,
    `uri` VARBINARY(200) NULL,
    `lastmodified` INTEGER UNSIGNED NULL,
    `etag` VARBINARY(32) NULL,
    `size` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groupmembers` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `principal_id` INTEGER UNSIGNED NOT NULL,
    `member_id` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `principal_id`(`principal_id`, `member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locks` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `owner` VARCHAR(100) NULL,
    `timeout` INTEGER UNSIGNED NULL,
    `created` INTEGER NULL,
    `token` VARBINARY(100) NULL,
    `scope` TINYINT NULL,
    `depth` TINYINT NULL,
    `uri` VARBINARY(1000) NULL,

    INDEX `token`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `principals` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uri` VARBINARY(200) NOT NULL,
    `email` VARBINARY(80) NULL,
    `displayname` VARCHAR(80) NULL,

    UNIQUE INDEX `uri`(`uri`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `propertystorage` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `path` VARBINARY(1024) NOT NULL,
    `name` VARBINARY(100) NOT NULL,
    `valuetype` INTEGER UNSIGNED NULL,
    `value` MEDIUMBLOB NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedulingobjects` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `principaluri` VARBINARY(255) NULL,
    `calendardata` MEDIUMBLOB NULL,
    `uri` VARBINARY(200) NULL,
    `lastmodified` INTEGER UNSIGNED NULL,
    `etag` VARBINARY(32) NULL,
    `size` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARBINARY(50) NULL,
    `digesta1` VARBINARY(32) NULL,

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
