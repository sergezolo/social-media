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
    deleteScream,
    commentOnScream,
    likeScream,
    unlikeScream,
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
app.delete('/scream/:screamId', FBAuth, deleteScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);

// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app)