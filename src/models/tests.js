import crypto from 'crypto';
import db from './pg_client.js';
import files from './files.js';
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const tests = {
  colsToReturn: () => {
    return (
      `RETURNING id, name, start_time, ` +
      `end_time, status, script;`
    );
  },

  formatPatchQueryParams: (id, data) => {
    const { name, status } = data;
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
    }
    let query = `UPDATE tests SET ${colsToUpdate} ` +
      `WHERE id = $2 ${tests.colsToReturn()}`;
    return ({query, params});
  },

  getAll: async () => {
    try {
      let query = 'SELECT * FROM tests ORDER BY start_time DESC;'
      const result = await db.query(query);
      return result.rows;
    } catch (err) {
      console.log(err);
    }
  },

  get: async (id, name = "") => {
    let query;
    let params;

    try {
      if (name) {
        query = 'SELECT * FROM tests WHERE name = $1';
        params = [name];
      } else {
        query = 'SELECT * FROM tests WHERE id = $1';
        params = [id];
      }
      const result = await db.query(query, params);
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

  idQuery: (idColumn, id, table) => {
    return (
      `SELECT * FROM ${table} ` +
      `WHERE ${idColumn} = ${id};`
    );
  },

  dataDump: async (testId, uploadFileName) => {
    const testQ = tests.idQuery("id", testId, "tests");
    const samplesQ = tests.idQuery("test_id", testId, "samples");
     
    const testsData = await db.query(testQ);
    const samplesData = await db.query(samplesQ);

    const data = [testsData.rows, samplesData.rows];
    
    files.write("/var/pg_dump/data.json", JSON.stringify(data));
    await exec(`cd /var/pg_dump && tar -zcvf ${uploadFileName} data.json`);
  },

  s3ObjectNameForTest(testName) {
    return `${testName.replaceAll("-", "")}.tar.gz`;
  },

  validKeys: (data) => {
    const keys = Object.keys(data).join(",");
    return keys.match(/(name|status)/);
  },

  createName: () => {
    return crypto.randomUUID();
  },

  cleanScriptString: (script) => {
    // JSON stringify escaped double quotes, so this should work
    return script.replace(/'/g, "''");
  },

  nameExists: async (name) => {
    const test = await tests.get("", name);
    return !!test;
  },

  invalidName: async (name) => {
    const alreadyExists = await tests.nameExists(name);
    return name.length > 80 || alreadyExists;
  }
};

export default tests;
