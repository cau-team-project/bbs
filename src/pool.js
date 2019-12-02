const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'bbs-mariadb',
  user: 'root',
  password: 'root',
  database: 'bbs'
})

module.exports = pool
