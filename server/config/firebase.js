// Firebase Admin SDK initialization
// Used for: token verification + Firestore database access
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

const serviceAccountPath = resolve(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json"
);

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
} catch (err) {
  console.error(
    "⚠️  Firebase service account key not found at:",
    serviceAccountPath
  );
  console.error(
    "   Download it from Firebase Console → Project Settings → Service Accounts"
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore database instance
const db = admin.firestore();

export { admin, db };
