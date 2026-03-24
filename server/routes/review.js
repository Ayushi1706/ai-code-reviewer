const express = require('express');
const { reviewCode, getHistory, fixIssues } = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, reviewCode)
router.get('/history', auth, getHistory);
router.post('/fix', auth, fixIssues);

module.exports = router;