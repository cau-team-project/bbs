const schema = require('./schema')
const express = require('express')
const express_graphql = require('express-graphql')

const app = express()

app.use('/graphql', express_graphql({ 
  schema,
  graphiql: true
}))

function sigHandler() {
  console.log('signal received')
  process.exit()
}

function exitHandler() {
  console.log('goodbye world')
  // connection.end()
  process.exit()
}

process.on('exit', exitHandler);
process.on('SIGINT', sigHandler);
process.on('SIGUSR1', sigHandler);
process.on('SIGUSR2', sigHandler);

app.listen(8000, () => {
  console.log('server started 8000')
})
