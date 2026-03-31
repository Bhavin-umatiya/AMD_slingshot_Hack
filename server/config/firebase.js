// Firebase Admin SDK initialization
// Used for: token verification + Firestore database access
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

const serviceAccountPath = resolve(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json"
);

let groq = null;
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
  console.warn("Using In-Memory Hackathon Mock Database. Your queries will work, but won't be saved persistently.");
  
  // Provide a robust in-memory datastore to bypass GCP Firestore entirely for the hackathon
  const memoryStore = { users: {} };
  
  db = {
    collection: (col) => ({
      doc: (docId) => {
        if (!memoryStore[col]) memoryStore[col] = {};
        if (!memoryStore[col][docId]) memoryStore[col][docId] = { _subs: {} };
        const docRef = memoryStore[col][docId];
        
        return {
          get: async () => ({
            exists: Object.keys(docRef).length > 1,
            data: () => { const { _subs, ...data } = docRef; return data; }
          }),
          set: async (val, opts) => {
            if (opts && opts.merge) { Object.assign(docRef, val); } 
            else { for (let k in docRef) { if (k !== '_subs') delete docRef[k]; } Object.assign(docRef, val); }
          },
          update: async (val) => { Object.assign(docRef, val); },
          collection: (subCol) => {
            if (!docRef._subs[subCol]) docRef._subs[subCol] = {};
            const sub = docRef._subs[subCol];
            return {
              add: async (val) => {
                const id = Math.random().toString(36).substr(2, 9);
                sub[id] = val;
                return { id };
              },
              where: () => ({
                get: async () => {
                  const docs = Object.keys(sub).map(k => ({ id: k, data: () => sub[k] }));
                  return { empty: docs.length === 0, docs };
                }
              }),
              get: async () => {
                const docs = Object.keys(sub).map(k => ({ id: k, data: () => sub[k] }));
                return { empty: docs.length === 0, docs };
              }
            };
          }
        };
      }
    })
  };
}

export { admin, db };
