SET `foreign_key_checks` = 0;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`
(
  `id` INT NOT NULL,
  `pw` CHAR(64) NOT NULL,
  `salt` CHAR(64) NOT NULL,
  `uname` VARCHAR(127) NOT NULL,
  `bdate` DATE NOT NULL,
  `fname` VARCHAR(127) NOT NULL,
  `mname` VARCHAR(127) NOT NULL,
  `lname` VARCHAR(127) NOT NULL,
  `sex` ENUM('M','F'),
  `email` VARCHAR(127) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE (`uname`),
  UNIQUE (`email`)
);

DROP TABLE IF EXISTS `file`;
CREATE TABLE `file`
(
  `id` CHAR(64) NOT NULL,
  `type` VARCHAR(127) NOT NULL,
  `content` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `image`;
CREATE TABLE `image`
(
  `file_id` CHAR(64) NOT NULL,
  PRIMARY KEY (`file_id`),
  FOREIGN KEY (`file_id`)
    REFERENCES `file`(`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

DROP TABLE IF EXISTS `board`;
CREATE TABLE `board`
(
  `name` VARCHAR(127) NOT NULL,
  `id` INT NOT NULL,
  `admin_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`admin_id`)
    REFERENCES `user`(`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE

);

DROP TABLE IF EXISTS `xref_board_mod`;
CREATE TABLE `xref_board_mod`
(
  `board_id` INT NOT NULL,
  `mod_id` INT NOT NULL,
  PRIMARY KEY (`board_id`, `mod_id`),
  FOREIGN KEY (`board_id`)
    REFERENCES `board`(`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (`mod_id`)
    REFERENCES `user`(`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

DROP TABLE IF EXISTS `article`;
CREATE TABLE `article`
(
  `id` INT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `ctime` DATETIME NOT NULL,
  `mtime` DATETIME NOT NULL,
  `title` DATETIME NOT NULL,
  `vcount` INT NOT NULL,
  `upcount` INT NOT NULL,
  `dwcount` INT NOT NULL,
  `prev_id` INT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`prev_id`)
    REFERENCES `article`(`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`
(
  `id` INT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `ctime` DATETIME NOT NULL,
  `mtime` DATETIME NOT NULL,
  `upcount` INT NOT NULL,
  `dwcount` INT NOT NULL,
  `article_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `image_id` CHAR(64),
  `parent_id` INT,
  CHECK (`upcount` >= 0),
  CHECK (`dwcount` >= 0),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`)
    REFERENCES `article`(`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (`user_id`)
    REFERENCES `user`(`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (`image_id`)
    REFERENCES `image`(`file_id`),
  FOREIGN KEY (`parent_id`)
    REFERENCES `comment`(`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

DROP TABLE IF EXISTS `xref_image_article`;
CREATE TABLE `xref_image_article`
(
  `image_id` CHAR(64) NOT NULL,
  `article_id` INT NOT NULL,
  PRIMARY KEY (`image_id`, `article_id`),
  FOREIGN KEY (`image_id`)
    REFERENCES `image`(`file_id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (`article_id`)
    REFERENCES `article`(`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

SET `foreign_key_checks` = 1;
