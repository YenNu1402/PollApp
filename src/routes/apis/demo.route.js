import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  console.log("Hello World");
  res.json({ message: 'Hello World from /api/demo' });
});

export default router;