const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bbs'
})

connection.connect()
process.on('exit', connection.end)

module.exports = connection
