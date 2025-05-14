const express = require('express');
const router = express.Router();
const danhgiaController = require('../controllers/danhgiaController');

router.get('/', danhgiaController.getAllDanhGia);

module.exports = router;
