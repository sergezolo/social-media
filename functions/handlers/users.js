const { admin, db }  = require('../util/admin');
const firebase = require('firebase');
const firebaseConfig = require('../util/config');
const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');
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

    const noImg = "no-img.png"

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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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

exports.addUserDetails = (request, response) => {
    let userDetails = reduceUserDetails(request.body);

    db
        .doc(`/users/${request.user.handle}`)
        .update(userDetails)
        .then(() => {
            return response.status(201).json({ message: "Details added successfully"});
        })
        .catch((err)=> {
            console.error(err);
            return response.status(500).json({ error: err.code });
        })
};

exports.uploadImage = (request,response) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: request.headers }); 
    
    let imageFileName;
    let imageToBeUploaded = {};
    
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return response.status(400).json({ error: "Wrong file type submitted" });
        }
        //image.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        //515615614651561515.png
        imageFileName = `${Math.round(Math.random()*1000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    })
    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
            return db.doc(`/users/${request.user.handle}`).update({ imageUrl });
        })
        .then(()=> {
            return response.status(201).json({ message: "Image uploaded successfully"});
        })
        .catch((err)=> {
            console.error(err);
            return response.status(500).json({ error: err.code });
        })
    })
    busboy.end(request.rawBody);
};

