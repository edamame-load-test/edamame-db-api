require("dotenv").config()

const { Pool } = require("pg")

const pool = new Pool()

module.exports = {
  query: (text, params) => {
    return pool.query(text, params)
  },
  checkConnection: () => {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error connecting to PG: ', err.stack)
      }
      client.query('SELECT NOW()', (err, result) => {
        release()
        if (err) {
          return console.error('Error executing PG query: ', err.stack)
        }
        console.log(`Connected to PG: ${result.rows[0].now}`)
      })
    })
  }
}