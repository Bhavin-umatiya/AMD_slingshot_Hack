// AI Routes
import { Router } from "express";
import { recommendMeals, weeklyInsights, chat, contextAdvice } from "../controllers/aiController.js";

const router = Router();

router.post("/recommend", recommendMeals);
router.post("/insights", weeklyInsights);
router.post("/chat", chat);
router.get("/context-advice", contextAdvice);

export default router;
