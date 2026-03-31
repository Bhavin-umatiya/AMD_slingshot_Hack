// Firebase Admin SDK initialization
// Used for: token verification + Firestore database access
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

const serviceAccountPath = resolve(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json"
);

let serviceAccount;
let db;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  db = admin.firestore();
  console.log("Firebase initialized via serviceAccountKey.json");
} catch (err) {
  console.warn("⚠️ Firebase service account key not found at:", serviceAccountPath);
  console.warn("Using Cloud Run Application Default Credentials for Hackathon Mode.");
  
  // For Cloud Run deployment, it will use ADC (Application Default Credentials)
  try {
    admin.initializeApp();
    db = admin.firestore();
  } catch (innerErr) {
    console.warn("Failed to initialize ADC:", innerErr.message);
    // Provide a mocked db object so the app doesn't crash if totally unauthenticated
    db = {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => ({}) }),
          set: async () => {},
          update: async () => {},
        }),
        where: () => ({ get: async () => ({ docs: [], empty: true }) }),
        add: async () => ({ id: "mock-id" }),
      }),
    };
  }
}

export { admin, db };
