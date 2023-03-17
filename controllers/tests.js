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
      res.status(404).send({error: "Nonexistent or malformed test id"})
    } else {
      res.status(200).json(test)
    }
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/', async (req, res) => {
  try {
    const id = await tests.create()
    res.status(201).json(id)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router;