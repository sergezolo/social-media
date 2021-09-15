const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { signup, login, uploadImage } = require('./handlers/users');
const { getAllScreams, postOneScream } = require('./handlers/screams');

//User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage)

//Scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app)