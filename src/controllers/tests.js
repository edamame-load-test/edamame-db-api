import express from "express";
import tests from "../models/tests.js";
import aws from "../models/aws.js";
import archive from "../models/archive.js";
import {
  ARCHIVE,
  INVALID_NAME_ERROR_MSG,
  GET_TEST_ERROR_MSG,
  BAD_ID_ERROR_MSG,
} from "../constants/constants.js";
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const test_ids = await tests.getAll();
    res.status(200).json(test_ids);
  } catch (error) {
    error.messageForClient = GET_TEST_ERROR_MSG;
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const test = await tests.get(id);
    if (test === undefined) {
      res.status(404).send({ error: BAD_ID_ERROR_MSG });
    } else {
      res.status(200).json(test);
    }
  } catch (error) {
    error.messageForClient = GET_TEST_ERROR_MSG;
    next(error);
  }
});

router.post("/archive/:testName", async (req, res, next) => {
  const { testName } = req.params;
  const test = await tests.get("", testName);

  if (test === undefined) {
    return res
      .status(400)
      .send({ error: `Cannot archive a nonexistent test: ${testName}` });
  }

  try {
    await archive.exportToAWS(test);
    res.status(201).send({
      success:
        `Successfully archived test: ${testName} in ` +
        `your ${ARCHIVE} AWS S3 Bucket.`,
    });
  } catch (error) {
    if (error.message.match("10,000 subpart upload limit|already exists")) {
      res.status(400).send({ error: error.message });
    } else {
      error.messageForClient = `Issue archiving ${testName}.`;
      next(error);
    }
  }
});

router.post("/import/:testName", async (req, res, next) => {
  const { testName } = req.params;

  try {
    const exists = await aws.s3ObjectExists(
      tests.s3ObjectNameForTest(testName)
    );
    if (!exists) {
      return res.status(400).send({
        error: `Couldn't find S3 object associated with test: ${testName}`,
      });
    }
    await archive.importFromAWS(testName);
    return res.status(201).send({
      success: `Successfully imported the test: ${testName} from your AWS S3 Bucket.`,
    });
  } catch (error) {
    if (error.message.match("duplicate")) {
      return res.status(400).send({
        error: `Can't import duplicate load test information`,
      });
    }
    error.messageForClient = `Issue importing ${testName} from AWS S3`;
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const data = req.body;
  if (!data.name) data.name = tests.createName();
  if (data.script) tests.cleanScriptString(data.script);

  if (await tests.invalidName(data.name)) {
    res.status(400).send({ error: INVALID_NAME_ERROR_MSG });
  }

  try {
    const id = await tests.create(data);
    res.status(201).json(id);
  } catch (error) {
    error.messageForClient = "Issue creating new test";
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  if (!tests.validKeys(data)) {
    res.status(400).send({ error: "Invalid or malformed data." });
  } else if (data.name && (await tests.invalidName(data.name))) {
    res.status(400).send({ error: INVALID_NAME_ERROR_MSG });
  } else {
    try {
      const test = await tests.edit(id, data);
      if (test === undefined) {
        res.status(404).send({ error: BAD_ID_ERROR_MSG });
      } else {
        res.status(200).json(test);
      }
    } catch (error) {
      error.messageForClient = "Issue updating test";
      next(error);
    }
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    await tests.delete(id);
    res.status(204).send();
  } catch (error) {
    error.messageForClient = "Issue deleting test";
    next(error);
  }
});

export default router;
