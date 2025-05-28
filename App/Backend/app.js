const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');

app.use('/api/user', userRoutes);


module.exports = app;