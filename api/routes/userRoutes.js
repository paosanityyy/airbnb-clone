const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const {jwtSecret} = require('../utils');
const User = require('../models/User');

const bcryptSalt = bcrypt.genSaltSync(10);
router.post('/register', async(req,res) => {
    const {name, email, password} = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc) 
    } catch (error) {
        res.status(422).json(error);
    }
});

router.post('/login', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL)
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({
                email:userDoc.email, 
                id:userDoc._id
            }, jwtSecret, {}, (err,token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);
            });
        } else {
            res.status(422).json('pass not ok');
        }
    } else {
        res.json('not found')
    }
});

router.get('/profile', (req,res) => {
    mongoose.connect(process.env.MONGO_URL)
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const {name,email,_id} = await User.findById(userData.id);
            res.json({name,email,_id})
        });
    }else {
        res.json(null)
    }
});

router.post('/logout', (req,res) => {
    res.cookie('token', '').json(true);
})

module.exports = router;