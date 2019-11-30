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
  SHA2('pw', 256),
  SHA2('salt', 256),
  3,
  CURDATE(),
  'john',
  NULL,
  'doe',
  'M',
  'dragon@dragonmail.com'
);
