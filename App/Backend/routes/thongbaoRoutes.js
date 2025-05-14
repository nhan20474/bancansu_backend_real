const express = require('express');
const router = express.Router();
const thongbaoController = require('../controllers/thongbaoController');

router.get('/', thongbaoController.getAllThongBao);
router.post('/', thongbaoController.createThongBao);
router.put('/:id', thongbaoController.updateThongBao);
router.delete('/:id', thongbaoController.deleteThongBao);

module.exports = router;
