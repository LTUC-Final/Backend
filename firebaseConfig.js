// // firebaseConfig.js
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(
  __dirname,
  "job-tracker-b9e24-firebase-adminsdk-fbsvc-33c4e692a1.json"
));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // storageBucket: "job-tracker-b9e24.appspot.com",
  storageBucket: "job-tracker-b9e24.firebasestorage.app",
});

const bucket = admin.storage().bucket();

module.exports = { bucket };
