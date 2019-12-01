const schema = require('./schema')
const express = require('express')
const express_graphql = require('express-graphql')

const app = express()
const PORT = 8001

app.use('/graphql', express_graphql({ 
  schema,
  graphiql: true
}))

function sigHandler() {
  console.log('signal')
  process.exit()
}

function exitHandler() {
  console.log('goodbye')
  process.exit()
}

process.on('exit', exitHandler);
process.on('SIGINT', sigHandler);
process.on('SIGUSR1', sigHandler);
process.on('SIGUSR2', sigHandler);

app.listen(PORT, () => {
  console.log(`server started ${PORT}`)
})
.on('error', (err) => {
  console.log(err)
})
