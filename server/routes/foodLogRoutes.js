// Food Log Routes
import { Router } from "express";
import { createFoodLog, getFoodLogs, deleteFoodLog, getFoodLogStats } from "../controllers/foodLogController.js";

const router = Router();

router.get("/stats", getFoodLogStats);   // Must be before /:id
router.get("/", getFoodLogs);
router.post("/", createFoodLog);
router.delete("/:id", deleteFoodLog);

export default router;
