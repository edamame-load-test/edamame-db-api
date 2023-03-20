const crypto = require('crypto')
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

  create: async (data) => {
    const query = `INSERT INTO tests (name, script)
                    VALUES ($1, $2)
                    RETURNING id, name, start_time, end_time, status, script;`
    try {
      const result = await db.query(query, [data.name, data.script]);
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
    let query;
    let params;
    if (Object.keys(data).includes('name')) {
      query = `UPDATE tests SET name = $1 
                WHERE id = $2
                RETURNING id, 
                          name, 
                          start_time, 
                          end_time, 
                          status, 
                          script;`;
      params = [data.name, id]
    } else if (Object.keys(data).includes('status')) {
      if (data.status === 'completed') {
        query = `UPDATE tests 
                  SET status = $1, end_time = now()
                  WHERE id = $2
                  RETURNING id, 
                            name, 
                            start_time, 
                            end_time, 
                            status, 
                            script;`;
      } else {
        query = `UPDATE tests SET status = $1
                  WHERE id = $2
                  RETURNING id, 
                            name, 
                            start_time, 
                            end_time, 
                            status, 
                            script;`;
      }
      params = [data.status, id]
    }
    try {
      const result = await db.query(query, params);
      return result.rows[0]
    } catch (err) {
      console.log(err)
    }
  },

  validKeys: (data) => {
    const keys = Object.keys(data);
    return keys.includes('name') || keys.includes('status');
  },

  createName: () => {
    return crypto.randomUUID()
  },

  cleanScriptString: (script) => {
    return script.replace(/'/g, "''");
  },

  invalidName: (name) => {
    const names = this.getAll().map(test => test.name)
    return name.length > 80 || names.includes(name)
  }
}

module.exports = tests
