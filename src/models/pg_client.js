import dotenv from 'dotenv';
dotenv.config();

import pg from "pg";
const { Pool } = pg;
const pool = new Pool();

export default {
  query: async (text, params) => {
    return pool.query(text, params);
  },

  checkConnection: () => {
    pool.connect((err, client, release) => {
      if (err) {
        console.error('Error connecting to PG: ', err.stack);
        process.exit(1); // shut down container if no connection is made so we can attempt to restart
      }
      client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
          return console.error('Error executing PG query: ', err.stack);
        }
        console.log(`Connected to PG: ${result.rows[0].now}`);
      });
    });
  }
};