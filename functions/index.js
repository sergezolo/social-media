const functions = require("firebase-functions");
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyA99gFmpIjWdDZRw7Nzc1etSy_97BNGrso",
  authDomain: "social-media-89aaf.firebaseapp.com",
  projectId: "social-media-89aaf",
  storageBucket: "social-media-89aaf.appspot.com",
  messagingSenderId: "354713403964",
  appId: "1:354713403964:web:de08cd032d7660f973b939"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

app.get('/screams', (request, response) => {
    admin
        .firestore()
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let screams = [];
            data.forEach((doc) => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                })
            })
            return response.json(screams);
        })
        .catch((err) => {
            response.status(500).json({ error: err });
            console.error(err);
        });
})

app.post('/scream', (request, response) => {
    const newScream = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: new Date().toISOString(),
    }
    admin
        .firestore()
        .collection('screams')
        .add(newScream)
        .then ((doc) => {
            response.status(201).json({ message: `Document ${doc.id} created successfully!` });
        })
        .catch((err) => {
            response.status(500).json({ error: 'Oops! Something went wrong.' });
            console.error(err);
        });
})

//SignUp
app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };

    // TODO: validate data

    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then((data) => {
            response.status(201).json({ message: `User ${data.user.uid} signed up successfully` });
        })
        .catch((err) => {
            response.status(500).json({ error: err.code });
            console.error(err);
        });
});


// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app)