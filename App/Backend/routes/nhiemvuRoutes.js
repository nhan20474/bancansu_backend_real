const express = require('express');
const router = express.Router();
const nhiemvuController = require('../controllers/nhiemvuController');

router.get('/', nhiemvuController.getAllNhiemVu);
router.post('/', nhiemvuController.createNhiemVu);
router.put('/:id', nhiemvuController.updateNhiemVu);
router.delete('/:id', nhiemvuController.deleteNhiemVu);

module.exports = router;
