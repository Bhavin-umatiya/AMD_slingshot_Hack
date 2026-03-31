// GROQ API Service
// Wraps all AI interactions using llama3-70b-8192 model
import Groq from "groq-sdk";

let groq = null;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
} catch (error) {
  console.warn("⚠️ GROQ_API_KEY is missing! AI endpoints will fail if called.");
  // Provide dummy object so it doesn't crash the entire server
  groq = { chat: { completions: { create: async () => ({ choices: [{ message: { content: "AI is currently offline. Please configure GROQ_API_KEY in the environment." } }] }) } } };
}

const MODEL = "llama3-70b-8192";

// ── Helper: call Groq with a system prompt + user message ──────────────
async function callGroq(systemPrompt, userMessage, temperature = 0.7) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature,
    max_tokens: 1024,
  });
  return response.choices[0]?.message?.content || "";
}

// ── 1. Meal Recommendation Engine ──────────────────────────────────────
export async function getMealRecommendation({ goals, recentLogs, timeOfDay, userName }) {
  const systemPrompt = `You are NutriAI, a friendly and expert nutritionist AI assistant.
You provide personalized meal recommendations based on the user's goals, recent eating history, and time of day.
Always respond in a warm, encouraging tone. Format your response as JSON with this structure:
{
  "greeting": "personalized greeting",
  "meals": [
    {
      "name": "meal name",
      "description": "brief description",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "reason": "why this meal is recommended"
    }
  ],
  "tip": "a quick health tip"
}
Suggest 3 meals. Keep calorie/macro numbers realistic.`;

  const userMessage = `
User: ${userName}
Time of day: ${timeOfDay}
Goals: Daily calories target: ${goals.caloriesTarget || 2000}, Protein target: ${goals.proteinTarget || 100}g
Recent food logs (last 24h): ${recentLogs.length > 0 ? JSON.stringify(recentLogs) : "No recent logs"}

Please recommend 3 meals appropriate for ${timeOfDay}. Consider what they've already eaten today.`;

  const result = await callGroq(systemPrompt, userMessage, 0.8);

  // Try to parse as JSON, fallback to raw text
  try {
    return JSON.parse(result);
  } catch {
    return { raw: result };
  }
}

// ── 2. Weekly Insights Generator ───────────────────────────────────────
export async function getWeeklyInsights({ weeklyLogs, goals, userName }) {
  const systemPrompt = `You are NutriAI, a smart nutrition analyst.
Analyze the user's weekly food logs and generate insightful, human-like feedback.
Respond in JSON format:
{
  "summary": "2-3 sentence overview of the week",
  "strengths": ["positive observations"],
  "improvements": ["areas to improve"],
  "score": number (1-100 health score for the week),
  "encouragement": "motivational closing message"
}`;

  const userMessage = `
User: ${userName}
Weekly calorie target: ${goals.caloriesTarget || 2000}/day
Weekly protein target: ${goals.proteinTarget || 100}g/day
Food logs from the past 7 days:
${JSON.stringify(weeklyLogs, null, 2)}

Analyze this week's nutrition and give feedback.`;

  const result = await callGroq(systemPrompt, userMessage, 0.7);

  try {
    return JSON.parse(result);
  } catch {
    return { raw: result };
  }
}

// ── 3. Conversational AI Chatbot ───────────────────────────────────────
export async function chatWithAI(conversationHistory) {
  const systemPrompt = `You are NutriAI, a friendly and knowledgeable nutrition assistant chatbot.
You help users with:
- Food and meal questions ("What should I eat?")
- Nutrition information ("How many calories in an apple?")
- Healthy eating tips and advice
- Context-aware suggestions based on time of day
- Recovery advice if they mention eating junk food

Current time context: ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
Current hour: ${new Date().getHours()}

Be conversational, warm, and concise. Use emojis sparingly. Keep responses under 150 words unless detailed info is requested.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
  ];

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.8,
    max_tokens: 512,
  });

  return response.choices[0]?.message?.content || "I'm having trouble thinking right now. Try again!";
}

// ── 4. Context-Aware Intelligence ──────────────────────────────────────
export async function getContextAwareAdvice({ currentHour, lastMeal, todayLogs }) {
  let context = "";
  if (currentHour >= 5 && currentHour < 11) context = "morning/breakfast time";
  else if (currentHour >= 11 && currentHour < 15) context = "lunch time";
  else if (currentHour >= 15 && currentHour < 18) context = "afternoon snack time";
  else if (currentHour >= 18 && currentHour < 21) context = "dinner time";
  else context = "late night — light meal recommended";

  // Check for junk food in recent logs
  const junkKeywords = ["pizza", "burger", "fries", "soda", "candy", "chips", "ice cream", "cake", "donut"];
  const recentJunk = todayLogs.filter((log) =>
    junkKeywords.some((kw) => log.foodName?.toLowerCase().includes(kw))
  );

  const systemPrompt = `You are NutriAI providing context-aware nutrition advice.
Respond in JSON format:
{
  "context": "time context description",
  "advice": "personalized advice",
  "suggestedMeal": { "name": "string", "calories": number, "description": "string" },
  "warning": "optional warning if junk food detected, null otherwise"
}`;

  const userMessage = `
Time context: ${context} (hour: ${currentHour})
Last meal eaten: ${lastMeal ? JSON.stringify(lastMeal) : "Unknown"}
Today's food logs: ${JSON.stringify(todayLogs)}
Recent junk food detected: ${recentJunk.length > 0 ? JSON.stringify(recentJunk) : "None"}

${recentJunk.length > 0 ? "The user recently ate junk food. Provide gentle recovery advice and suggest healthy alternatives." : "Provide appropriate meal suggestions for the current time."}`;

  const result = await callGroq(systemPrompt, userMessage, 0.7);

  try {
    return JSON.parse(result);
  } catch {
    return { raw: result };
  }
}
