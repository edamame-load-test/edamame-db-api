import dotenv from 'dotenv';
dotenv.config();

import cors from "cors";
import morgan from "morgan";
import express from "express";
const app = express();

import aws from './models/aws.js';
import pg from './models/pg_client.js';
import errorHandler from './middleware/errorHandler.js';
import unknownEndpoint from './middleware/unknownEndpoint.js';
import testsController from './controllers/tests.js';

app.use(cors());
app.use(express.json());

// connect to database
pg.checkConnection();

// configure aws cli
aws.configureCredentials();

// logging
app.use(morgan("tiny"));

// router API
app.use("/tests", testsController);

// error handling
app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
