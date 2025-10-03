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

app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Login</title>
    </head>
    <body>
    <h2>Login</h2>
    <form method="POST" action="/login">
    <input type="text" name="username" placeholder="username" required/>
    <input type="password" name="password" placeholder="Password" required/>
    <button type="submit">Login</button>
    </form>
    <div class="link">
    Don't have an account? <a href="/register">Register</a>
</div>
</body>
    </html>
    `)
})

const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
})