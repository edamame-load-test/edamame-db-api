const tests = require('../models/tests')

const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const test_ids = await tests.get()
    res.status(200).json(test_ids)
  } catch (error) {
    res.status(500).send(error);
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