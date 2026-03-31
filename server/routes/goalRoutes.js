// Goal Routes
import { Router } from "express";
import { getGoals, updateGoals, getStreak } from "../controllers/goalController.js";

const router = Router();

router.get("/streak", getStreak);   // Must be before potential /:id
router.get("/", getGoals);
router.put("/", updateGoals);

export default router;
