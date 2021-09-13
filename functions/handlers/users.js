const { db }  = require('../util/admin');
const firebase = require('firebase');
const firebaseConfig = require('../util/config');
const { validateSignupData, validateLoginData } = require('../util/validators');
firebase.initializeApp(firebaseConfig);

exports.signup = (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };

    const { valid, errors } = validateSignupData(newUser);
    if(!valid) return response.status(400).json({ errors });

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
};

exports.login = (request, response) => {
    const user = {
        email: request.body.email, 
        password: request.body.password
    };

    const { valid, errors } = validateLoginData(user);
    if(!valid) return response.status(400).json({ errors });

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => { 
            return data.user.getIdToken();
        })
        .then((token) => {
            return response.json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code !== '') {
                return response.status(403).json({ general: 'Wrong credentials, please try again' });
            } else {
                return response.status(500).json({ error: err.code })
            }
        })
};
