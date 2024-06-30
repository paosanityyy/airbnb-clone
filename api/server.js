require('dotenv').config()
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const placeRoutes = require('./routes/placeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.use(express.json())
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}))

app.use('/api/user', userRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/place', placeRoutes); 

mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req,res) => {
    res.json('test ok');
})
   
app.listen(4000) 