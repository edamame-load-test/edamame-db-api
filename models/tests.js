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
      await tests.prepPgDumpTable("pg_dump_tests", "tests");
      await tests.prepPgDumpTable("pg_dump_samples", "samples");

      let query = tests.copyDataQuery("pg_dump_tests", "tests", "name");
      
      const testIdData = await db.query(query, [testName]);
      const testId = testIdData.rows[0].id;

      query = tests.copyDataQuery("pg_dump_samples", "samples", "test_id");
      await db.query(query, [testId]);
    } catch (err) {
      console.log(err);
    }
  },

  copyDataQuery: (copyTo, copyFrom, filterCol) => {
    return `INSERT INTO ${copyTo} ` +
      `(SELECT * FROM ${copyFrom} ` +
      `WHERE ${filterCol} = $1)` +
      `RETURNING id;`;
  },

  copySchemaQuery: (copy, original) => {
    return `CREATE TABLE ${copy} AS TABLE ${original} WITH NO DATA;`;
  },

  prepPgDumpTable: async (tableName, tableToCopy) => {
    let query = `SELECT EXISTS (SELECT FROM ` +
      `information_schema.tables WHERE table_name = $1);`;
    let data = await db.query(query, [tableName]);

    if (data.rows[0].exists === false) {
      await db.query(tests.copySchemaQuery(tableName, tableToCopy));
    } else {
      // remove any temporary copy data from prior pg dumps
      await db.query(`DELETE FROM ${tableName}`);
    }
  },

  validKeys: (data) => {
    const keys = Object.keys(data).join(",");
    return keys.match(/(name|status|archive_id)/);
  },

  createName: () => {
    return crypto.randomUUID();
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
