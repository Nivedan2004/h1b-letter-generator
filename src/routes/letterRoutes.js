const express = require('express');
const router = express.Router();
const { generateLetter } = require('../controllers/letterController');

router.post('/generate-letter', generateLetter);

module.exports = router;