const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log("Hello World");
  res.json({ message: 'Hello World from /api/demo' });
});

module.exports = router;
