const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db'); // Kết nối database

const authRoutes = require('./routes/authRoutes');
const lopRoutes = require('./routes/lopRoutes');
const nhiemvuRoutes = require('./routes/nhiemvuRoutes');
const cansuRoutes = require('./routes/cansuRoutes');
const thongbaoRoutes = require('./routes/thongbaoRoutes');
const danhgiaRoutes = require('./routes/danhgiaRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/lop', lopRoutes);
app.use('/api/nhiemvu', nhiemvuRoutes);
app.use('/api/cansu', cansuRoutes);
app.use('/api/thongbao', thongbaoRoutes);
app.use('/api/danhgia', danhgiaRoutes);
app.use('/api/user', userRoutes);

app.listen(8080, () => {
    console.log('Server running on port 8080');
});