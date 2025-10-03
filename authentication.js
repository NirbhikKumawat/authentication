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
        <style>
        body{ font-family: Arial;max-width:400px;margin:100px auto;padding:20px;}
        input{width:100%;padding:10px;margin:10px 0;box-sizing:border-box;}
        button{width:100%;padding:10px;background:#28a745;color:white;border:none;cursor:pointer;}
        button:hover{background:#218838;}
        .link{text-align:center;margin=top:20px;}
</style>
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
app.post('/login', async (req, res) => {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.send('<script>alert("Invalid credentials");windows.location="/login";</script>');
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword){
            return res.send('<script>alert("Invalid credentials");windows.location="/login";</script>');
        }
        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect('/dashboard');
    }catch(err){
        res.status(500).send('Error logging in');
    }
})

app.get('/register', async(req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <title>Register</title>
    <style>
        body { font-family: Arial; max-width: 400px; margin: 100px auto; padding: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        .error { color: red; margin: 10px 0; }
        .link { text-align: center; margin-top: 20px; }
      </style>
</head>
<body>
<h2>Register</h2>
<form method="POST" action="/register">
<input type="text" name="username" placeholder="username" required/>
<input type="password" name="password" placeholder="Password" required/>
<button type="submit">Register</button>
</form>
<div class="link">
Already have an account? <a href="/login">Login</a>
</div>
</body>
</html>`)
})

app.post('/register',async(req, res) => {
    try{
        const {username, password} = req.body;
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.send('<script>alert("Username already exists");window.location="/register";</script>')
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({username, password:hashedPassword});
        await user.save();
    }catch(error){
        res.status(500).send('Error registering the user');
    }
})

const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
})