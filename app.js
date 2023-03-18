require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan")
const cors = require("cors")

const pg = require('./models/pg_client')
const errorHandler = require('./middleware/errorHandler')
const unknownEndpoint = require('./middleware/unknownEndpoint')

app.use(cors())
app.use(express.json())

// connect to database
pg.checkConnection()

// logging
app.use(morgan("tiny"));

// router API
const testsController = require('./controllers/tests')
app.use("/tests", testsController)

// error handling
app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app