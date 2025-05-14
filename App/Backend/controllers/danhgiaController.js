const db = require('../config/db');

exports.getAllDanhGia = (req, res) => {
    db.query('SELECT * FROM DanhGiaCanSu', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn đánh giá' });
        res.json(results);
    });
};
