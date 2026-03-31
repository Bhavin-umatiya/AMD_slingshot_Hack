// AI Controller — handles all AI-powered endpoints
import {
  getMealRecommendation,
  getWeeklyInsights,
  chatWithAI,
  getContextAwareAdvice,
} from "../services/groqService.js";
import { db } from "../config/firebase.js";

// ── POST /api/ai/recommend — Get personalized meal recommendations ─────
export async function recommendMeals(req, res) {
  try {
    const { uid, name } = req.user;

    // Get user goals
    const goalsSnap = await db.collection("goals").doc(uid).get();
    const goals = goalsSnap.exists ? goalsSnap.data() : { caloriesTarget: 2000, proteinTarget: 100 };

    // Get recent food logs (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logsSnap = await db
      .collection("foodLogs")
      .where("userId", "==", uid)
      .where("timestamp", ">=", yesterday.toISOString())
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    const recentLogs = logsSnap.docs.map((d) => d.data());

    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay = "morning";
    if (hour >= 11 && hour < 15) timeOfDay = "lunch";
    else if (hour >= 15 && hour < 18) timeOfDay = "afternoon";
    else if (hour >= 18 && hour < 21) timeOfDay = "dinner";
    else if (hour >= 21 || hour < 5) timeOfDay = "late night";

    const result = await getMealRecommendation({
      goals,
      recentLogs,
      timeOfDay,
      userName: name,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Recommend meals error:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
}

// ── POST /api/ai/insights — Get weekly nutrition insights ──────────────
export async function weeklyInsights(req, res) {
  try {
    const { uid, name } = req.user;

    // Get goals
    const goalsSnap = await db.collection("goals").doc(uid).get();
    const goals = goalsSnap.exists ? goalsSnap.data() : { caloriesTarget: 2000, proteinTarget: 100 };

    // Get past 7 days of logs
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logsSnap = await db
      .collection("foodLogs")
      .where("userId", "==", uid)
      .where("timestamp", ">=", weekAgo.toISOString())
      .orderBy("timestamp", "desc")
      .get();

    const weeklyLogs = logsSnap.docs.map((d) => d.data());

    if (weeklyLogs.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: "No food logs found for this week. Start logging your meals to get personalized insights!",
          strengths: [],
          improvements: ["Start logging your daily meals"],
          score: 0,
          encouragement: "Every journey begins with a single step. Log your first meal today! 🌱",
        },
      });
    }

    const result = await getWeeklyInsights({ weeklyLogs, goals, userName: name });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Weekly insights error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
}

// ── POST /api/ai/chat — Conversational AI chatbot ─────────────────────
export async function chat(req, res) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Keep only last 10 messages for context window
    const recentMessages = messages.slice(-10);
    const reply = await chatWithAI(recentMessages);

    res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
}

// ── GET /api/ai/context-advice — Context-aware advice ──────────────────
export async function contextAdvice(req, res) {
  try {
    const { uid } = req.user;
    const currentHour = new Date().getHours();

    // Get today's logs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const logsSnap = await db
      .collection("foodLogs")
      .where("userId", "==", uid)
      .where("timestamp", ">=", todayStart.toISOString())
      .orderBy("timestamp", "desc")
      .get();

    const todayLogs = logsSnap.docs.map((d) => d.data());
    const lastMeal = todayLogs.length > 0 ? todayLogs[0] : null;

    const result = await getContextAwareAdvice({ currentHour, lastMeal, todayLogs });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Context advice error:", error);
    res.status(500).json({ error: "Failed to generate context advice" });
  }
}
