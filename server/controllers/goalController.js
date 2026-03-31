// Goal Controller — CRUD for user nutrition goals
import { db } from "../config/firebase.js";

// ── GET /api/goals — Get user's nutrition goals ────────────────────────
export async function getGoals(req, res) {
  try {
    const { uid } = req.user;
    const docSnap = await db.collection("goals").doc(uid).get();

    if (!docSnap.exists) {
      // Return default goals
      const defaults = {
        userId: uid,
        caloriesTarget: 2000,
        proteinTarget: 100,
        carbsTarget: 250,
        fatTarget: 65,
        streakDays: 0,
        lastLogDate: null,
      };
      await db.collection("goals").doc(uid).set(defaults);
      return res.json({ success: true, data: defaults });
    }

    res.json({ success: true, data: docSnap.data() });
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
}

// ── PUT /api/goals — Create or update user's goals ─────────────────────
export async function updateGoals(req, res) {
  try {
    const { uid } = req.user;
    const { caloriesTarget, proteinTarget, carbsTarget, fatTarget } = req.body;

    const updates = {};
    if (caloriesTarget != null) updates.caloriesTarget = Number(caloriesTarget);
    if (proteinTarget != null) updates.proteinTarget = Number(proteinTarget);
    if (carbsTarget != null) updates.carbsTarget = Number(carbsTarget);
    if (fatTarget != null) updates.fatTarget = Number(fatTarget);
    updates.userId = uid;

    await db.collection("goals").doc(uid).set(updates, { merge: true });

    const updated = await db.collection("goals").doc(uid).get();
    res.json({ success: true, data: updated.data() });
  } catch (error) {
    console.error("Update goals error:", error);
    res.status(500).json({ error: "Failed to update goals" });
  }
}

// ── GET /api/goals/streak — Get streak info ────────────────────────────
export async function getStreak(req, res) {
  try {
    const { uid } = req.user;
    const docSnap = await db.collection("goals").doc(uid).get();

    if (!docSnap.exists) {
      return res.json({ success: true, data: { streakDays: 0, lastLogDate: null } });
    }

    const { streakDays = 0, lastLogDate = null } = docSnap.data();
    res.json({ success: true, data: { streakDays, lastLogDate } });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
}
