// Firebase Configuration
// Replace these values with your actual Firebase project configuration
window.firebaseConfig = {
    apiKey: "AIzaSyBEmd-UJ9re4Td-OIv_YGMtUR8bZqkAxmI",
    authDomain: "compliance-final.firebaseapp.com",
    projectId: "compliance-final",
    storageBucket: "compliance-final.firebasestorage.app",
    messagingSenderId: "1044253409055",
    appId: "1:1044253409055:web:8dbf08f1b0084e453ffa2a"
};

// Instructions for setup:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Go to Project Settings > General > Your apps
// 4. Add a web app and copy the configuration
// 5. Replace the values above with your actual configuration
// 6. Enable Firestore Database in the Firebase console
// 7. Update Firestore Security Rules (see below)

// IMPORTANT: Update your Firestore Security Rules to allow writes:
// Go to Firebase Console > Firestore Database > Rules
// Replace the rules with:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
*/

console.log('Firebase configuration loaded successfully!');
