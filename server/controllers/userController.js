// User Controller — manages user profile creation/retrieval
import { db } from "../config/firebase.js";

// ── POST /api/users/sync — Sync Firebase user to Firestore ─────────────
export async function syncUser(req, res) {
  try {
    const { uid, email, name } = req.user;

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user profile
      const userData = {
        firebaseUID: uid,
        name: name || email?.split("@")[0] || "User",
        email: email || "",
        createdAt: new Date().toISOString(),
      };
      await userRef.set(userData);
      return res.status(201).json({ success: true, data: userData, isNew: true });
    }

    // Return existing user
    res.json({ success: true, data: userDoc.data(), isNew: false });
  } catch (error) {
    console.error("Sync user error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
}

// ── GET /api/users/me — Get current user profile ───────────────────────
export async function getProfile(req, res) {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.json({ success: true, data: userDoc.data() });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

// ── PUT /api/users/me — Update user profile ────────────────────────────
export async function updateProfile(req, res) {
  try {
    const { uid } = req.user;
    const { name } = req.body;

    const updates = {};
    if (name) updates.name = name;

    await db.collection("users").doc(uid).update(updates);

    const updated = await db.collection("users").doc(uid).get();
    res.json({ success: true, data: updated.data() });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}
