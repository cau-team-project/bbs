INSERT INTO `user` (
  `uname`,
  `pw`,
  `salt`,
  `level`,
  `bdate`,
  `fname`,
  `mname`,
  `lname`,
  `sex`,
  `email`
)
VALUES(
  'admin',
  SHA2('pw', 256),
  SHA2('salt', 256),
  9,
  CURDATE(),
  'admin',
  NULL,
  'mr',
  'M',
  'admin@example.com'
);

INSERT INTO `user` (
  `uname`,
  `pw`,
  `salt`,
  `level`,
  `bdate`,
  `fname`,
  `mname`,
  `lname`,
  `sex`,
  `email`
)
VALUES(
  'user001',
  SHA2(RAND(), 256),
  SHA2('salt', 256),
  3,
  CURDATE(),
  'john',
  NULL,
  'doe',
  'M',
  'dragon@dragonmail.com'
);

INSERT INTO `board`(
  `name`,
  `admin_id`
)
SELECT
  'free' AS `name`,
  `id`
FROM `user`
WHERE `uname` = 'admin';

INSERT INTO `board`(
  `name`,
  `admin_id`
)
SELECT
  'notice' AS `name`,
  `id`
FROM `user`
WHERE `uname` = 'admin';
