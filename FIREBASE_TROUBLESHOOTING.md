# Firebase Connection Troubleshooting Guide

## 🔥 Current Issue: WebChannel Transport Errors

You're experiencing Firebase Firestore connection errors. Here's how to fix them:

## ✅ **Step 1: Update Firestore Security Rules**

The most common cause is restrictive security rules. 

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `compliance-final`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the current rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**

## ✅ **Step 2: Verify Firestore Database is Created**

1. In Firebase Console, go to **Firestore Database**
2. If you see "Create database", click it and:
   - Choose **Start in test mode**
   - Select a location (preferably close to your users)
   - Click **Done**

## ✅ **Step 3: Check Network and CORS**

The WebChannel errors suggest network connectivity issues:

1. **Disable browser extensions** temporarily (especially ad blockers)
2. **Try a different browser** or incognito mode
3. **Check your network firewall** - ensure Firebase domains aren't blocked
4. **Try from a different network** (mobile hotspot) to rule out network issues

## ✅ **Step 4: Verify Firebase Configuration**

Your current config looks correct:
```javascript
{
  apiKey: "AIzaSyBEmd-UJ9re4Td-OIv_YGMtUR8bZqkAxmI",
  authDomain: "compliance-final.firebaseapp.com",
  projectId: "compliance-final",
  storageBucket: "compliance-final.firebasestorage.app",
  messagingSenderId: "1044253409055",
  appId: "1:1044253409055:web:8dbf08f1b0084e453ffa2a"
}
```

## ✅ **Step 5: Test Firebase Connection**

Add this test function to your browser console:

```javascript
// Test Firebase connection
async function testFirebaseConnection() {
  try {
    const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const testDoc = await addDoc(collection(window.db, 'test'), {
      message: 'Hello Firebase!',
      timestamp: new Date()
    });
    console.log('✅ Firebase connection successful!', testDoc.id);
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
}

testFirebaseConnection();
```

## 🔧 **Alternative Solutions**

### Option 1: Use Firebase Emulator (Local Development)
```bash
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start --only firestore
```

### Option 2: Switch to Local Storage (No Firebase)
If you want to continue without Firebase, the app will automatically fall back to demo data.

## 🚨 **Common Error Codes**

- **permission-denied**: Security rules are too restrictive
- **unavailable**: Network connectivity issues
- **failed-precondition**: Firestore database not properly initialized
- **resource-exhausted**: Quota limits exceeded

## 📞 **Still Having Issues?**

1. **Check Firebase Status**: [Firebase Status Page](https://status.firebase.google.com/)
2. **Browser Console**: Look for more specific error messages
3. **Network Tab**: Check if requests to Firebase are being blocked
4. **Try Different Device**: Rule out local environment issues

## 🎯 **Quick Fix Priority**

1. **Update security rules** (most likely fix)
2. **Try different browser/network**
3. **Verify Firestore database exists**
4. **Check for browser extensions blocking requests**

The app will continue to work without Firebase - it will just use demo data instead of persisting your compliance checks.

---

**Note**: The current errors show the app is trying to connect but failing at the transport level, which typically indicates either security rules or network connectivity issues.
