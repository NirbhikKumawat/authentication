const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));
app.use(express.static('public'));

const isAuthenticated = (req, res, next) => {
    if(req.session.userId) {
        next();
    }else {
        res.redirect('/login');
    }
}

app.get('/', (req, res) => {
    if(req.session.userId){
        res.redirect('/dashboard')
    }else{
        res.redirect('/login')
    }
})

const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
})