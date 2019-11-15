CREATE TABLE user
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

CREATE TABLE file
(
  `id` CHAR(64) NOT NULL,
  `type` VARCHAR(127) NOT NULL,
  `content` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE image
(
  `file_id` CHAR(64) NOT NULL,
  PRIMARY KEY (`file_id`),
  FOREIGN KEY (`file_id`) REFERENCES `file`(`id`)
);

CREATE TABLE board
(
  `name` VARCHAR(127) NOT NULL,
  `id` INT NOT NULL,
  `admin_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`admin_id`) REFERENCES `user`(`id`)
);

CREATE TABLE xref_board_mod
(
  `board_id` INT NOT NULL,
  `mod_id` INT NOT NULL,
  PRIMARY KEY (`board_id`, `mod_id`),
  FOREIGN KEY (`board_id`) REFERENCES `board`(`id`),
  FOREIGN KEY (`mod_id`) REFERENCES `user`(`id`)
);

CREATE TABLE article
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
  FOREIGN KEY (`prev_id`) REFERENCES `article`(`id`)
);

CREATE TABLE comment
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
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES `article`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
  FOREIGN KEY (`image_id`) REFERENCES `image`(`file_id`),
  FOREIGN KEY (`parent_id`) REFERENCES `comment`(`id`)
);

CREATE TABLE xref_image_article
(
  `image_id` CHAR(64) NOT NULL,
  `article_id` INT NOT NULL,
  PRIMARY KEY (`image_id`, `article_id`),
  FOREIGN KEY (`image_id`) REFERENCES `image`(`file_id`),
  FOREIGN KEY (`article_id`) REFERENCES `article`(`id`)
);
