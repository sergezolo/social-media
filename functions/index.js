const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { 
    signup, 
    login, 
    uploadImage, 
    addUserDetails, 
    getAuthenticatedUser,
} = require('./handlers/users');

const { 
    getAllScreams, 
    postOneScream ,
    getScream,
    commentOnScream,
} = require('./handlers/screams');

//Login routes
app.post('/signup', signup);
app.post('/login', login);

//User routes
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

//Scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
// TODO: delete scream
// TODO: like a scream
// TODO: unlike a scream



// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app)