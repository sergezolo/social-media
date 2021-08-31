const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.getScreams = functions.https.onRequest((request, response) => {
    admin
    .firestore()
    .collection('screams')
    .get()
    .then(data => {
        let screams = [];
        data.forEach(doc => {
            screams.push(doc.data());
        })
        return response.json(screams);
    })
    .catch(error => console.error(error));
});

exports.createScream = functions.https.onRequest((request, response) => {
    if(request.method !== 'POST'){
        return response.status(400).json({ error: 'Method not allowed!' });
    }
    const newScream = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    };

    admin
        .firestore()
        .collection('screams')
        .add(newScream)
        .then(document => {
            response.json({ message: `Document ${document.id} created successfully!` });
        })
        .catch(error => {
            response.status(500).json({ error: 'Oops! Something went wrong.' });
            console.error(error);
        });
});