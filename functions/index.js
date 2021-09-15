const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { signup, login, uploadImage, addUserDetails } = require('./handlers/users');
const { getAllScreams, postOneScream } = require('./handlers/screams');

//Login routes
app.post('/signup', signup);
app.post('/login', login);

//User routes
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);

//Scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app)