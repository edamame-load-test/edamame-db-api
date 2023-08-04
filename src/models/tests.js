import crypto from "crypto";
import db from "./pg_client.js";
import files from "./files.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const tests = {
  colsToReturn: () => {
    return `RETURNING id, name, start_time, end_time, status, script;`;
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
      if (status === "completed") {
        colsToUpdate += `, end_time = now()`;
      }
      params.unshift(status);
    }
    let query =
      `UPDATE tests SET ${colsToUpdate} ` +
      `WHERE id = $2 ${tests.colsToReturn()}`;
    return { query, params };
  },

  getAll: async () => {
    let query = "SELECT * FROM tests ORDER BY start_time DESC;";
    const result = await db.query(query);
    return result.rows;
  },

  get: async (id, name = "") => {
    let query;
    let params;

    if (name) {
      query = "SELECT * FROM tests WHERE name = $1";
      params = [name];
    } else {
      query = "SELECT * FROM tests WHERE id = $1";
      params = [id];
    }
    const result = await db.query(query, params);
    return result.rows[0];
  },

  create: async (data) => {
    const query = `INSERT INTO tests (name, script)
                    VALUES ($1, $2) ${tests.colsToReturn()}`;
    const params = [data.name, data.script];
    const result = await db.query(query, params);
    return result.rows[0];
  },

  delete: async (id) => {
    const query = "DELETE FROM tests WHERE id = $1;";
    await db.query(query, [id]);
  },

  edit: async (id, data) => {
    const { query, params } = tests.formatPatchQueryParams(id, data);
    const result = await db.query(query, params);
    return result.rows[0];
  },

  copyToCommand: (idColumn, id, table) => {
    return (
      `psql -c "\\copy ( SELECT * FROM ${table} ` +
      ` WHERE ${idColumn} = ${id} ) TO ` +
      `'/var/pg_dump/${table}.csv' WITH DELIMITER ';'"`
    );
  },

  copyFromCommand: (table) => {
    return (
      `psql -c "\\copy ${table} FROM ` +
      `'/var/pg_dump/${table}.csv' WITH DELIMITER ';'"`
    );
  },

  dataDump: async (testId, uploadName) => {
    const testCommand = tests.copyToCommand("id", testId, "tests");
    const samplesCommand = tests.copyToCommand("test_id", testId, "samples");

    await exec(testCommand);
    await exec(samplesCommand);

    await files.compress(
      "/var/pg_dump",
      uploadName,
      "tests.csv",
      "samples.csv"
    );
  },

  s3ObjectNameForTest: (testName) => {
    return `${testName}.tar.gz`;
  },

  importFromCsv: async () => {
    const testCommand = tests.copyFromCommand("tests");
    const samplesCommand = tests.copyFromCommand("samples");

    await exec(testCommand);
    await exec(samplesCommand);
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
  },
};

export default tests;
