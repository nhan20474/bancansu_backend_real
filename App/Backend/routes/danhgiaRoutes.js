const express = require('express');
const router = express.Router();
const danhgiaController = require('../controllers/danhgiaController');

router.get('/', danhgiaController.getAllDanhGia);
// router.post('/', danhgiaController.createDanhGia);
// router.put('/:id', danhgiaController.updateDanhGia);
// router.delete('/:id', danhgiaController.deleteDanhGia);

module.exports = router;
