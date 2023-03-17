const db = require('./pg_client')

const tests = {
  getAll: async () => {
    try {
      const result = await db.query('SELECT * FROM tests ORDER BY start_time DESC;');
      return result.rows;
    } catch (err) {
      console.log(err);
    }
  },

  get: async (id) => {
    try {
      const result = await db.query('SELECT * FROM tests WHERE id = $1', [id])
      return result.rows[0];
    } catch (err) {
      console.log(err);
    }
  },

  create: async () => {
    try {
      const result = await db.query(
        'INSERT INTO tests DEFAULT VALUES RETURNING id;'
      );
      return result.rows[0];
    } catch (err) {
      console.log(err);
    }
  },

  delete: async (id) => {
    try {
      await db.query('DELETE FROM tests WHERE id = $1;', [id]);
    } catch (err) {
      console.log(err)
    }
  },

  edit: async (id, data) => {
    const params = Object.entries.flat(data).concat(id)
    const query = `UPDATE tests SET $1 = $2 WHERE id = $3
                     RETURNING id, name, start_time, end_time, status, script;`
    try {
      const result = await db.query(query, params);
      return result.rows[0]
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = tests
