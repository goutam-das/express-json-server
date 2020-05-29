const fs = require('fs');
const { extname } = require('path');
const jsonfile = require('jsonfile');
const express = require('express');
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')
const { find } = require('lodash');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
// https://codesquery.com/file-upload-in-node-js/
// https://www.techiediaries.com/fake-api-jwt-json-server/
// define multer storage configuration     
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/upload/');
    },
    filename: function (req, file, callback) {
        const ext = extname(file.originalname);
        callback(null, `${Date.now()}${ext}`);
    }
});

const upload = multer({ storage: storage });

const server = express();
const router = jsonServer.router('./db.json');
const userdb = jsonfile.readFileSync('./users.json');

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// JWT access tokens.
const SECRET_KEY = '123456789'
const expiresIn = '1h'

// Create a token from a payload 
function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

// Verify the token 
function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err)
}

// Check if the user exists in database
function isAuthenticate({ email, password }) {
    return find(userdb.users, { email, password });
}

function auth(req, res, next) {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401
        const message = 'Bad authorization header'
        return res.status(status).json({ status, message });
    }
    try {
        verifyToken(req.headers.authorization.split(' ')[1])
        console.log(req.body);
        req.body.id = uuidv4();
        req.body.name = "Goutam Das";
        console.log(req.body);
        next()
    } catch (err) {
        const status = 401
        const message = 'Error: access_token is not valid'
        return res.status(status).json({ status, message })
    }
}
// Check if the user exists in database
function isUserExist({ email }) {
    return find(userdb.users, { email });
}

server.post('/auth/login', (req, res) => {
    console.log(req.body);
    const { email, password } = req.body
    console.log({ email, password });
    if (!isAuthenticate({ email, password })) {
        const status = 401
        const message = 'Incorrect email or password'
        return res.status(status).json({ status, message })
    }
    const access_token = createToken({ email, password })
    res.status(200).json({ access_token })
})

server.post('/auth/register', (req, res) => {
    const { email, password } = req.body
    console.log({ email, password });
    if (isUserExist({ email })) {
        const status = 401
        const message = 'You taken email is exist';
        return res.status(status).json({ status, message })
    }
    userdb.users.push({
        id: uuidv4(),
        email,
        password
    });
    jsonfile.writeFileSync('./users.json', userdb, { spaces: 2 });
    return res.status(200).json({ message: 'You successfully registered' });
})

function addFileName(req, res, next) {
    if (req.file) {
        console.log(req.file.path);
        req.body.url = req.file.path;
    }
    next()
}
server.use('/api', auth, upload.single('singleFile'), addFileName, router);

server.listen(3000, () => {
    console.log('Run Auth API Server')
})