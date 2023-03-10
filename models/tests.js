const db = require('./pg_client')

const tests = {
  get: async () => {
    const result = await db.query('SELECT * FROM tests;')
    return result.rows;
  },

  create: async () => {
    const result = await db.query('INSERT INTO tests DEFAULT VALUES RETURNING id;')
    return result.rows[0];
  }
}

module.exports = tests