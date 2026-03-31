// Food Log Controller — CRUD for food logging + nutrition stats
import { db } from "../config/firebase.js";

const collection = "foodLogs";

// ── POST /api/food-logs — Create a new food log entry ──────────────────
export async function createFoodLog(req, res) {
  try {
    const { uid } = req.user;
    const { foodName, calories, protein, carbs, fat, mealType } = req.body;

    if (!foodName || calories == null) {
      return res.status(400).json({ error: "foodName and calories are required" });
    }

    const entry = {
      userId: uid,
      foodName,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      mealType: mealType || "snack",
      timestamp: new Date().toISOString(),
      aiSuggested: req.body.aiSuggested || false,
    };

    const docRef = await db.collection(collection).add(entry);

    // Update streak
    await updateStreak(uid);

    res.status(201).json({ success: true, data: { id: docRef.id, ...entry } });
  } catch (error) {
    console.error("Create food log error:", error);
    res.status(500).json({ error: "Failed to create food log" });
  }
}

// ── GET /api/food-logs — List user's food logs (with optional date filter)
export async function getFoodLogs(req, res) {
  try {
    const { uid } = req.user;
    const { date, days } = req.query;

    let query = db.collection(collection).where("userId", "==", uid);

    if (date) {
      // Filter for a specific date
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query = query
        .where("timestamp", ">=", start.toISOString())
        .where("timestamp", "<=", end.toISOString());
    } else if (days) {
      // Filter for last N days
      const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
      query = query.where("timestamp", ">=", since.toISOString());
    }

    const snapshot = await query.orderBy("timestamp", "desc").limit(100).get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get food logs error:", error);
    res.status(500).json({ error: "Failed to fetch food logs" });
  }
}

// ── DELETE /api/food-logs/:id — Delete a food log entry ────────────────
export async function deleteFoodLog(req, res) {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const docRef = db.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== uid) {
      return res.status(404).json({ error: "Food log not found" });
    }

    await docRef.delete();
    res.json({ success: true, message: "Food log deleted" });
  } catch (error) {
    console.error("Delete food log error:", error);
    res.status(500).json({ error: "Failed to delete food log" });
  }
}

// ── GET /api/food-logs/stats — Aggregated nutrition stats ──────────────
export async function getFoodLogStats(req, res) {
  try {
    const { uid } = req.user;
    const { days = 7 } = req.query;

    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const snapshot = await db
      .collection(collection)
      .where("userId", "==", uid)
      .where("timestamp", ">=", since.toISOString())
      .orderBy("timestamp", "desc")
      .get();

    const logs = snapshot.docs.map((doc) => doc.data());

    // Aggregate by day
    const dailyStats = {};
    logs.forEach((log) => {
      const day = log.timestamp.split("T")[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { date: day, calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
      }
      dailyStats[day].calories += log.calories;
      dailyStats[day].protein += log.protein;
      dailyStats[day].carbs += log.carbs;
      dailyStats[day].fat += log.fat;
      dailyStats[day].count += 1;
    });

    // Totals
    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Today's totals
    const todayStr = new Date().toISOString().split("T")[0];
    const todayStats = dailyStats[todayStr] || { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };

    res.json({
      success: true,
      data: {
        daily: Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)),
        totals,
        today: todayStats,
        totalEntries: logs.length,
      },
    });
  } catch (error) {
    console.error("Get food log stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}

// ── Helper: Update user's logging streak ────────────────────────────────
async function updateStreak(uid) {
  try {
    const goalsRef = db.collection("goals").doc(uid);
    const goalsDoc = await goalsRef.get();

    const today = new Date().toISOString().split("T")[0];

    if (goalsDoc.exists) {
      const data = goalsDoc.data();
      const lastLog = data.lastLogDate;

      if (lastLog === today) {
        // Already logged today, no streak change
        return;
      }

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      if (lastLog === yesterday) {
        // Consecutive day — increment streak
        await goalsRef.update({
          streakDays: (data.streakDays || 0) + 1,
          lastLogDate: today,
        });
      } else {
        // Streak broken — reset to 1
        await goalsRef.update({
          streakDays: 1,
          lastLogDate: today,
        });
      }
    } else {
      // First time — create goals doc with streak 1
      await goalsRef.set({
        userId: uid,
        caloriesTarget: 2000,
        proteinTarget: 100,
        carbsTarget: 250,
        fatTarget: 65,
        streakDays: 1,
        lastLogDate: today,
      });
    }
  } catch (err) {
    console.error("Update streak error:", err);
  }
}
