const crypto = require('crypto');
const db = require('./pg_client');

const tests = {
  colsToReturn: () => {
    return (
      `RETURNING id, name, start_time, ` +
      `end_time, status, script, archive_id;`
    );
  },

  formatPatchQueryParams: (id, data) => {
    const { name, status, archive_id } = data;
    let colsToUpdate;
    let params = [id];

    if (name) {
      colsToUpdate = `name = $1`;
      params.unshift(name);
    } else if (status) {
      colsToUpdate = `status = $1`;
      if (status === 'completed') {
        colsToUpdate += `, end_time = now()`;
      }
      params.unshift(status);
    } else if (archive_id) {
      colsToUpdate = `archive_id = $1`;
      params.unshift(archive_id);
    }
    let query = `UPDATE tests SET ${colsToUpdate} ` +
      `WHERE id = $2 ${tests.colsToReturn()}`;
    return ({query, params});
  },

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
      const result = await db.query('SELECT * FROM tests WHERE id = $1', [id]);
      return result.rows[0];
    } catch (err) {
      console.log(err);
    }
  },

  create: async (data) => {
    const query = `INSERT INTO tests (name, script)
                    VALUES ($1, $2) ${tests.colsToReturn()}`;
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
      console.log(err);
    }
  },

  edit: async (id, data) => {
    const { query, params } = tests.formatPatchQueryParams(id, data);
    try {
      const result = await db.query(query, params);
      return result.rows[0];
    } catch (err) {
      console.log(err);
    }
  },

  setUpPgDump: async (testName) => {
    try {
      await this.prepPgDumpTable("pg_dump_tests", "tests");
      await this.prepPgDumpTable("pg_dump_samples", "samples");
  
      let copyDataQuery = `INSERT INTO $1 (SELECT * FROM $2` +
        ` WHERE $3 = $4) RETURNING id`;
      const params1 = ["pg_dump_tests", "tests", "name", testName];
      const testId = await db.query(copyDataQuery, params1);
      testId = testId.rows[0];
      const params2 = ["pg_dump_samples", "samples", "test_id", testId];
      await db.query(copyDataQuery, params2);
    } catch (err) {
      console.log(err);
    }
  },

  prepPgDumpTable: async (tableName, tableToCopy) => {
    existsQuery = `SELECT EXISTS (SELECT FROM ` +
      `information_schema.tables WHERE table_name = $1);`;
    
    let copyTblExists = await db.query(query, [tableName]);
  
    if (copyTblExists.rows[0] === "f") {
      copySchemaQuery = `CREATE TABLE $1 AS TABLE $2 WITH NO DATA`;
      await db.query(copySchemaQuery, [tableName, tableToCopy]);
    } else {
      // remove data from prior pg dumps, if there is any
      await db.query(`DELETE * FROM $1`, [tableName]);
    }
  },

  validKeys: (data) => {
    const keys = Object.keys(data).join(",");
    return keys.match(/(name|status|archive_id)/);
  },

  createName: () => {
    return crypto.randomUUID()
  },

  cleanScriptString: (script) => {
    // JSON stringify escaped double quotes, so this should work
    return script.replace(/'/g, "''");
  },

  nameExists: async (name) => {
    let names = await tests.getAll();
    names = names.map(test => test.name);
    return names.includes(name);
  },

  invalidName: async (name) => {
    const alreadyExists = await tests.nameExists(name);
    return name.length > 80 || alreadyExists;
  }
};

module.exports = tests;
