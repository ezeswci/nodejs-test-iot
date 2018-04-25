'use strict'

const debug = require('debug')('nodejs-test-iot:db:setup')
const db = require('./')

async function setup () {
  const config = {
    database: process.env.DB_NAME || 'iottest',
    username: process.env.DB_USER || 'iot',
    password: process.env.DB_PASS || 'iot',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }
  await db(config).catch(handleFatalError)
  console.log('Success!')
  process.exit(0)
}
setup()
function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}
