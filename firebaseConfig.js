// firebaseConfig.js
// const admin = require("firebase-admin");
// const path = require("path");

// const serviceAccount = require(path.join(
//   __dirname,
//   "job-tracker-b9e24-firebase-adminsdk-fbsvc-33c4e692a1.json"
// ));

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "job-tracker-b9e24.appspot.com",
//   // storageBucket: "job-tracker-b9e24.firebasestorage.app",
// });

// const bucket = admin.storage().bucket();

// module.exports = { bucket };
// const admin = require('firebase-admin');

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;
console.log("asdasd");


require("dotenv").config();
const admin = require("firebase-admin");

// Parse the Firebase service account JSON from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "job-tracker-b9e24.firebasestorage.app", // your Firebase storage bucket
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
