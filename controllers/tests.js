const tests = require('../models/tests')

const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const test_ids = await tests.getAll()
    res.status(200).json(test_ids)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const test = await tests.get(id)
    if (test === undefined) {
      res.status(404).send({ error: "Nonexistent or malformed test id" })
    } else {
      res.status(200).json(test)
    }
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.name) {
    data.name = tests.createName()
  }

  if (data.script) {
    data.script = tests.cleanScriptString(data.script)
  }

  try {
    const id = await tests.create(data)
    res.status(201).json(id)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const data = req.body

  if (!tests.validKeys(data)) {
    res.status(400).send({ error: "Invalid or malformed data"})
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
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await tests.delete(id)
    res.status(204).send()
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router;