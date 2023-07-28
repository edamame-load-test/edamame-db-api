import express from 'express';
import tests from '../models/tests.js';
import archiver from '../models/archiver.js';
import {
  ARCHIVE
} from '../constants/constants.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const test_ids = await tests.getAll();
    res.status(200).json(test_ids);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const test = await tests.get(id);
    if (test === undefined) {
      res.status(404).send({ error: "Nonexistent or malformed test id" });
    } else {
      res.status(200).json(test);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post('/archive/:testName', async (req, res) => {
  const { testName } = req.params;
  let msg;
  const test = await tests.get("", testName);

  if (test === undefined) {
    msg = `Cannot archive a nonexistent test: ${testName}`;
    res.status(400).send({ error: msg });
  } else {
    try {
      await archiver.archiveTest(test);
      msg = `Successfully archived test: ${testName} in ` +
        `your ${ARCHIVE} AWS S3 Bucket.`;
      res.status(201).send({ success: msg });
    } catch (error) {
      console.log(error);
      msg = error.message;
      if (msg.match("10,000 subpart upload limit|already exists")) {
        res.status(400).send({ error: msg });
      } else {
        msg = `Issue archiving test ${testName}: ${msg}`;
        res.status(500).send({ error: msg });
      }
    }
  }
});

router.post('/', async (req, res) => {
  const data = req.body;

  if (!data.name) {
    data.name = tests.createName();
  }

  if (await tests.invalidName(data.name)) {
    res.status(400).send(
      { 
        error: 'Invalid or malformed data. Hint: Names must be unique and no longer than 80 chars' 
      }
    );
  }

  if (data.script) {
    data.script = tests.cleanScriptString(data.script);
  }

  try {
    const id = await tests.create(data);
    res.status(201).json(id);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!tests.validKeys(data)) {
    res.status(400).send({ error: "Invalid or malformed data."});
  } else if (data.name && await tests.invalidName(data.name)) {
    res.status(400).send({
      error:
        'Invalid or malformed data. Hint: Names must be unique and no longer than 80 chars',
    });
  } else {
    try {
      const test = await tests.edit(id, data);
      if (test === undefined) {
        res.status(404).send({ error: 'Nonexistent or malformed test id' });
      } else {
        res.status(200).json(test);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await tests.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
