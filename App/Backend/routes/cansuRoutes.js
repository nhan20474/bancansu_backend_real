const express = require('express');
const router = express.Router();
const cansuController = require('../controllers/cansuController');

router.get('/', cansuController.getAllCanSu);
router.post('/', cansuController.createCanSu);
router.put('/:id', cansuController.updateCanSu);
router.delete('/:id', cansuController.deleteCanSu);

module.exports = router;
