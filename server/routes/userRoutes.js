// User Routes
import { Router } from "express";
import { syncUser, getProfile, updateProfile } from "../controllers/userController.js";

const router = Router();

router.post("/sync", syncUser);
router.get("/me", getProfile);
router.put("/me", updateProfile);

export default router;
