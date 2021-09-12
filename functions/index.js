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

const db = admin.firestore();

app.get('/screams', (request, response) => {
    db
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
    db
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

//Helper function for validation 
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
    if (email.match(regEx)) return true;
    else return false;
}

//SignUp
app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };
    
    // !!!User credentials validations
    let errors = {};
    
    if(isEmpty(newUser.email)) { errors.email = "Must not be empty" } 
    else if (!isEmail(newUser.email)) { errors.email = "Must be a valid email address" }
    if (isEmpty(newUser.password)) { errors.password = "Must not be empty" }
    if (newUser.password !== newUser.confirmPassword) { errors.password = "Passwords don't match" }
    if (isEmpty(newUser.handle)) { errors.handle = "Must not be empty" }

    if (Object.keys(errors).length > 0) return response.status(400).json(errors);

    // TODO: validate data
    let token, userId;
    db
        .doc( `/users/${newUser.handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return response.status(400).json({ handle: 'This user is already signed in' });
            } else {
                return firebase
                            .auth()
                            .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then ((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId,
            }
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            response.status(201).json({ token })
        })
        .catch((err) => {
            if (err.code === "auth/email-already-in-use") {
                return response.status(400).json({ email: 'This email is already in use' });
            } else {
                response.status(500).json({ error: err.code });
            }
            console.error(err);
        });
});


// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app)