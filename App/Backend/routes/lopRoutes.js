const express = require('express');
const router = express.Router();
const lopController = require('../controllers/lopController');

router.get('/', lopController.getAllLop);
router.post('/', lopController.createLop);
router.put('/:id', lopController.updateLop);
router.delete('/:id', lopController.deleteLop);

module.exports = router;
