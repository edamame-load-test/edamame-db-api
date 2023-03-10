require("dotenv").config();

const express = require("express");
const app = express();
const pg = require("./models/pg_client")

// connect to database
pg.checkConnection()
// logging

// router API

// path not found and error middlewares

app.listen(process.env.PORT, () => {
  console.log(`server up and listening on port ${process.env.PORT} :)`)
});