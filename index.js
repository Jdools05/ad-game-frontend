const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8081;

const jose = require('jose');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const favicon = require('serve-favicon');

app.use(cookieParser());

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// for parsing multipart/form-data
app.use(upload.array());

app.use(express.static("public"));

app.get('/', function (req, res) {
    // TODO implement reactive routing
    // for instance if the user is logged in, go to home, otherwise go to login
    res.sendFile(path.join(__dirname, '/public/pages/login.html'));
});

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/pages/login.html'));
});

app.get('/home', function (req, res) {

    authenticate(req, res, function () {
        console.log("Authenticated");
        res.sendFile(path.join(__dirname, '/public/pages/index.html'));
    });
});

app.get('/leaderboard', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/pages/leaderboard.html'));
});

app.post('/register', function (req, res) {
    let userInfo = JSON.parse(req.query);
});

function authenticate(req, res, next) {
    axios.get('http://localhost:8080/api/v1/users/authenticate', {
        withCredentials: true,
        headers: {
            "Cookie": "quarkus-credential=" + req.cookies['quarkus-credential']
        }
    }).then(function (response) {
        if (response.status === 200 || response.status === 302) next();
        else res.redirect('/login');
    }).catch(function (error) {
        if (error.response.status === 404) res.redirect('/error');
        else res.redirect('/login');
    });
}


app.post('/login', (req, res, next) => {
    let host = 'http://localhost:8080';
    let j_username = req.body.j_username;
    let j_password = req.body.j_password;
    let data = qs.stringify({
        j_username: j_username,
        j_password: j_password
    });
    axios.post(host + '/api/v1/j_security_check', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        if (response.status === 200 || response.status === 302) {
            res.status(200).setHeader('set-cookie', response.headers['set-cookie']);
            res.redirect('/home');
        }
    }).catch((error) => {
        res.status(500).send("Error");
    });
});

app.get('/about', function (req, res) {
    res.redirect('/error');
});

app.get('/error', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/pages/error.html'));
});

app.get('/admin-cookie', function (req, res) {

});

app.listen(port);
console.log('Server started at http://localhost:' + port);
